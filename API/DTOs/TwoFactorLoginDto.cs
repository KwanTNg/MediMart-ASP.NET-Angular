using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class TwoFactorLoginDto
{
    [Required]
    public string Email { get; set; } = string.Empty;
    [Required]
    public string Code { get; set; } = string.Empty;
}
