using System;
using System.IO;
using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;
using web.Body.Common;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/Users")]
public class IdentityController : ControllerBase
{
    [HttpPost("[action]")]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.Ref))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult Login(Req.Login req)
    {
        return Random.Shared.Next(2) == 0 ? Ok(new Resp.Ref(69)) : Unauthorized();
    }
}

[ApiController]
[Route("Api/Users")]
public class UserController : ControllerBase
{
    [HttpPost]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Resp.Ref))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult New(Req.NewUser req)
    {
        switch (Random.Shared.Next(3))
        {
            case 0:
                return CreatedAtAction(nameof(Get), new { id = 69 }, new Resp.Ref(69));

            case 1:
                return BadRequest();

            default:
                return Conflict();
        }
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.GetUser))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int id)
    {
        return Ok(new Resp.GetUser
        {
            Username = "foo",
            FirstName = "bar",
            LastName = "baz",
            BirthDate = DateTime.Today,
            Nationality = "cr",
            Relationship = UserRelationship.Self,
        });
    }

    [HttpPatch("{id}")]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult Patch(int id, Req.PatchUser req)
    {
        switch (Random.Shared.Next(3))
        {
            case 0:
                return Ok();

            case 1:
                return BadRequest();

            default:
                return Conflict();
        }
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Delete(int id)
    {
        return Ok();
    }

    [HttpPut("{id}/Password")]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult UpdatePassword(Req.UpdatePassword req)
    {
        return Random.Shared.Next(2) == 0 ? Ok() : Unauthorized();
    }
}

[ApiController]
[Route("Api/Users/{id}/Photo")]
public class PhotoController : ControllerBase
{
    public PhotoController(ISqlConn conn) => _conn = conn;

    [HttpGet]
    [Produces(MediaTypeNames.Image.Jpeg)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int id)
    {
        using (var cmd = _conn.Cmd("SELECT photo FROM photos WHERE user=@id"))
        {
            using (var stream = cmd.Param("id", id).Stream())
            {
                var photo = stream.Take();
                if (photo == null)
                {
                    return NotFound();
                }

                return File(photo, MediaTypeNames.Image.Jpeg);
            }
        }
    }

    [HttpPut]
    [Consumes(MediaTypeNames.Image.Jpeg)]
    [RequestSizeLimit(1048576)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Put(int id, IFormFile image)
    {
        return Ok();
    }

    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Delete(int id)
    {
        return Random.Shared.Next(2) == 0 ? Ok() : NotFound();
    }

    private ISqlConn _conn;
}
