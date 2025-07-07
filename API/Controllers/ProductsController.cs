using API.DTOs;
using API.RequestHelpers;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;


public class ProductsController(IGenericRepository<Product> repo) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetProducts([FromQuery]ProductSpecParams specParams)
    {
        var spec = new ProductSpecification(specParams);


        return await CreatePagedResult(repo, spec, specParams.PageIndex, specParams.PageSize,
        product => new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            PictureUrl = product.PictureUrl,
            Type = product.Type,
            Brand = product.Brand,
            QuantityInStock = product.QuantityInStock,
            CategoryId = product.CategoryId,
            SymptomIds = product.ProductSymptoms?.Select(ps => ps.SymptomId).ToList() ?? new List<int>()
        });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await repo.GetByIdAsync(id);
        if (product == null) return NotFound();
        var productDto = new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            PictureUrl = product.PictureUrl,
            Type = product.Type,
            Brand = product.Brand,
            QuantityInStock = product.QuantityInStock,
            CategoryId = product.CategoryId,           
            SymptomIds = product.ProductSymptoms
                        .Select(ps => ps.SymptomId)
                        .ToList()
        };
        return productDto;
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(CreateProductDto dto)
    {
        var product = new Product
    {
        Name = dto.Name,
        Description = dto.Description,
        Price = dto.Price,
        PictureUrl = dto.PictureUrl,
        Type = dto.Type,
        Brand = dto.Brand,
        QuantityInStock = dto.QuantityInStock,
        CategoryId = dto.CategoryId,
        ProductSymptoms = dto.SymptomIds.Select(sid => new ProductSymptom
        {
            SymptomId = sid
        }).ToList()
    };

        repo.Add(product);
        if (await repo.SaveAllAsync())
        {
        var productDto = new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            PictureUrl = product.PictureUrl,
            Type = product.Type,
            Brand = product.Brand,
            QuantityInStock = product.QuantityInStock,
            CategoryId = product.CategoryId,
            SymptomIds = product.ProductSymptoms.Select(ps => ps.SymptomId).ToList()
        };
            return CreatedAtAction("GetProduct", new { id = product.Id }, productDto);
        }
        return BadRequest("Problem creating product");
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateProduct(int id, CreateProductDto dto)
    {
        var product = await repo.GetByIdAsync(id);
        if (product == null)
            return NotFound("Product not found");

        // Update fields
        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.PictureUrl = dto.PictureUrl;
        product.Type = dto.Type;
        product.Brand = dto.Brand;
        product.QuantityInStock = dto.QuantityInStock;
        product.CategoryId = dto.CategoryId;

        // Update many-to-many symptoms
        product.ProductSymptoms.Clear();
        foreach (var sid in dto.SymptomIds)
        {
            product.ProductSymptoms.Add(new ProductSymptom
            {
                SymptomId = sid,
                ProductId = product.Id
            });
        }

        repo.Update(product);
        if (await repo.SaveAllAsync())
        {
            return NoContent();
        }
        return BadRequest("Problem updating the product");
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await repo.GetByIdAsync(id);
        if (product == null) return NotFound();
        repo.Remove(product);
        if (await repo.SaveAllAsync())
        {
            return NoContent();
        }
        return BadRequest("Problem deleting the product");
    }

    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetBrands()
    {
        var spec = new BrandListSpecification();
        return Ok(await repo.ListAsync(spec));
    }
    [HttpGet("types")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetTypes()
    {
        var spec = new TypeListSpecification();
        return Ok(await repo.ListAsync(spec));
    }

    private bool ProductExists(int id)
    {
        return repo.Exists(id);
    }
}
