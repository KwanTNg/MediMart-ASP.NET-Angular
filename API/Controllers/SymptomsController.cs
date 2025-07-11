using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class SymptomsController(IUnitOfWork unit) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<Symptom>> GetSymptoms()
    {
        var symptoms = await unit.Repository<Symptom>().ListAllAsync();
        if (symptoms == null) return NotFound();
        return Ok(symptoms);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Symptom>> GetSymptom(int id)
    {
        var symptom = await unit.Repository<Symptom>().GetByIdAsync(id);
        if (symptom == null) return NotFound();
        return symptom;
    }

    [HttpPost]
    public async Task<ActionResult<Symptom>> CreateSymptom(Symptom symptom)
    {
        unit.Repository<Symptom>().Add(symptom);
        if (await unit.Complete())
        {
            return CreatedAtAction("GetSymptom", new { id = symptom.Id }, symptom);
        }
        return BadRequest("Problem creating symptom");
    }
}
