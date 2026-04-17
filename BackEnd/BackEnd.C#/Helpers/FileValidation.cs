using System.IO;
using System.Linq;

namespace BackEnd.C_.Helpers;

public static class FileValidation
{
    public static readonly long MaxFileSizeBytes = 100 * 1024 * 1024; // 100 MB

    private static readonly string[] AllowedExtensions =
    {
        ".pdf", ".jpg", ".jpeg", ".png", ".docx", ".xlsx", ".txt", ".zip", ".exe"
    };

    private static readonly string[] BlockedNameTokens =
    {
        "virus", "malware", "trojan", "worm", "ransom", "keygen", "crack",
        "hack", "payload", "botnet", "spyware", "adware", "rootkit", "stealer",
        "backdoor", "exploit", "phishing"
    };

    public static (bool IsValid, string? Error) Validate(string fileName, long fileSizeBytes)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var normalizedName = fileName.ToLowerInvariant();

        if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
        {
            return (false, $"File type '{extension}' is not permitted.");
        }

        if (BlockedNameTokens.Any(token => normalizedName.Contains(token)))
        {
            return (false, "File name appears suspicious and cannot be uploaded.");
        }

        if (fileSizeBytes <= 0 || fileSizeBytes > MaxFileSizeBytes)
        {
            return (false, "File size must be between 1 byte and 100 MB.");
        }

        return (true, null);
    }
}
