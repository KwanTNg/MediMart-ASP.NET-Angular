using API.DTOs;
using API.RequestHelpers;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;


public class ProductsController(IUnitOfWork unit) : BaseApiController
{
    [Cache(900)] //cache live for 15 minutes
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetProducts([FromQuery]ProductSpecParams specParams)
    {
        var spec = new ProductSpecification(specParams);


        return await CreatePagedResult(unit.Repository<Product>(), spec, specParams.PageIndex, specParams.PageSize,
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
            Category = product.Category,
            SymptomIds = product.ProductSymptoms?.Select(ps => ps.SymptomId).ToList() ?? new List<int>()
        });
    }

    [Cache(900)]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await unit.Repository<Product>().GetByIdAsync(id);
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
            Category = product.Category,           
            SymptomIds = product.ProductSymptoms
                        .Select(ps => ps.SymptomId)
                        .ToList()
        };
        return productDto;
    }

    //When this is called, all keys with pattern "api/products" in redis will be removed
    [InvalidateCache("api/products|")]
    [Authorize(Roles = "Admin")]
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
        Category = dto.Category,
        ProductSymptoms = dto.SymptomIds.Select(sid => new ProductSymptom
        {
            SymptomId = sid
        }).ToList()
    };

        unit.Repository<Product>().Add(product);
        if (await unit.Complete())
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
            Category = product.Category,
            SymptomIds = product.ProductSymptoms.Select(ps => ps.SymptomId).ToList()
        };
            return CreatedAtAction("GetProduct", new { id = product.Id }, productDto);
        }
        return BadRequest("Problem creating product");
    }

    [InvalidateCache("api/products|")]
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateProduct(int id, CreateProductDto dto)
    {
        var product = await unit.Repository<Product>()
            .GetEntityWithSpec(new ProductWithSymptomsSpecification(id));
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
        product.Category = dto.Category;

        // Update symptoms (many-to-many)
        product.ProductSymptoms = dto.SymptomIds
            .Select(sid => new ProductSymptom
            {
                SymptomId = sid,
                ProductId = product.Id
            }).ToList();

        unit.Repository<Product>().Update(product);
        if (await unit.Complete())
        {
            return NoContent();
        }
        return BadRequest("Problem updating the product");
    }

    [InvalidateCache("api/products|")]
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await unit.Repository<Product>().GetByIdAsync(id);
        if (product == null) return NotFound();
        unit.Repository<Product>().Remove(product);
        if (await unit.Complete())
        {
            return NoContent();
        }
        return BadRequest("Problem deleting the product");
    }

    [Cache(14400)] //Since it is a static list, can cache longer, 6hr
    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetBrands()
    {
        var spec = new BrandListSpecification();
        return Ok(await unit.Repository<Product>().ListAsync(spec));
    }

    [Cache(14400)] 
    [HttpGet("types")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetTypes()
    {
        var spec = new TypeListSpecification();
        return Ok(await unit.Repository<Product>().ListAsync(spec));
    }

    [Cache(14400)] 
    [HttpGet("categories")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetCategories()
    {
        var spec = new CategoryListSpecification();
        return Ok(await unit.Repository<Product>().ListAsync(spec));
    }

    private bool ProductExists(int id)
    {
        return unit.Repository<Product>().Exists(id);
    }
}
