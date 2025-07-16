using System.Linq.Expressions;
using API.DTOs;
using Core.Entities;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace API.Extensions;

public static class MessageExtensions
{
    public static MessageDto ToDto(this Message message)
    {
        return new MessageDto
        {
            Id = message.Id,
            SenderId = message.SenderId,
            SenderDisplayName = message.Sender.FirstName ?? "No Name",
            RecipientId = message.RecipientId,
            RecipientDisplayName = message.Recipient.FirstName ?? "No Name",
            Content = message.Content,
            DateRead = message.DateRead,
            MessageSent = message.MessageSent
        };
    }

    public static Expression<Func<Message, MessageDto>> ToDtoProjection()
    {
        return message => new MessageDto
        {
            Id = message.Id,
            SenderId = message.SenderId,
            SenderDisplayName = message.Sender.FirstName,
            RecipientId = message.RecipientId,
            RecipientDisplayName = message.Recipient.FirstName,
            Content = message.Content,
            DateRead = message.DateRead,
            MessageSent = message.MessageSent
        };
    }

}
