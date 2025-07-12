using API.RequestHelpers;
using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BaseApiController : ControllerBase
{
    protected async Task<ActionResult> CreatePagedResult<TEntity, TDto>(IGenericRepository<TEntity> repo,
    ISpecification<TEntity> spec, int pageIndex, int pageSize, Func<TEntity, TDto> toDto) where TEntity : BaseEntity
    {
        var items = await repo.ListAsync(spec);
        var count = await repo.CountAsync(spec);

        var dtoItems = items.Select(toDto).ToList();
        var pagination = new Pagination<TDto>(pageIndex, pageSize, count, dtoItems);

        return Ok(pagination);
    }
}
