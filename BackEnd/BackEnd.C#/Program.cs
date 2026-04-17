using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using Supabase;
using BackEnd.C_.Services;
using BackEnd.C_.Extensions;
using BackEnd.C_.Helpers;

var builder = WebApplication.CreateBuilder(args);

// ─── 1. SERVICES ─────────────────────────────────────────────────────────────

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("https://the-cloud-storage.vercel.app")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var azureConnectionString = builder.Configuration["AzureStorage:ConnectionString"]
    ?? throw new InvalidOperationException("AzureStorage:ConnectionString missing.");
var supabaseUrl = builder.Configuration["Supabase:Url"]
    ?? throw new InvalidOperationException("Supabase:Url missing.");
var supabaseKey = builder.Configuration["Supabase:AnonKey"]
    ?? throw new InvalidOperationException("Supabase:AnonKey missing.");

builder.Services.AddSingleton(new BlobServiceClient(azureConnectionString));
builder.Services.AddSingleton(_ => new Supabase.Client(supabaseUrl, supabaseKey));
builder.Services.AddSingleton<IBlobStorageService, BlobStorageService>();
builder.Services.AddSingleton<IFileMetadataService, FileMetadataService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"{supabaseUrl}/auth/v1";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"{supabaseUrl}/auth/v1",
            ValidateAudience = true,
            ValidAudience = "authenticated",
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// ─── 2. MIDDLEWARE PIPELINE ──────────────────────────────────────────────────

app.UseRouting();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();

// ─── 3. STARTUP CHECKS ───────────────────────────────────────────────────────

var blobStorageService = app.Services.GetRequiredService<IBlobStorageService>();
await blobStorageService.EnsureContainerAsync();

// ─── 4. ENDPOINTS ────────────────────────────────────────────────────────────

app.MapPost("/api/upload/initiate", async ([FromBody] UploadRequest? request, ClaimsPrincipal user, IBlobStorageService blobStorage) =>
{
    if (request == null)
        return Results.BadRequest(new { Error = "Upload request body is required." });

    var userId = user.GetUserId();
    if (string.IsNullOrEmpty(userId)) return Results.Unauthorized();

    if (string.IsNullOrWhiteSpace(request.FileName))
        return Results.BadRequest(new { Error = "FileName is required." });

    if (request.FileSizeBytes <= 0)
        return Results.BadRequest(new { Error = "File size must be greater than zero." });

    var (isValid, error) = FileValidation.Validate(request.FileName, request.FileSizeBytes);
    if (!isValid) return Results.BadRequest(new { Error = error });

    var fileType = string.IsNullOrWhiteSpace(request.FileType)
        ? "application/octet-stream"
        : request.FileType;

    var blobPath = $"{userId}/{Guid.NewGuid()}{Path.GetExtension(request.FileName)}";
    var uploadUri = blobStorage.GenerateUploadSasUri(blobPath, fileType, TimeSpan.FromMinutes(10));

    return Results.Ok(new { UploadUrl = uploadUri.ToString(), BlobPath = blobPath });
}).RequireAuthorization();

app.MapPost("/api/upload/complete", async ([FromBody] CompleteUploadRequest? request, ClaimsPrincipal user, IFileMetadataService metadataService) =>
{
    if (request == null)
        return Results.BadRequest(new { Error = "Upload completion request body is required." });

    var userIdString = user.GetUserId();
    if (string.IsNullOrEmpty(userIdString)) return Results.Unauthorized();

    if (string.IsNullOrWhiteSpace(request.BlobPath) || string.IsNullOrWhiteSpace(request.FileName))
        return Results.BadRequest(new { Error = "BlobPath and FileName are required." });

    if (!request.BlobPath.StartsWith($"{userIdString}/")) return Results.Forbid();

    var metadata = new FileMetadata
    {
        Id = Guid.NewGuid(),
        UserId = Guid.Parse(userIdString),
        BlobPath = request.BlobPath,
        FileName = request.FileName,
        Size = request.FileSizeBytes,
        CreatedAt = DateTimeOffset.UtcNow
    };

    await metadataService.InsertAsync(metadata);
    return Results.Created($"/api/files/{metadata.Id}", metadata.ToDto());
}).RequireAuthorization();

app.MapGet("/api/files", async (ClaimsPrincipal user, IFileMetadataService metadataService) =>
{
    var userIdString = user.GetUserId();
    if (string.IsNullOrEmpty(userIdString)) return Results.Unauthorized();

    var files = await metadataService.GetFilesByUserAsync(Guid.Parse(userIdString));
    return Results.Ok(files.Select(m => m.ToDto()));
}).RequireAuthorization();

app.MapGet("/api/files/download/{fileId:guid}", async (
    Guid fileId,
    ClaimsPrincipal user,
    IFileMetadataService metadataService,
    IBlobStorageService blobStorage) =>
{
    var userIdString = user.GetUserId();
    if (string.IsNullOrEmpty(userIdString)) return Results.Unauthorized();

    var fileRecord = await metadataService.GetByIdAsync(fileId, Guid.Parse(userIdString));
    if (fileRecord == null) return Results.NotFound(new { Error = "File not found or access denied." });

    var downloadUrl = blobStorage.GenerateDownloadSasUri(fileRecord.BlobPath, TimeSpan.FromMinutes(1));
    return Results.Ok(new { DownloadUrl = downloadUrl.ToString(), ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(1) });
}).RequireAuthorization();

app.MapDelete("/api/files/{fileId:guid}", async (
    Guid fileId,
    ClaimsPrincipal user,
    IFileMetadataService metadataService,
    IBlobStorageService blobStorage) =>
{
    var userIdString = user.GetUserId();
    if (string.IsNullOrEmpty(userIdString)) return Results.Unauthorized();

    var fileRecord = await metadataService.GetByIdAsync(fileId, Guid.Parse(userIdString));
    if (fileRecord == null) return Results.NotFound(new { Error = "File not found or access denied." });

    await blobStorage.DeleteBlobIfExistsAsync(fileRecord.BlobPath);
    await metadataService.DeleteAsync(fileId);
    return Results.NoContent();
}).RequireAuthorization();

app.Run();
