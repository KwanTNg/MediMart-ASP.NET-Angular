using API.DTOs;
using API.Extensions;
using API.RequestHelpers;
using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController(IUnitOfWork unit, UserManager<AppUser> userManager) : BaseApiController
{
    [HttpGet("orders")]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrders([FromQuery] OrderSpecParams specParams)
    {
        var spec = new OrderSpecification(specParams);
        return await CreatePagedResult(unit.Repository<Order>(), spec, specParams.PageIndex,
            specParams.PageSize, o => o.ToDto());
    }

    [HttpGet("orders/{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOrderById(int id)
    {
        var spec = new OrderSpecification(id);
        var order = await unit.Repository<Order>().GetEntityWithSpec(spec);
        if (order == null) return BadRequest("No order with that id");
        return order.ToDto();
    }

    [HttpGet("order-items")]
    public async Task<ActionResult<IReadOnlyList<OrderItemDto>>> GetOrderItems([FromQuery] PagingParams specParams)
    {
        var spec = new OrderItemSpecification(specParams);
        return await CreatePagedResult(unit.Repository<OrderItem>(), spec, specParams.PageIndex,
            specParams.PageSize, o => o.ToDto());
    }

    [HttpGet("users")]
    public async Task<ActionResult> GetUsers([FromQuery] UserSpecParams specParams)
    {
        var roles = new[] { "patient", "pharmacist" };
        var users = new List<AppUser>();

        foreach (var role in roles)
        {
            var usersInRole = await userManager.GetUsersInRoleAsync(role);
            users.AddRange(usersInRole);
        }

        // Apply ordering
        users = specParams.OrderBy?.ToLower() switch
        {
            "email" => users.OrderBy(u => u.Email).ToList(),
            "email_desc" => users.OrderByDescending(u => u.Email).ToList(),
            "username" => users.OrderBy(u => u.UserName).ToList(),
            "username_desc" => users.OrderByDescending(u => u.UserName).ToList(),
            _ => users.OrderBy(u => u.Id).ToList()
        };


        // Apply pagination
        var count = users.Count();
        var pagedUsers = users
           .Skip((specParams.PageIndex - 1) * specParams.PageSize)
           .Take(specParams.PageSize)
           .ToList();

        // Map to DTOs
        var dtoItems = pagedUsers.Select(u => new AppUserDto
        {
            Id = u.Id,
            Email = u.Email,
            PhoneNumber = u.PhoneNumber,
            FirstName = u.FirstName,
            LastName = u.LastName,
            EmailConfirmed = u.EmailConfirmed
        }).ToList();

        // Return paginated result
        var pagination = new Pagination<AppUserDto>(specParams.PageIndex, specParams.PageSize, count, dtoItems);
        return Ok(pagination);
    }

        [HttpGet("user/{id}")]
        public async Task<ActionResult> GetUser(string id)
        {
         var user = await userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

         var dto = new AppUserDto
         {
             Id = user.Id,
             Email = user.Email,
             PhoneNumber = user.PhoneNumber,
             FirstName = user.FirstName,
             LastName = user.LastName,
             EmailConfirmed = user.EmailConfirmed
        };

        return Ok(dto);
        }


}
