namespace Core.Entities;

public class SalesSummary : BaseEntity
{
    public required DateTime Data { get; set; }
    public required int TotalQuantitySold { get; set; }
    public required decimal TotalRevenue { get; set; }
    //link to product for specific summaries
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

}
