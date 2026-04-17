using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

// This line tells C# to look for the "files" table in Supabase
[Table("files")] 
public class FileMetadata : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; } 

    [Column("blob_path")]
    public string BlobPath { get; set; } = string.Empty;

    [Column("file_name")]
    public string FileName { get; set; } = string.Empty;

    [Column("size")]
    public long Size { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
}