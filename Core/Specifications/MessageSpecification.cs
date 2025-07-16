using Core.Entities;

namespace Core.Specifications;

public class MessageSpecification : BaseSpecification<Message>
{
    public MessageSpecification(MessageParams messageParams) : base(BuildCriteria(messageParams))
    {
        AddInclude(m => m.Sender);
        AddInclude(m => m.Recipient);
        AddOrderByDescending(m => m.MessageSent);
        ApplyPaging((messageParams.PageIndex - 1) * messageParams.PageSize, messageParams.PageSize);
    }

    public MessageSpecification(string currentUserId, string recipientId) 
        : base(m =>
            (m.SenderId == currentUserId && m.RecipientId == recipientId) ||
            (m.SenderId == recipientId && m.RecipientId == currentUserId))
    {
        AddInclude(m => m.Sender);
        AddInclude(m => m.Recipient);
        AddOrderBy(m => m.MessageSent);
    }

    private static System.Linq.Expressions.Expression<Func<Message, bool>> BuildCriteria(MessageParams messageParams)
    {
        return messageParams.Container switch
        {
            "Outbox" => m => m.SenderId == messageParams.UserId && !m.SenderDeleted,
            "Unread" => m => m.RecipientId == messageParams.UserId && m.DateRead == default && !m.RecipientDeleted,
            _ => m => m.RecipientId == messageParams.UserId && !m.RecipientDeleted
        };
    }
}

