public record UploadRequest(string FileName, long FileSizeBytes, string FileType);

public record CompleteUploadRequest(string BlobPath, string FileName, long FileSizeBytes);