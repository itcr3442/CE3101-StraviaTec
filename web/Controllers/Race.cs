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
    public async Task<ActionResult> New(Req.NewRace req)
    {
        int id;
        using (var txn = _db.Txn())
        {
            string query = @"
                INSERT INTO races(name, on_date, type, price)
                OUTPUT INSERTED.ID
                SELECT @name, @day, id, @price
                FROM   activity_types
                WHERE  name = @type
                ";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("name", req.Name)
                   .Param("day", req.Day)
                   .Param("type", req.Type.ToString())
                   .Param("price", req.Price);

                id = cmd.InsertId();
            }

            query = @"
                INSERT INTO race_private_groups(race, group_id)
                VALUES(@race, @group)
                ";

            foreach (int privateGroup in req.PrivateGroups)
            {
                using (var cmd = txn.Cmd(query))
                {
                    await cmd.Param("race", id).Param("group", privateGroup).Exec();
                }
            }

            query = @"
                INSERT INTO bank_accounts(race, iban)
                VALUES(@race, @iban)
                ";

            foreach (string iban in req.BankAccounts)
            {
                using (var cmd = txn.Cmd(query))
                {
                    await cmd.Param("race", id).Param("iban", iban).Exec();
                }
            }

            query = @"
                INSERT INTO race_categories(race, category)
                SELECT @race, id
                FROM   categories
                WHERE  name = @category
                ";

            foreach (Category category in req.Categories)
            {
                using (var cmd = txn.Cmd(query))
                {
                    await cmd.Param("race", id).Param("category", category.ToString()).Exec();
                }
            }

            query = @"
                INSERT INTO race_sponsors(race, sponsor)
                VALUES(@race, @sponsor)
                ";

            foreach (int sponsor in req.Sponsors)
            {
                using (var cmd = txn.Cmd(query))
                {
                    await cmd.Param("race", id).Param("sponsor", sponsor).Exec();
                }
            }

            txn.Commit();
        }

        return CreatedAtAction(nameof(Get), new { id = id }, new Resp.Ref(id));
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.GetRace))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int id)
    {
        int self = this.LoginId();
        using (var txn = _db.Txn())
        {
            string query = @"
                SELECT races.name, on_date, activity_types.name, price,
                FROM   races
                JOIN   activity_types
                ON     type = activity_types.id
                WHERE  races.id = @race
                ";

            (string name, DateTime day, string type, decimal price)? row;
            using (var cmd = txn.Cmd(query))
            {
                row = cmd.Param("race", id).Row<(string, DateTime, string, decimal)>();
            }

            if (row == null)
            {
                return NotFound();
            }

            query = @"
                SELECT   name, 0
                FROM     race_categories
                JOIN     categories
                ON       category = id
                WHERE    race = @race
                ORDER BY category
                ";

            Category[] categories;
            using (var cmd = txn.Cmd(query))
            {
                categories = cmd.Param("race", id)
                                .Rows<(string name, int)>()
                                .Select(row =>
                                {
                                    Enum.TryParse(row.name, out Category category);
                                    return category;
                                })
                                .ToArray();
            }

            query = @"
                SELECT   group_id
                FROM     race_private_groups
                WHERE    race = @race
                ORDER BY group_id
                ";

            int[] privateGroups;
            using (var cmd = txn.Cmd(query))
            {
                privateGroups = cmd.Param("race", id).Rows<int>().ToArray();
            }

            query = @"
                SELECT   iban, 0
                FROM     bank_accounts
                WHERE    race = @race
                ORDER BY iban
                ";

            string[] bankAccounts;
            using (var cmd = txn.Cmd(query))
            {
                bankAccounts = cmd.Param("race", id)
                                  .Rows<(string account, int)>()
                                  .Select(row => row.account)
                                  .ToArray();
            }

            query = @"
                SELECT   sponsor
                FROM     race_sponsors
                WHERE    race = @race
                ORDER BY sponsor
                ";

            int[] sponsors;
            using (var cmd = txn.Cmd(query))
            {
                sponsors = cmd.Param("race", id).Rows<int>().ToArray();
            }

            query = @"
                SELECT activity, 1
                FROM   race_participants
                WHERE  race = @race AND athlete = @athlete
                ";

            RaceStatus? status = null;
            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("race", id).Param("athlete", self);

                var statusRow = cmd.Row<(int? activity, int)>();
                if (statusRow != null)
                {
                    status = statusRow.Value.activity != null
                           ? RaceStatus.Completed : RaceStatus.Registered;
                }
            }

            if (status == null)
            {
                query = @"
                    SELECT COUNT(receipt)
                    FROM   race_receipts
                    WHERE  race = @race AND athlete = @athlete
                    ";

                int count;
                using (var cmd = txn.Cmd(query))
                {
                    count = cmd.Param("race", id).Param("athlete", self).Row<int>() ?? 0;
                }

                status = count > 0 ? RaceStatus.WaitingConfirmation : RaceStatus.NotRegistered;
            }

            Enum.TryParse(row.Value.type, out ActivityType type);
            return Ok(new Resp.GetRace
            {
                Name = row.Value.name,
                Day = row.Value.day,
                Type = type,
                Price = row.Value.price,
                Categories = categories,
                PrivateGroups = privateGroups,
                BankAccounts = bankAccounts,
                Sponsors = sponsors,
                Status = status.Value,
            });
        }
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
        string query = @"
            SELECT   name, athlete
            FROM     race_participants
            JOIN     categories
            ON       category = id
            WHERE    race = @race
            ORDER BY category ASC, athlete ASC
            ";

        var categories = new List<Resp.RaceParticipants>();
        Resp.RaceParticipants? last = null;
        var participants = new List<int>();

        using (var cmd = _db.Cmd(query))
        {
            var rows = cmd.Param("race", id).Rows<(string, int)>();
            foreach ((string categoryName, int athlete) row in rows)
            {
                Enum.TryParse(row.categoryName, out Category category);
                if (last == null || last.Category != category)
                {
                    if (last != null)
                    {
                        last.Participants = participants.ToArray();
                    }

                    participants.Clear();

                    last = new Resp.RaceParticipants
                    {
                        Category = category,
                        Participants = new int[] { }
                    };

                    categories.Add(last);
                }

                participants.Add(row.athlete);
            }
        }

        if (last != null)
        {
            last.Participants = participants.ToArray();
        }

        return Ok(categories.ToArray());
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
