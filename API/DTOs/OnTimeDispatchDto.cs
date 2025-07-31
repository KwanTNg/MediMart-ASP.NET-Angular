namespace API.DTOs;

public class OnTimeDispatchDto
{
    public int EligibleOrders { get; set; }
    public int OnTimeDeliveries { get; set; }
    public double OnTimeRate { get; set; } // percentage
}
