namespace Core.Entities;

public class ResetPassword
{
    public required string UserId { get; set; }
    public required string Token { get; set; }
    public required string NewPassword { get; set; }

}
