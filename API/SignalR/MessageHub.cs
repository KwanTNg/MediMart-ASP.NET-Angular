using Microsoft.AspNetCore.SignalR;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace API.SignalR;

[Authorize]
public class MessageHub : Hub
{
    public override Task OnConnectedAsync()
    {

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

    // private static string GetGroupName(string? caller, string? other)
    // {
    //     var stringCompare = string.CompareOrdinal(caller, other) < 0;
    //     return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
    // }
}
