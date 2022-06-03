using System;
using System.IO;
using System.Net.Mime;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

using web.Body.Common;

namespace web.Controllers;

[ApiController]
[Route("Api/Groups")]
public class GroupController : ControllerBase
{
    [HttpPost]
    [Authorize(Policy = "Organizer")]
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
    [Authorize(Policy = "Organizer")]
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
    [Authorize(Policy = "Organizer")]
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
    public async Task<ActionResult> New(int id, Req.NewGroup req)
    {
        string query = @"
            INSERT INTO group_members(group_id, member)
            VALUES(@group_id, @member)
            ";

        using (var cmd = _db.Cmd(query))
        {
            cmd.Param("group_id", id).Param("member", this.LoginId());

            return await cmd.Exec() > 0
                ? CreatedAtAction(nameof(Delete), new { id = id })
                : NotFound();
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
