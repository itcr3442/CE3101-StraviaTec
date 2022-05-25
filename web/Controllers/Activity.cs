using System;
using System.IO;
using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;
using web.Body.Common;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/Activities")]
public class ActivityController : ControllerBase
{
    [HttpPost]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Resp.Ref))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult New(Req.NewActivity req)
    {
        if (Random.Shared.Next(2) == 0)
        {
            return BadRequest();
        }

        return CreatedAtAction(nameof(Get), new { id = 69 }, new Resp.Ref(69));
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.GetActivity))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int id)
    {
        return Ok(new Resp.GetActivity
        {
            User = 69,
            Start = DateTime.Now,
            End = DateTime.Now.AddHours(1),
            Type = ActivityType.Cycling
        });
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Delete(int id)
    {
        return NoContent();
    }
}
