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

    /// <summary>
    /// Crea un nuevo grupo.
    /// </summary>
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

    /// <summary>
    /// Modifica un grupo de la base de datos.
    /// </summary>
    [HttpPatch("{id}")]
    [Authorize(Policy = "Organizer")]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Patch(int id, Req.PatchGroup req)
    {
        using (var txn = _db.Txn())
        {
            if (req.Name != null)
            {
                using (var cmd = txn.Cmd("UPDATE groups SET name=@name WHERE id=@id"))
                {
                    await cmd.Param("id", id).Param("name", req.Name).Exec();
                }
            }

            if (req.Admin != null)
            {
                using (var cmd = txn.Cmd("UPDATE groups SET admin=@admin WHERE id=@id"))
                {
                    await cmd.Param("id", id).Param("admin", req.Admin).Exec();
                }

                string query = @"
                    DELETE FROM group_members
                    WHERE       group_id=@id AND member=@admin
                    ";

                using (var cmd = txn.Cmd(query))
                {
                    await cmd.Param("id", id).Param("admin", req.Admin).Exec();
                }

                query = @"
                    INSERT INTO group_members(group_id, member)
                    VALUES(@id, @admin)
                    ";

                using (var cmd = txn.Cmd(query))
                {
                    await cmd.Param("id", id).Param("admin", req.Admin).Exec();
                }
            }
        }

        return NoContent();
    }

    /// <summary>
    /// Obtiene un grupo de la base de datos.
    /// </summary>
    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.GetGroup))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int id)
    {
        (string name, int admin)? row;
        int[] members;

        using (var txn = _db.Txn())
        {
            using (var cmd = txn.Cmd("SELECT name, admin FROM groups WHERE id=@id"))
            {
                row = cmd.Param("id", id).Row<(string, int)>();
            }

            if (row == null)
            {
                return NotFound();
            }

            using (var cmd = txn.Cmd("SELECT member FROM group_members WHERE group_id=@id"))
            {
                members = cmd.Param("id", id).Rows<int>().ToArray();
            }
        }

        return Ok(new Resp.GetGroup
        {
            Name = row.Value.name,
            Admin = row.Value.admin,
            Members = members,
            AmMember = members.Contains(this.LoginId()),
        });
    }

    /// <summary>
    /// Elimina un grupo de la base de datos.
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "Organizer")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int id)
    {
        int deleted;
        using (var txn = _db.Txn())
        {
            using (var cmd = txn.Cmd("DELETE FROM challenge_private_groups WHERE group_id=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            using (var cmd = txn.Cmd("DELETE FROM race_private_groups WHERE group_id=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            using (var cmd = txn.Cmd("DELETE FROM group_members WHERE group_id=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            using (var cmd = txn.Cmd("DELETE FROM group_members WHERE group_id=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            using (var cmd = txn.Cmd("DELETE FROM groups WHERE id=@id"))
            {
                deleted = await cmd.Param("id", id).Exec();
            }

            txn.Commit();
        }

        return deleted > 0 ? NoContent() : NotFound();
    }

    private readonly ISqlConn _db;
}

[ApiController]
[Route("Api/Groups/{id}/Membership")]
public class MembershipController : ControllerBase
{
    public MembershipController(ISqlConn db) => _db = db;

    /// <summary>
    /// Ingresa un usuario en un grupo
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> New(int id)
    {
        string query = @"
            INSERT INTO group_members(group_id, member)
            VALUES(@group_id, @member)
            ";

        using (var cmd = _db.Cmd(query))
        {
            cmd.Param("group_id", id).Param("member", this.LoginId());
            await cmd.Exec();
        }

        return CreatedAtAction(nameof(Delete), new { id = id });
    }

    /// <summary>
    /// Elimina un usuario de un grupo
    /// </summary>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int id)
    {
        int self = this.LoginId();

        int deleted;
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
                deleted = await cmd.Exec();
            }

            txn.Commit();
        }

        return deleted > 0 ? NoContent() : NotFound();
    }

    private ISqlConn _db;
}
