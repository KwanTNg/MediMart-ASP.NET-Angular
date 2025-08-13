using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class ContactRequestDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    [Required]
    public string Email { get; set; } = string.Empty;
    [Required]
    public string Message { get; set; } = string.Empty;
    [Required]
    public string CaptchaToken { get; set; } = string.Empty;
    public IFormFile? Attachment { get; set; }
}
