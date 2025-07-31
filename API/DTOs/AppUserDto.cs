namespace API.DTOs;

public class AppUserDto
{
    public string Id { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PhoneNumber { get; set; } = "";
    public bool EmailConfirmed { get; set; }
    public IList<string> Roles { get; set; } 
}