using Supabase.Postgrest.Models;

namespace BackEnd.C_.Services;

public interface IFileMetadataService
{
    Task<FileMetadata> InsertAsync(FileMetadata metadata);
    Task<List<FileMetadata>> GetFilesByUserAsync(Guid userId);
    Task<FileMetadata?> GetByIdAsync(Guid fileId, Guid userId);
    Task DeleteAsync(Guid fileId);
}
