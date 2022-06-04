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
    public async Task<ActionResult> New(Req.NewGroup req)
    {
        int id;
        using (var txn = _db.Txn())
        {
            string query = @"
                INSERT INTO groups(name, admin)
                OUTPUT INSERTED.ID
                VALUES(@name, @admin)
                ";

            using (var cmd = txn.Cmd(query))
            {
                id = cmd.Param("name", req.Name).Param("admin", req.Admin).InsertId();
            }

            query = @"
                INSERT INTO group_members(group_id, member)
                VALUES(@id, @admin)
                ";

            using (var cmd = txn.Cmd(query))
            {
                await cmd.Param("id", id).Param("admin", req.Admin).Exec();
            }

            txn.Commit();
        }

        return CreatedAtAction(nameof(Get), new { id = id }, new Resp.Ref(id));
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
    public async Task<ActionResult> Delete(int id)
    {
        using (var txn = _db.Txn())
        {
            using (var cmd = _db.Cmd("DELETE FROM challenge_private_groups WHERE group_id=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            using (var cmd = _db.Cmd("DELETE FROM race_private_groups WHERE group_id=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            using (var cmd = _db.Cmd("DELETE FROM group_members WHERE group_id=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            using (var cmd = _db.Cmd("DELETE FROM group_members WHERE group_id=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            using (var cmd = _db.Cmd("DELETE FROM groups WHERE id=@id"))
            {
                return await cmd.Param("id", id).Exec() > 0 ? NoContent() : NotFound();
            }
        }
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
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int id)
    {
        int self = this.LoginId();

        using (var txn = _db.Txn())
        {
            using (var cmd = txn.Cmd("SELECT COUNT(id) FROM groups WHERE admin=@id"))
            {
                if ((cmd.Param("id", id).Row<int>() ?? 0) > 0)
                {
                    return Forbid();
                }
            }

            string query = @"
                DELETE FROM group_members
                WHERE       group_id=@group_id AND member=@member
                ";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("group_id", id).Param("member", self);
                return await cmd.Exec() > 0 ? NoContent() : NotFound();
            }
        }
    }

    private ISqlConn _db;
}
