namespace API.DTOs;

public class CreateMessageDto
{
    public string? RecipientId { get; set; }
    public required string Content { get; set; }
}
