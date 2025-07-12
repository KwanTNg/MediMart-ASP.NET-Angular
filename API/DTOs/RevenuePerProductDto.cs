namespace API.DTOs;

public class RevenuePerProductDto
{
    public string ProductName { get; set; } = string.Empty;
    public decimal TotalRevenue { get; set; }
}
