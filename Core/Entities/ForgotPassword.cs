namespace Core.Entities;

public class ForgotPassword
{
    public string Email { get; set; }
    public bool EmailSent { get; set; } = false;
}
