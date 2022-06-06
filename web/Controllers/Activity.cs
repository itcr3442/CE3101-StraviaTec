using System;
using System.IO;
using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;
using web.Body.Common;

using MongoDB.Driver;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/Activities")]
public class ActivityController : ControllerBase
{
    public ActivityController(ISqlConn db, IMongoConn mongo)
    {
        _db = db;
        _mongo = mongo;
    }

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
                return NotFound();
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
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int id)
    {
        using (var txn = _db.Txn())
        {
            using (var cmd = txn.Cmd("SELECT athlete FROM activities WHERE id=@id"))
            {
                int? athlete = cmd.Param("id", id).Row<int>();
                if (athlete == null)
                {
                    return NotFound();
                }
                else if (athlete != this.LoginId())
                {
                    return Forbid();
                }
            }

            using (var cmd = txn.Cmd("UPDATE race_participants SET activity=NULL WHERE activity=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            using (var cmd = txn.Cmd("DELETE FROM activity_tracks WHERE activity=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            using (var cmd = txn.Cmd("DELETE FROM challenge_activities WHERE activity=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            using (var cmd = txn.Cmd("DELETE FROM activities WHERE id=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            var filter = Builders<StoredComment>.Filter.Eq(comment => comment.Activity, id);
            _mongo.Collection<StoredComment>("comments").DeleteMany(filter);

            txn.Commit();
        }

        return NoContent();
    }

    private readonly ISqlConn _db;
    private readonly IMongoConn _mongo;
}
