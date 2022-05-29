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
    public ActivityController(ISqlConn db) => _db = db;

    [HttpPost]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Resp.Ref))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult New(Req.NewActivity req)
    {
        int id;
        using (var txn = _db.Txn())
        {
            int type;
            using (var cmd = txn.Cmd("SELECT id FROM activity_types WHERE name=@name"))
            {
                var row = cmd.Param("name", req.Type.ToString()).Row<int>();
                if (row == null)
                {
                    return BadRequest();
                }

                type = row.Value;
            }

            var query = @"
                INSERT INTO activities(athlete, start_time, end_time, type, length)
                OUTPUT      INSERTED.id
                VALUES(@athlete, @start_time, @end_time, @type, @length)
                ";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("athlete", this.LoginId())
                   .Param("start_time", req.Start)
                   .Param("end_time", req.End)
                   .Param("type", type)
                   .Param("length", req.Length);

                id = cmd.InsertId();
            }

            txn.Commit();
        }

        return CreatedAtAction(nameof(Get), new { id }, new Resp.Ref(id));
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.GetActivity))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int id)
    {
        (int athlete, DateTime start, DateTime end, string name, decimal length) row;

        string query = @"
            SELECT athlete, start_time, end_time, name, length
            FROM   activities
            JOIN   activity_types
            ON     activities.type = activity_types.id
            WHERE  activities.id=@id";

        using (var cmd = _db.Cmd(query))
        {
            var result = cmd.Param("id", id).Row<(int, DateTime, DateTime, string, decimal)>();
            if (result == null)
            {
                return Unauthorized();
            }

            row = result.Value;
        }

        Enum.TryParse(row.name, out ActivityType type);
        return Ok(new Resp.GetActivity
        {
            User = row.athlete,
            Start = row.start,
            End = row.end,
            Type = type,
            Length = row.length,
        });
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Delete(int id)
    {
        return NoContent();
    }

    private ISqlConn _db;
}
