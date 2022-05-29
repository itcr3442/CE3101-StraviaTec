using System;
using System.IO;
using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;
using web.Body.Common;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/Groups")]
public class GroupController : ControllerBase
{
    [HttpPost]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Resp.Ref))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult New(Req.NewGroup req)
    {
        if (Random.Shared.Next(2) == 0)
        {
            return BadRequest();
        }

        return CreatedAtAction(nameof(Get), new { id = 69 }, new Resp.Ref(69));
    }

    [HttpPatch("{id}")]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult Patch(int id, Req.PatchGroup req)
    {
        return Random.Shared.Next(2) == 0 ? NoContent() : BadRequest();
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.GetGroup))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int id)
    {
        return Ok(new Resp.GetGroup
        {
            Admin = 69,
            Members = new int[] { 69, 420 },
            AmMember = true,
        });
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Delete(int id)
    {
        return Random.Shared.Next(2) == 0 ? NoContent() : NotFound();
    }
}

[ApiController]
[Route("Api/Groups/{id}/Membership")]
public class MembershipController : ControllerBase
{
    public MembershipController(ISqlConn db) => _db = db;

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult New(int id, Req.NewGroup req)
    {
        switch (Random.Shared.Next(3))
        {
            case 0:
                return CreatedAtAction(nameof(Delete), new { id = id });

            case 1:
                return Conflict();

            default:
                return BadRequest();
        }
    }

    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int id)
    {
        string query = @"
            DELETE FROM group_members
            WHERE       group_id=@group_id AND member=@member
            ";

        using (var cmd = _db.Cmd(query))
        {
            cmd.Param("group_id", id).Param("member", this.LoginId());
            return await cmd.Exec() > 0 ? NoContent() : NotFound();
        }
    }

    private ISqlConn _db;
}
