namespace API.DTOs;

public class MessageDto
{
    public int Id { get; set; }
    public string SenderId { get; set; }
    public string SenderDisplayName { get; set; }
    public string RecipientId { get; set; }
    public string RecipientDisplayName { get; set; }
    public string Content { get; set; }
    public DateTime? DateRead { get; set; }
    public DateTime MessageSent { get; set; }
    public bool IsFromAdmin { get; set; }

}
