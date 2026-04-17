using System.Security.Claims;

namespace BackEnd.C_.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string? GetUserId(this ClaimsPrincipal principal)
    {
        return principal.FindFirst("sub")?.Value ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}
