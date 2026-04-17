namespace BackEnd.C_.Extensions;

public static class FileMetadataExtensions
{
    public static FileMetadataDto ToDto(this FileMetadata metadata)
    {
        return new FileMetadataDto(metadata.Id, metadata.UserId, metadata.BlobPath, metadata.FileName, metadata.Size, metadata.CreatedAt);
    }
}
