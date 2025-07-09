using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class ChangeUserRoleDto
{
    [Required]
    public string Email { get; set; } = string.Empty;
    [Required]
    public string NewRole { get; set; } = string.Empty; // e.g., "Pharmacist"
}
