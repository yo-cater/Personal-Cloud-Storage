// Simple DTO for JSON responses — no Postgrest attributes
public record FileMetadataDto(Guid Id, Guid UserId, string BlobPath, string FileName, long Size, DateTimeOffset CreatedAt);
