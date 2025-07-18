using API.DTOs;
using API.RequestHelpers;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Controllers;


public class ProductsController(IUnitOfWork unit, IPhotoService photoService) : BaseApiController
{
    [EnableRateLimiting("fixed")]
    [Cache(900)] //cache live for 15 minutes
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetProducts([FromQuery] ProductSpecParams specParams)
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
        return Ok(productDto);
    }

//When this is called, all keys with pattern "api/products" in redis will be removed    
[InvalidateCache("api/products|")]
[Authorize(Roles = "Admin")]
[HttpPost]
public async Task<ActionResult<Product>> CreateProduct([FromForm] CreateProductDto dto)
{
    // Upload the image to Cloudinary (if provided)
    string pictureUrl = string.Empty;
    string? publicId = null;

    if (dto.Picture != null)
    {
        var result = await photoService.UploadPhotoAsync(dto.Picture);
        if (result.Error != null) return BadRequest(result.Error.Message);

        pictureUrl = result.SecureUrl.AbsoluteUri;
        publicId = result.PublicId;
    }

    var product = new Product
    {
        Name = dto.Name,
        Description = dto.Description,
        Price = dto.Price,
        PictureUrl = pictureUrl, // Use uploaded image URL
        Type = dto.Type,
        Brand = dto.Brand,
        QuantityInStock = dto.QuantityInStock,
        Category = dto.Category,
        ProductSymptoms = dto.SymptomIds.Select(sid => new ProductSymptom
        {
            SymptomId = sid
        }).ToList()
    };

    if (!string.IsNullOrEmpty(pictureUrl))
    {
        product.Photo = new Photo
        {
            Url = pictureUrl,
            PublicId = publicId,
            Product = product
        };
    }

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

    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateProduct([FromForm] CreateProductDto dto, int id)
    {
    var product = await unit.Repository<Product>()
        .GetEntityWithSpec(new ProductWithSymptomsSpecification(id));
    if (product == null)
        return NotFound("Product not found");

    //  Handle photo upload
    if (dto.Picture != null)
    {
        // Delete old photo from Cloudinary
        if (product.Photo?.PublicId is not null)
        {
            var deleteResult = await photoService.DeletePhotoAsync(product.Photo.PublicId);
            if (deleteResult.Result != "ok" && deleteResult.Result != "not found")
            {
                return BadRequest("Failed to delete existing photo from Cloudinary");
            }
        }

        // Upload new photo
        var uploadResult = await photoService.UploadPhotoAsync(dto.Picture);
        if (uploadResult.Error != null)
            return BadRequest(uploadResult.Error.Message);

        // Replace product photo
        product.Photo = new Photo
        {
            Url = uploadResult.SecureUrl.AbsoluteUri,
            PublicId = uploadResult.PublicId,
            ProductId = product.Id
        };

        product.PictureUrl = product.Photo.Url;
    }

    //  Update other fields
    product.Name = dto.Name;
    product.Description = dto.Description;
    product.Price = dto.Price;
    product.Type = dto.Type;
    product.Brand = dto.Brand;
    product.QuantityInStock = dto.QuantityInStock;
    product.Category = dto.Category;

    //  Update many-to-many symptoms
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
    // Load product with Photo
    var spec = new ProductWithPhotoSpecification(id);
    var product = await unit.Repository<Product>().GetEntityWithSpec(spec);

    if (product == null) return NotFound();

    // Delete from Cloudinary
    if (product.Photo != null && !string.IsNullOrEmpty(product.Photo.PublicId))
    {
        var deletionResult = await photoService.DeletePhotoAsync(product.Photo.PublicId);
        if (deletionResult.Error != null)
        {
            return BadRequest($"Cloudinary deletion failed: {deletionResult.Error.Message}");
        }
    }

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

    [Authorize(Roles = "Admin")]
    [HttpPut("update-photo/{productId:int}")]
    public async Task<ActionResult> AddPhoto([FromForm] IFormFile file, int productId)
    {
        var result = await photoService.UploadPhotoAsync(file);
        if (result.Error != null) return BadRequest(result.Error.Message);

        var photo = new Photo
        {
            Url = result.SecureUrl.AbsoluteUri,
            PublicId = result.PublicId,
            ProductId = productId
        };
        var product = await unit.Repository<Product>()
           .GetEntityWithSpec(new ProductWithSymptomsSpecification(productId));
        if (product == null)
            return NotFound("Product not found");

        product.PictureUrl = photo.Url;

        unit.Repository<Product>().Update(product);
        if (await unit.Complete())
        {
            return Ok(photo);
        }
        return BadRequest("Problem adding photo");
    }
}
