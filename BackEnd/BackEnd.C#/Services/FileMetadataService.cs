using Supabase;
using Supabase.Postgrest.Models;

namespace BackEnd.C_.Services;

public class FileMetadataService : IFileMetadataService
{
    private readonly Supabase.Client _supabase;

    public FileMetadataService(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<FileMetadata> InsertAsync(FileMetadata metadata)
    {
        await _supabase.From<FileMetadata>().Insert(metadata);
        return metadata;
    }

    public async Task<List<FileMetadata>> GetFilesByUserAsync(Guid userId)
    {
        var response = await _supabase.From<FileMetadata>()
            .Where(x => x.UserId == userId)
            .Get();

        return response.Models;
    }

    public async Task<FileMetadata?> GetByIdAsync(Guid fileId, Guid userId)
    {
        return await _supabase.From<FileMetadata>()
            .Where(x => x.Id == fileId && x.UserId == userId)
            .Single();
    }

    public async Task DeleteAsync(Guid fileId)
    {
        await _supabase.From<FileMetadata>()
            .Where(x => x.Id == fileId)
            .Delete();
    }
}
