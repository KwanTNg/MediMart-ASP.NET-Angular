namespace API.DTOs;

public class DispatchTimeBucket
{
    public required string Label { get; set; }
    public double Min { get; set; }
    public double Max { get; set; }
}