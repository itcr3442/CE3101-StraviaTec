using System;
using System.IO;
using System.Net.Mime;
using web.Body.Common;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/Races")]
public class RaceController : ControllerBase
{
    public RaceController(ISqlConn db) => _db = db;

    [HttpPost]
    [Authorize(Policy = "Organizer")]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Resp.Ref))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult New(Req.NewRace req)
    {
        if (Random.Shared.Next(2) == 0)
        {
            return BadRequest();
        }

        return CreatedAtAction(nameof(Get), new { id = 69 }, new Resp.Ref(69));
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.GetRace))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int id)
    {
        return Ok(new Resp.GetRace
        {
            Name = "proyecto",
            Day = DateTime.Today,
            Type = ActivityType.Cycling,
            PrivateGroups = new int[] { },
            Price = 69.42M,
            Categories = new Category[] { Category.Junior, Category.MasterC },
            Status = RaceStatus.WaitingConfirmation,
        });
    }

    [HttpGet("{id}/Leaderboard")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.LeaderboardRow[]))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Leaderboard(int id)
    {
        string query = @"
            SELECT   activity, duration, length
            FROM     race_positions
            WHERE    race = @race
            ORDER BY duration ASC
            ";

        using (var cmd = _db.Cmd(query))
        {
            return Ok(cmd.Param("race", id)
                    .Rows<(int, decimal, decimal)>()
                    .Select(((int activity, decimal duration, decimal length) row) =>
                        new Resp.LeaderboardRow
                        {
                            Activity = row.activity,
                            Seconds = row.duration,
                            Length = row.length,
                        })
                    .ToArray()
                );
        }
    }

    [HttpGet("{id}/Participants")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.RaceParticipants[]))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Participants(int id)
    {
        return Ok(new Resp.RaceParticipants[] { new Resp.RaceParticipants {
                Category = Category.MasterC,
                Participants = new int[] { 69, 420 }
                }, new Resp.RaceParticipants {
                Category = Category.Elite,
                Participants = new int[] { 69420, 42069 }
                }});
    }

    [HttpGet("{id}/Positions")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.RacePositions[]))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Positions(int id)
    {
        string query = @"
            SELECT   name, activity
            FROM     race_positions
            JOIN     categories
            ON       category = id
            WHERE    race = @race
            ORDER BY category ASC, duration ASC
            ";

        var positions = new List<Resp.RacePositions>();
        Resp.RacePositions? last = null;
        var activities = new List<int>();

        using (var cmd = _db.Cmd(query))
        {
            var rows = cmd.Param("race", id).Rows<(string, int)>();
            foreach ((string categoryName, int activity) row in rows)
            {
                Enum.TryParse(row.categoryName, out Category category);
                if (last == null || last.Category != category)
                {
                    if (last != null)
                    {
                        last.Activities = activities.ToArray();
                    }

                    activities.Clear();

                    last = new Resp.RacePositions
                    {
                        Category = category,
                        Activities = new int[] { }
                    };

                    positions.Add(last);
                }

                activities.Add(row.activity);
            }
        }

        if (last != null)
        {
            last.Activities = activities.ToArray();
        }

        return Ok(positions.ToArray());
    }

    [HttpPatch("{id}")]
    [Authorize(Policy = "Organizer")]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult Patch(int id, Req.PatchRace req)
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
            using (var cmd = _db.Cmd("DELETE FROM race_tracks WHERE race=@id"))
            {
                deleted = await cmd.Param("id", id).Exec();
            }

            using (var cmd = _db.Cmd("DELETE FROM race_categories WHERE race=@id"))
            {
                deleted = await cmd.Param("id", id).Exec();
            }

            using (var cmd = _db.Cmd("DELETE FROM race_private_groups WHERE race=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            using (var cmd = _db.Cmd("DELETE FROM race_participants WHERE race=@id"))
            {
                await cmd.Param("id", id).Exec();
            }

            using (var cmd = _db.Cmd("DELETE FROM races WHERE id=@id"))
            {
                deleted = await cmd.Param("id", id).Exec();
            }

            txn.Commit();
        }

        return deleted > 0 ? NoContent() : NotFound();
    }

    private readonly ISqlConn _db;
}
