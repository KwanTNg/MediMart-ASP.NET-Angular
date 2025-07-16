using Core.Entities;

namespace Core.Specifications;

public class MessageThreadSpecification : BaseSpecification<Message>
{
    public MessageThreadSpecification(string currentUserId, string recipientId)
        : base(m =>
            (m.SenderId == currentUserId && m.RecipientId == recipientId && !m.SenderDeleted) ||
            (m.SenderId == recipientId && m.RecipientId == currentUserId && !m.RecipientDeleted))
    {
        AddInclude(m => m.Sender);
        AddInclude(m => m.Recipient);
        AddOrderBy(m => m.MessageSent); // Order by oldest to newest
    }
}

