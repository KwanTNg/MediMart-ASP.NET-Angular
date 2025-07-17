namespace Core.Entities;

public class Message : BaseEntity
{
    public required string Content { get; set; }
    public DateTime? DateRead { get; set; }
    public DateTime MessageSent { get; set; } = DateTime.UtcNow;
    public bool SenderDeleted { get; set; }
    public bool RecipientDeleted { get; set; }
    // nav properties
    public required string SenderId { get; set; }
    public AppUser Sender { get; set; } = null!;
    public required string RecipientId { get; set; }
    public AppUser Recipient { get; set; } = null!;

}
