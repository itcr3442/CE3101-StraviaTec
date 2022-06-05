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
    public ActionResult New(Req.NewChallenge req)
    {
        if (Random.Shared.Next(2) == 0)
        {
            return BadRequest();
        }

        return CreatedAtAction(nameof(Get), new { id = 69 }, new Resp.Ref(69));
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.GetChallenge))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int id)
    {
        int[] privateGroups;
        (string name, DateTime start, DateTime end, string type,
         decimal goal, decimal? progress)? row;

        using (var txn = _db.Txn())
        {
            string query = @"
                SELECT     challenges.name, challenges.start_time, challenges.end_time,
                           activity_types.name, goal, SUM(length)
                FROM       challenge_activities
                JOIN       activities
                ON         activity = id
                RIGHT JOIN challenge_participants
                ON         activities.athlete = challenge_participants.athlete
                JOIN       challenges
                ON         challenge_participants.challenge = challenges.id
                JOIN       activity_types
                ON         challenges.type = activity_types.id
                WHERE      challenge_participants.athlete = @athlete
                GROUP BY   challenges.id, challenges.name, challenges.start_time,
                           challenges.end_time, activity_types.name, goal, 
                HAVING     challenges.id = @challenge
                ";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("challenge", id).Param("athlete", this.LoginId());
                row = cmd.Row<(string, DateTime, DateTime, string, int, int)>();
            }

            if (row == null)
            {
                return NotFound();
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
        decimal? progress = row.Value.progress;

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
    public ActionResult Patch(int id, Req.PatchChallenge req)
    {
        return Random.Shared.Next(2) == 0 ? NoContent() : BadRequest();
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
