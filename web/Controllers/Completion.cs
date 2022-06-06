using System;
using System.Data;
using System.IO;
using System.Net.Mime;

using Microsoft.AspNetCore.Mvc;

using web.Body.Common;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/[action]/Available")]
[Produces(MediaTypeNames.Application.Json)]
[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int[]))]
public class AvailableController : ControllerBase
{
    public AvailableController(ISqlConn db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> Categories()
    {
        int self = this.LoginId();
        int? age;

        using (var cmd = _db.Cmd("current_age"))
        {
            cmd.Param("id", self).Output("age", SqlDbType.Int);
            age = (await cmd.StoredProcedure())["@age"].Value as int?;
        }

        Category ageCategory = age switch
        {
            >= 51 => Category.MasterC,
            >= 41 => Category.MasterB,
            >= 30 => Category.MasterA,
            >= 24 => Category.Open,
            >= 15 => Category.Sub23,
            _ => Category.Junior,
        };

        return Ok(new Category[] { ageCategory, Category.Elite });
    }

    [HttpGet]
    public ActionResult Races(ActivityType type, Category category)
    {
        string query = @"
            SELECT races.id
            FROM   races
            JOIN   activity_types
            ON     type = activity_types.id
            JOIN   race_participants
            ON     races.id = race
            JOIN   categories
            ON     category = categories.id
            WHERE  activity_types.name = @type
               AND categories.name = @category
               AND athlete = @athlete
               AND activity IS NULL
               AND on_date = CAST(GETDATE() AS date)
            ";

        using (var cmd = _db.Cmd(query))
        {
            cmd.Param("type", type.ToString())
               .Param("category", category.ToString())
               .Param("athlete", this.LoginId());

            return Ok(cmd.Rows<int>().ToArray());
        }
    }

    [HttpGet]
    public ActionResult Challenges(ActivityType type)
    {
        string query = @"
            SELECT challenge
            FROM   challenge_progress
            JOIN   challenges
            ON     challenge = id
            JOIN   activity_types
            ON     challenges.type = activity_types.id
            WHERE  activity_types.name = @type
               AND athlete = @athlete
               AND start_time < GETDATE()
               AND end_time > GETDATE()
               AND progress < goal
            ";

        using (var cmd = _db.Cmd(query))
        {
            cmd.Param("type", type.ToString()).Param("athlete", this.LoginId());
            return Ok(cmd.Rows<int>().ToArray());
        }
    }

    private readonly ISqlConn _db;
}

[ApiController]
[Route("Api/[action]/{id}/Progress")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
[ProducesResponseType(StatusCodes.Status409Conflict)]
public class ProgressController : ControllerBase
{
    public ProgressController(ISqlConn db) => _db = db;

    [HttpPost]
    public async Task<ActionResult> Races(int id, int activity)
    {
        int self = this.LoginId();
        using (var txn = _db.Txn())
        {
            string query = @"
                SELECT 1, activity
                FROM   race_participants
                WHERE  race = @race AND athlete = @athlete
                ";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("race", id).Param("athlete", self);

                (int, int? activity)? row = cmd.Row<(int, int?)>();
                if (row == null)
                {
                    return NotFound();
                }
                else if (row.Value.activity != null)
                {
                    return Conflict();
                }
            }

            query = @"
                UPDATE race_participants
                SET    activity = @activity
                WHERE  race = @race AND athlete = @athlete
                ";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("race", id).Param("athlete", self).Param("activity", activity);
                await cmd.Exec();
            }

            txn.Commit();
        }

        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult> Challenges(int id, int activity)
    {
        int self = this.LoginId();
        using (var txn = _db.Txn())
        {
            string query = @"
                SELECT goal, progress, last_seq
                FROM   challenge_progress
                JOIN   challenges
                ON     challenge = id
                WHERE  challenge = @challenge AND athlete = @athlete
                ";

            (decimal goal, decimal progress, int lastSeq)? row;
            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("challenge", id).Param("athlete", self);
                row = cmd.Row<(decimal, decimal, int)>();
            }

            if (row == null)
            {
                return NotFound();
            }
            else if (row.Value.progress >= row.Value.goal)
            {
                return Conflict();
            }

            query = @"
                INSERT INTO challenge_activities(challenge, activity, seq_no)
                VALUES(@challenge, @activity, @seq)
                ";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("challenge", id)
                   .Param("activity", activity)
                   .Param("seq", row.Value.lastSeq + 1);

                await cmd.Exec();
            }

            txn.Commit();
        }

        return NoContent();
    }

    private readonly ISqlConn _db;
}
