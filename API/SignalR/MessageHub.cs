using Microsoft.AspNetCore.SignalR;
using API.Extensions;

namespace API.SignalR;

public class MessageHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var otherUser = httpContext?.Request.Query["userId"]
            ?? throw new HubException("Other user not found");
        var groupName = GetGroupName(Context.User?.GetId(), otherUser);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        // await Clients.Group(groupName).SendAsync("ReceviedMessageThread", mesaage);
    }

    private static string GetGroupName(string? caller, string? other)
    {
        var stringCompare = string.CompareOrdinal(caller, other) < 0;
        return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
    }
}
