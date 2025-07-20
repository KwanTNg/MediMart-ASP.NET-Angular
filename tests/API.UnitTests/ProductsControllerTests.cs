// using System.Security.Claims;
// using API.Controllers;
// using API.DTOs;
// using API.RequestHelpers;
// using API.UnitTests.Utils;
// using AutoFixture;
// using Core.Entities;
// using Core.Interfaces;
// using Core.Specifications;
// using Microsoft.AspNetCore.Http;
// using Microsoft.AspNetCore.Mvc;
// using Moq;

// namespace API.UnitTests;

// public class ProductsControllerTests
// {
//     private readonly Mock<IUnitOfWork> _unit;
//     private readonly Mock<IGenericRepository<Product>> _productRepo;
//     private readonly Fixture _fixture;
//     private readonly ProductsController _controller;

//     public ProductsControllerTests()
//     {
//         _fixture = new Fixture();
//         _fixture.Customize<CreateProductDto>(composer => composer
//         .With(x => x.Price, 99.99m)
//         .With(x => x.SymptomIds, new List<int> { 1, 2 })
//         );
//         _unit = new Mock<IUnitOfWork>();
//         _productRepo = new Mock<IGenericRepository<Product>>();
//         _unit.Setup(u => u.Repository<Product>()).Returns(_productRepo.Object);
//         _controller = new ProductsController(_unit.Object)
//         {
//             ControllerContext = new ControllerContext
//             {
//                 HttpContext = new DefaultHttpContext { User = Helpers.GetClaimsPrincipal() }
//             }
//         };
//     }

//     [Fact]
//     public async Task GetProducts_ReturnsListOfProductDtos()
//     {
//         // Arrange
//         var products = _fixture.Build<Product>()
//             .Without(p => p.ProductSymptoms) // avoid circular references
//             .CreateMany(5)
//             .ToList();

//         // Optionally add ProductSymptoms if needed
//         foreach (var product in products)
//         {
//             product.ProductSymptoms = new List<ProductSymptom>
//             {
//                 new ProductSymptom { SymptomId = 1 },
//                 new ProductSymptom { SymptomId = 2 }
//             };
//         }

//         _productRepo.Setup(r => r.ListAsync(It.IsAny<ISpecification<Product>>()))
//             .ReturnsAsync(products);

//         _productRepo.Setup(r => r.CountAsync(It.IsAny<ISpecification<Product>>()))
//             .ReturnsAsync(products.Count);

//         var specParams = new ProductSpecParams();

//         // Act
//         var result = await _controller.GetProducts(specParams);

//         // Assert
//         var okResult = Assert.IsType<OkObjectResult>(result.Result);
//         var pagination = Assert.IsAssignableFrom<Pagination<ProductDto>>(okResult.Value);

//         Assert.Equal(5, pagination.Data.Count);
//         Assert.Equal(1, pagination.PageIndex); // default from PagingParams
//         Assert.Equal(6, pagination.PageSize);  // default from PagingParams
//         Assert.Equal(5, pagination.Count);
//     }

//     [Fact]
//     public async Task GetProduct_WithValidId_ReturnsProductDto()
//     {
//         // Arrange
//         var product = new Product
//         {
//             Id = 1,
//             Name = "Test Product",
//             Description = "Test Description",
//             Price = 100,
//             PictureUrl = "http://example.com/image.jpg",
//             Type = "TypeA",
//             Brand = "BrandA",
//             QuantityInStock = 10,
//             Category = "CategoryA",
//             ProductSymptoms = new List<ProductSymptom>
//              {
//                  new ProductSymptom { SymptomId = 1 },
//                  new ProductSymptom { SymptomId = 2 }
//              }
//         };

//         _productRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<int>()))
//                .ReturnsAsync(product);

//         // Act
//         var result = await _controller.GetProduct(1);

//         // Assert
//         var okResult = Assert.IsType<ActionResult<ProductDto>>(result);
//         var returnValue = Assert.IsType<ProductDto>(okResult.Value);

//         Assert.Equal(product.Id, returnValue.Id);
//         Assert.Equal(product.Name, returnValue.Name);
//         Assert.Equal(product.Description, returnValue.Description);
//         Assert.Equal(product.Price, returnValue.Price);
//         Assert.Equal(product.PictureUrl, returnValue.PictureUrl);
//         Assert.Equal(product.Type, returnValue.Type);
//         Assert.Equal(product.Brand, returnValue.Brand);
//         Assert.Equal(product.QuantityInStock, returnValue.QuantityInStock);
//         Assert.Equal(product.Category, returnValue.Category);
//         Assert.Equal(product.ProductSymptoms.Select(ps => ps.SymptomId), returnValue.SymptomIds);
//     }

//     [Fact]
//     public async Task GetProduct_WithInvalidId_ReturnsNotFound()
//     {
//         // Arrange
//         _productRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<int>()))
//                 .ReturnsAsync((Product?)null); // simulate not found

//         // Act
//         var result = await _controller.GetProduct(999); // assume 999 doesn't exist

//         // Assert
//         var actionResult = Assert.IsType<ActionResult<ProductDto>>(result);
//         Assert.IsType<NotFoundResult>(actionResult.Result);
//     }

//     [Fact]
//     public async Task CreateProduct_WithValidCreateProductDto_ReturnsCreatedAtAction()
//     {
//         // Arrange
//         var createDto = _fixture.Create<CreateProductDto>();

//         var repoMock = new Mock<IGenericRepository<Product>>();
//         _unit.Setup(u => u.Repository<Product>()).Returns(repoMock.Object);
//         _unit.Setup(u => u.Complete()).ReturnsAsync(true);

//         // Act
//         var result = await _controller.CreateProduct(createDto);

//         // Assert
//         var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
//         Assert.Equal("GetProduct", createdResult.ActionName);

//         var returnedDto = Assert.IsType<ProductDto>(createdResult.Value);
//         Assert.Equal(createDto.Name, returnedDto.Name);
//         Assert.Equal(createDto.SymptomIds, returnedDto.SymptomIds);
//     }

//     [Fact]
//     public async Task CreateProduct_FailedSave_Returns400BadRequest()
//     {
//         // Arrange
//         var createDto = _fixture.Create<CreateProductDto>();

//         var repoMock = new Mock<IGenericRepository<Product>>();
//         _unit.Setup(u => u.Repository<Product>()).Returns(repoMock.Object);
//         _unit.Setup(u => u.Complete()).ReturnsAsync(false);

//         // Act
//         var result = await _controller.CreateProduct(createDto);

//         // Assert
//         Assert.IsType<BadRequestObjectResult>(result.Result);
//     }

//     [Fact]
//     public async Task UpdateProduct_WithCreateProductDto_ReturnsNoContent()
//     {
//         // Arrange
//         var createProductDto = _fixture.Create<CreateProductDto>();

//         var existingProduct = new Product
//         {
//             Id = 1,
//             Name = "Old Name",
//             Description = "Old Desc",
//             Price = 10,
//             PictureUrl = "old.jpg",
//             Type = "OldType",
//             Brand = "OldBrand",
//             QuantityInStock = 5,
//             Category = "OldCat",
//             ProductSymptoms = new List<ProductSymptom>
//           {
//               new ProductSymptom { SymptomId = 99, ProductId = 1 }
//           }
//         };

//         // Setup GetEntityWithSpec to return the existing product
//         _productRepo.Setup(r => r.GetEntityWithSpec(It.IsAny<ISpecification<Product>>()))
//                .ReturnsAsync(existingProduct);

//         _unit.Setup(u => u.Repository<Product>()).Returns(_productRepo.Object);
//         _unit.Setup(u => u.Complete()).ReturnsAsync(true);

//         // Act
//         var result = await _controller.UpdateProduct(1, createProductDto);

//         // Assert
//         Assert.IsType<NoContentResult>(result);

//     }

//     [Fact]
//     public async Task UpdateProduct_WithInvalidId_ReturnsNotFound()
//     {
//         // Arrange
//         var createProductDto = _fixture.Create<CreateProductDto>();

//         var repoMock = new Mock<IGenericRepository<Product>>();
//         repoMock.Setup(r => r.GetEntityWithSpec(It.IsAny<ISpecification<Product>>()))
//             .ReturnsAsync(value: null);
//         _unit.Setup(u => u.Repository<Product>()).Returns(repoMock.Object);

//         // Act
//         var result = await _controller.UpdateProduct(2, createProductDto);

//         // Assert
//         Assert.IsType<NotFoundObjectResult>(result);
//     }

//     [Fact]
//     public async Task DeleteProduct_WithValidId_ReturnNoContent()
//     {
//         var existingProduct = new Product
//         {
//             Id = 1,
//             Name = "Old Name",
//             Description = "Old Desc",
//             Price = 10,
//             PictureUrl = "old.jpg",
//             Type = "OldType",
//             Brand = "OldBrand",
//             QuantityInStock = 5,
//             Category = "OldCat",
//             ProductSymptoms = new List<ProductSymptom>
//           {
//               new ProductSymptom { SymptomId = 99, ProductId = 1 }
//           }
//         };

//         _productRepo.Setup(r => r.GetByIdAsync(existingProduct.Id))
//                .ReturnsAsync(existingProduct);

//         _unit.Setup(u => u.Repository<Product>()).Returns(_productRepo.Object);
//         _unit.Setup(u => u.Complete()).ReturnsAsync(true);

//         var result = await _controller.DeleteProduct(existingProduct.Id);
//         Assert.IsType<NoContentResult>(result);

//     }

// }









