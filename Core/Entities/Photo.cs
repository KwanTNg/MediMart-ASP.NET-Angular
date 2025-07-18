using System.Text.Json.Serialization;

namespace Core.Entities;

public class Photo : BaseEntity
{
    public required string Url { get; set; }
    public string? PublicId { get; set; }

    //Navigation property
    [JsonIgnore]
    public Product Product { get; set; } = null!;
    //Foreign key
    public int ProductId { get; set; }

}
