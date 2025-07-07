using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class CategorysController(IGenericRepository<Category> repo) : BaseApiController
{
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Category>> GetCategory(int id)
    {
        var category = await repo.GetByIdAsync(id);
        if (category == null) return NotFound();
        return category;
    }

    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(Category category)
    {
        repo.Add(category);
        if (await repo.SaveAllAsync())
        {
            return CreatedAtAction("GetCategory", new { id = category.Id }, category);
        }
        return BadRequest("Problem creating category");
    }

}
