using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace API.SignalR;

[Authorize]
public class MessageHub : Hub
{
    private static readonly ConcurrentDictionary<string, string> UserConnections = new();
    public override Task OnConnectedAsync()
    {
        var userId = Context.User?.GetId();
        if (!string.IsNullOrEmpty(userId)) UserConnections[userId] = Context.ConnectionId;

        Console.WriteLine($"Connection ID: {Context.ConnectionId}");
        Console.WriteLine($"User Identifier: {Context.UserIdentifier}");
        Console.WriteLine($"NameIdentifier: {Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value}");
        Console.WriteLine($"Name: {Context.User?.Identity?.Name}");
        return base.OnConnectedAsync();
        // var httpContext = Context.GetHttpContext();
        // var otherUser = httpContext?.Request.Query["userId"]
        //     ?? throw new HubException("Other user not found");
        // var groupName = GetGroupName(Context.User?.GetId(), otherUser);
        // await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        // await Clients.Group(groupName).SendAsync("ReceviedMessageThread", mesaage);
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.GetId();
        if (!string.IsNullOrEmpty(userId)) UserConnections.TryRemove(userId, out _);
        return base.OnDisconnectedAsync(exception);
    }

    public static string? GetConnectionIdByUserId(string userId)
    {
        UserConnections.TryGetValue(userId, out var ConnectionId);
        return ConnectionId;
    }

    // private static string GetGroupName(string? caller, string? other)
    // {
    //     var stringCompare = string.CompareOrdinal(caller, other) < 0;
    //     return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
    // }
}
