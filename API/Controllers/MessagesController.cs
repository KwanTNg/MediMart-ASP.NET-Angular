using System;
using API.DTOs;
using API.Extensions;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class MessagesController(IUnitOfWork unit, UserManager<AppUser> userManager) : BaseApiController
{
    //Login as sender, need to provide recipient ID in order to send message
    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    {
        var sender = User.GetId();
        var senderUser = await userManager.FindByIdAsync(sender);
        Console.WriteLine(sender);
        var recipient = await userManager.FindByIdAsync(createMessageDto.RecipientId);
        Console.WriteLine(sender);

        if (recipient == null || sender == null || sender == createMessageDto.RecipientId)
            return BadRequest("Cannot send this message");

        var message = new Message
        {
            SenderId = sender,
            Sender = senderUser,
            RecipientId = recipient.Id,
            Recipient = recipient,
            Content = createMessageDto.Content
        };
        unit.Repository<Message>().Add(message);
        if (await unit.Complete()) return message.ToDto();
        return BadRequest("Failed to send message");
    }

    //For message recipient, need to login as recipient to check the inbox
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MessageDto>>> GetMessagesByContainer([FromQuery] MessageParams messageParams)
    {
    messageParams.UserId = User.GetId();

    Console.WriteLine($"Getting messages for user {messageParams.UserId}, container: {messageParams.Container}");
    var spec = new MessageSpecification(messageParams);

    return await CreatePagedResult<Message, MessageDto>(
        unit.Repository<Message>(),    
        spec,
        messageParams.PageIndex,
        messageParams.PageSize,
        m => m.ToDto()                 
    );
    }

    [HttpGet("thread/{recipientId}")]
    public async Task<ActionResult<IReadOnlyList<MessageDto>>> GetMessageThread(string recipientId)
    {
        var userId = User.GetId();
        var spec = new MessageThreadSpecification(userId, recipientId);
        var messages = await unit.Repository<Message>().ListAsync(spec);

        var dtoMessages = messages.Select(m => m.ToDto()).ToList();
        return Ok(dtoMessages);
    }

    // [HttpDelete("id")] use ( ) for string { } for int
    [HttpDelete("{id}")] 
    public async Task<ActionResult> DeleteMessage(int id)
    {
        var userId = User.GetId();
        var message = await unit.Repository<Message>().GetByIdAsync(id);

        if (message == null) return BadRequest("Cannot delete this message");

        if (message.SenderId != userId && message.RecipientId != userId)
            return BadRequest("You cannot delete this message");

        if (message.SenderId == userId) message.SenderDeleted = true;
        if (message.RecipientId == userId) message.RecipientDeleted = true;

        if (message is { SenderDeleted: true, RecipientDeleted: true })
        {
            unit.Repository<Message>().Remove(message);
        }
        if (await unit.Complete()) return Ok();

        return BadRequest("Problem deleting the message");
    }

}
