using Azure.Storage.Blobs;
using Azure.Storage.Sas;

namespace BackEnd.C_.Services;

public class BlobStorageService : IBlobStorageService
{
    private const string ContainerName = "user-uploads";
    private readonly BlobServiceClient _blobServiceClient;

    public BlobStorageService(BlobServiceClient blobServiceClient)
    {
        _blobServiceClient = blobServiceClient;
    }

    public async Task EnsureContainerAsync()
    {
        var container = _blobServiceClient.GetBlobContainerClient(ContainerName);
        await container.CreateIfNotExistsAsync();
    }

    public Uri GenerateUploadSasUri(string blobPath, string contentType, TimeSpan validFor)
    {
        var blobClient = _blobServiceClient.GetBlobContainerClient(ContainerName).GetBlobClient(blobPath);
        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = ContainerName,
            BlobName = blobPath,
            Resource = "b",
            ExpiresOn = DateTimeOffset.UtcNow.Add(validFor),
            ContentType = contentType
        };
        sasBuilder.SetPermissions(BlobSasPermissions.Write | BlobSasPermissions.Create);

        return blobClient.GenerateSasUri(sasBuilder);
    }

    public Uri GenerateDownloadSasUri(string blobPath, TimeSpan validFor)
    {
        var blobClient = _blobServiceClient.GetBlobContainerClient(ContainerName).GetBlobClient(blobPath);
        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = ContainerName,
            BlobName = blobPath,
            Resource = "b",
            ExpiresOn = DateTimeOffset.UtcNow.Add(validFor)
        };
        sasBuilder.SetPermissions(BlobSasPermissions.Read);

        return blobClient.GenerateSasUri(sasBuilder);
    }

    public Task DeleteBlobIfExistsAsync(string blobPath)
    {
        var blobClient = _blobServiceClient.GetBlobContainerClient(ContainerName).GetBlobClient(blobPath);
        return blobClient.DeleteIfExistsAsync();
    }
}
