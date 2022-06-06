using System;
using System.IO;
using System.Net.Mime;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using web.Body.Common;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/Challenges")]
public class ChallengeController : ControllerBase
{
    public ChallengeController(ISqlConn db) => _db = db;

    [HttpPost]
    [Authorize(Policy = "Organizer")]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Resp.Ref))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> New(Req.NewChallenge req)
    {
        int id;
        using (var txn = _db.Txn())
        {
            string query = @"
                INSERT INTO challenges(name, start_time, end_time, type, goal)
                OUTPUT INSERTED.ID
                SELECT @name, @start, @end, id, @goal
                FROM   activity_types
                WHERE  name = @type
                ";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("name", req.Name)
                   .Param("start", req.Start)
                   .Param("end", req.End)
                   .Param("type", req.Type.ToString())
                   .Param("goal", req.Goal);

                id = cmd.InsertId();
            }

            query = @"
                INSERT INTO challenge_private_groups(challenges, group_id)
                VALUES(@challenge, @group)
                ";

            foreach (int privateGroup in req.PrivateGroups)
            {
                using (var cmd = txn.Cmd(query))
                {
                    await cmd.Param("challenge", id).Param("group", privateGroup).Exec();
                }
            }

            txn.Commit();
        }

        return CreatedAtAction(nameof(Get), new { id = id }, new Resp.Ref(id));
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.GetChallenge))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int id)
    {
        int[] privateGroups;
        decimal? progress;
        (string name, DateTime start, DateTime end, string type, decimal goal)? row;

        using (var txn = _db.Txn())
        {
            string query = @"
                SELECT challenges.name, start_time, end_time, activity_types.name, goal
                FROM   challenges
                JOIN   activity_types
                ON     type = activity_types.id
                WHERE  challenges.id = @challenge
                ";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("challenge", id);
                row = cmd.Row<(string, DateTime, DateTime, string, decimal)>();
            }

            if (row == null)
            {
                return NotFound();
            }

            query = @"
                SELECT progress
                FROM   challenge_progress
                WHERE  challenge = @challenge AND athlete = @athlete
                ";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("challenge", id).Param("athlete", this.LoginId());
                progress = cmd.Row<decimal>();
            }

            query = @"
                SELECT   group_id
                FROM     challenge_private_groups
                WHERE    challenge=@challenge
                ORDER BY group_id
                ";

            using (var cmd = txn.Cmd(query))
            {
                privateGroups = cmd.Param("challenge", id).Rows<int>().ToArray();
            }
        }

        Enum.TryParse(row.Value.type, out ActivityType type);

        DateTime start = row.Value.start;
        DateTime end = row.Value.end;
        decimal goal = row.Value.goal;

        var status = progress != null
                   ? progress.Value >= goal
                   ? ChallengeStatus.Completed
                   : ChallengeStatus.Registered
                   : ChallengeStatus.NotRegistered;

        return Ok(new Resp.GetChallenge
        {
            Name = row.Value.name,
            Start = start,
            End = end,
            Type = type,
            Goal = goal,
            Progress = progress ?? 0M,
            RemainingDays = (int)Math.Max(0, Math.Ceiling((end - DateTime.Now).TotalDays)),
            PrivateGroups = privateGroups,
            Status = status,
        });
    }

    [HttpPatch("{id}")]
    [Authorize(Policy = "Organizer")]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Patch(int id, Req.PatchChallenge req)
    {
        using (var txn = _db.Txn())
        {
            (string name, DateTime start, DateTime end,
             string type, decimal goal)? row;

            string query = @"
                SELECT challenges.name, start_time, end_time,
                       activity_types.name, goal
                FROM   challenges
                JOIN   activity_types
                ON     type = activity_types.id
                WHERE  challenges.id = @challenge
                ";

            using (var cmd = txn.Cmd(query))
            {
                row = cmd.Param("challenge", id).Row<(string, DateTime, DateTime, string, decimal)>();
            }

            if (row == null)
            {
                return NotFound();
            }

            string name = req.Name ?? row.Value.name;
            DateTime start = req.Start ?? row.Value.start;
            DateTime end = req.End ?? row.Value.end;
            string? type = req.Type != null ? req.Type.ToString() : row.Value.type;
            decimal goal = req.Goal ?? row.Value.goal;

            query = @"
                UPDATE challenges
                SET    name = @name, start_time = @start, end_time = @end,
                       type = activity_types.id, goal = @goal
                FROM   activity_types
                WHERE  challenges.id = @challenge AND activity_types.name = @type
                ";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("name", name)
                   .Param("start", start)
                   .Param("end", end)
                   .Param("type", type)
                   .Param("goal", goal)
                   .Param("challenge", id);

                await cmd.Exec();
            }

            if (req.PrivateGroups != null)
            {
                query = @"
                    DELETE FROM challenge_private_groups
                    WHERE       challenge=@challenge
                    ";

                using (var cmd = txn.Cmd(query))
                {
                    await cmd.Param("challenge", id).Exec();
                }

                query = @"
                    INSERT INTO challenge_private_groups(challenges, group_id)
                    VALUES(@challenge, @group)
                    ";

                foreach (int privateGroup in req.PrivateGroups)
                {
                    using (var cmd = txn.Cmd(query))
                    {
                        await cmd.Param("challenge", id).Param("group", privateGroup).Exec();
                    }
                }
            }

            txn.Commit();
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "Organizer")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int id)
    {
        int deleted;
        using (var txn = _db.Txn())
        {
            using (var cmd = _db.Cmd("DELETE FROM challenge_activities WHERE challenge=@id"))
            {
                deleted = await cmd.Param("id", id).Exec();
            }

            using (var cmd = _db.Cmd("DELETE FROM challenge_private_groups WHERE challenge=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            using (var cmd = _db.Cmd("DELETE FROM challenge_participants WHERE challenge=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            using (var cmd = _db.Cmd("DELETE FROM challenges WHERE id=@id"))
            {
                deleted = await cmd.Param("id", id).Exec();
            }

            txn.Commit();
        }

        return deleted > 0 ? NoContent() : NotFound();
    }

    private readonly ISqlConn _db;
}
