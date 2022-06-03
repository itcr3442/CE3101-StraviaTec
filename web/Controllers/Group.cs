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
    public GroupController(ISqlConn db) => _db = db;

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
        int admin;
        int[] members;

        using (var txn = _db.Txn())
        {
            using (var cmd = txn.Cmd("SELECT admin FROM groups WHERE id=@id"))
            {
                int? row = cmd.Param("id", id).Row<int>();
                if (row == null)
                {
                    return NotFound();
                }

                admin = row.Value;
            }

            using (var cmd = txn.Cmd("SELECT member FROM group_members WHERE group_id=@id"))
            {
                members = cmd.Param("id", id).Rows<int>().ToArray();
            }
        }

        return Ok(new Resp.GetGroup
        {
            Admin = admin,
            Members = members,
            AmMember = members.Contains(this.LoginId()),
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

    private readonly ISqlConn _db;
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
