using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class SymptomsController(IGenericRepository<Symptom> repo) : BaseApiController
{
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Symptom>> GetSymptom(int id)
    {
        var symptom = await repo.GetByIdAsync(id);
        if (symptom == null) return NotFound();
        return symptom;
    }

    [HttpPost]
    public async Task<ActionResult<Symptom>> CreateSymptom(Symptom symptom)
    {
        repo.Add(symptom);
        if (await repo.SaveAllAsync())
        {
            return CreatedAtAction("GetSymptom", new { id = symptom.Id }, symptom);
        }
        return BadRequest("Problem creating symptom");
    }
}
