namespace API.DTOs;

public class SalesByStatusDto
{
    public string Status { get; set; } = null!;
    public decimal TotalRevenue { get; set; }
}
