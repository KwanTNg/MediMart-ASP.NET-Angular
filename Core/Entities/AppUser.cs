using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace Core.Entities;

public class AppUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    //One-to-one relationship between user and address
    public Address? Address { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [JsonIgnore]
    public List<Message> MessageSent { get; set; } = [];
    [JsonIgnore]
    public List<Message> MessagesReceived { get; set; } = [];

}
