namespace Core.Specifications;

public class MessageParams : PagingParams
{
    public string? UserId { get; set; }
    public string Container { get; set; } = "Inbox";

}
