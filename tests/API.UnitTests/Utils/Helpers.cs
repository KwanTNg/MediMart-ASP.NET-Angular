using System.Security.Claims;

namespace API.UnitTests.Utils;

public class Helpers
{
    public static ClaimsPrincipal GetClaimsPrincipal()
    {
        var claims = new List<Claim> { new Claim("username", "test") };
        var identity = new ClaimsIdentity(claims, "Admin");
        return new ClaimsPrincipal(identity);
    }
}
