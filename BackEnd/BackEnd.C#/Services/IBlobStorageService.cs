namespace BackEnd.C_.Services;

public interface IBlobStorageService
{
    Task EnsureContainerAsync();
    Uri GenerateUploadSasUri(string blobPath, string contentType, TimeSpan validFor);
    Uri GenerateDownloadSasUri(string blobPath, TimeSpan validFor);
    Task DeleteBlobIfExistsAsync(string blobPath);
}
