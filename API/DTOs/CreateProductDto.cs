using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class CreateProductDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    [Required]
    public string Description { get; set; } = string.Empty;
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public decimal Price { get; set; }
    public string PictureUrl { get; set; } = string.Empty;
    [Required]
    public string Type { get; set; } = string.Empty;
    [Required]
    public string Brand { get; set; } = string.Empty;
    [Range(0, int.MaxValue, ErrorMessage = "Quantity value must be positive!")]
    public int QuantityInStock { get; set; }

    [Required]
    public string Category { get; set; } = string.Empty;
    public List<int> SymptomIds { get; set; } = new();
    public IFormFile? Picture { get; set; }

}

