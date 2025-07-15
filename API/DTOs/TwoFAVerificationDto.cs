using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class TwoFAVerificationDto
{
    [Required]
    public string Code { get; set; } = string.Empty;
}
