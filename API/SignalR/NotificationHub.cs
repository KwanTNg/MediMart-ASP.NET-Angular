using System.Collections.Concurrent;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

//Notify user by email address
[Authorize]
public class NotificationHub : Hub
{
    //first string is connection id, second string is email
    private static readonly ConcurrentDictionary<string, string> UserConnections = new();
    public override Task OnConnectedAsync()
    {
        var email = Context.User?.GetEmail();
        if (!string.IsNullOrEmpty(email)) UserConnections[email] = Context.ConnectionId;
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        var email = Context.User?.GetEmail();
        //remove email key from our user connection
        if (!string.IsNullOrEmpty(email)) UserConnections.TryRemove(email, out _);
        return base.OnDisconnectedAsync(exception);
    }

    public static string? GetConnectionIdByEmail(string email)
    {
        UserConnections.TryGetValue(email, out var ConnectionId);
        return ConnectionId;
    }

}
