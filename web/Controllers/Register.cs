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
[Route("Api/[action]/{id}/Registration")]
public class RegistrationController : ControllerBase
{
    public RegistrationController(ISqlConn db) => _db = db;

    [HttpPost]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult> Races(int id, Category category)
    {
        int self = this.LoginId();
        using (var txn = _db.Txn())
        {
            string query = @"
                SELECT COUNT(race)
                FROM   race_participants
                WHERE  race=@race AND athlete=@athlete
                ";

            using (var cmd = txn.Cmd(query))
            {
                if ((cmd.Param("race", id).Param("athlete", self).Row<int>() ?? 0) > 0)
                {
                    return Conflict();
                }
            }

            query = @"
                INSERT INTO receipts(race, athlete, category)
                SELECT @race, @athlete, id
                FROM   categories
                WHERE  name=@category
                ";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("race", id)
                   .Param("athlete", self)
                   .Param("category", category.ToString());

                await cmd.Exec();
            }

            txn.Commit();
        }

        return CreatedAtAction(nameof(Races), new { id = id });
    }

    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Races(int id)
    {
        int self = this.LoginId();
        int deleted = 0;

        using (var txn = _db.Txn())
        {
            string query = @"
                DELETE FROM race_participants
                WHERE       race=@race AND athlete=@athlete
                ";

            using (var cmd = txn.Cmd(query))
            {
                deleted += await cmd.Param("race", id).Param("athlete", self).Exec();
            }

            query = @"
                DELETE FROM receipts
                WHERE       race=@race AND athlete=@athlete
                ";

            using (var cmd = txn.Cmd(query))
            {
                deleted += await cmd.Param("race", id).Param("athlete", self).Exec();
            }

            txn.Commit();
        }

        return deleted > 0 ? NoContent() : NotFound();
    }

    [HttpPost]
    [ActionName("Challenges")] // Evita colisión de prototipos
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult RegisterChallenge(int id)
    {
        if (Random.Shared.Next(3) == 0)
        {
            return Conflict();
        }

        return CreatedAtAction("Challenges", new { id = id });
    }

    [HttpDelete]
    [ActionName("Challenges")] // Evita colisión de prototipos
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult UnregisterChallenge(int id)
    {
        return Random.Shared.Next(2) == 0 ? NoContent() : Conflict();
    }

    private readonly ISqlConn _db;
}

[ApiController]
[Route("Api/Races/{raceId}/Receipts")]
public class ReceiptController : ControllerBase
{
    [HttpPost]
    [Consumes(MediaTypeNames.Application.Pdf)]
    [RequestSizeLimit(1048576)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult New(int raceId, IFormFile receipt)
    {
        if (Random.Shared.Next(3) == 0)
        {
            return Conflict();
        }

        return CreatedAtAction(nameof(Get), new { raceId = raceId, userId = 69 });
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int[]))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int raceId)
    {
        return Ok(new int[] { 69, 420 });
    }

    [HttpGet("{userId}")]
    [Produces(MediaTypeNames.Application.Pdf)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Download(int raceId, int userId)
    {
        return File(Stream.Null, MediaTypeNames.Application.Pdf, "recibo.pdf");
    }
}

[ApiController]
[Route("Api/Races/{raceId}/Receipts/{userId}/[action]")]
[Authorize(Policy = "Organizer")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public class ConfirmationController : ControllerBase
{
    public ConfirmationController(ISqlConn db) => _db = db;

    [HttpPost]
    public async Task<ActionResult> Accept(int raceId, int userId)
    {
        using (var txn = _db.Txn())
        {
            string query = @"
                SELECT category
                FROM   receipts
                WHERE  race=@race AND athlete=@athlete
                ";

            int? category;
            using (var cmd = txn.Cmd(query))
            {
                category = cmd.Param("race", raceId).Param("athlete", userId).Row<int>();
            }

            if (category == null)
            {
                return NotFound();
            }

            query = @"
                INSERT INTO race_participants(race, athlete, category)
                VALUES(@race, @athlete, @category)
                ";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("race", raceId).Param("athlete", userId).Param("category", category);
                await cmd.Exec();
            }

            txn.Commit();
        }

        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult> Reject(int raceId, int userId)
    {
        string query = @"
            DELETE FROM receipts
            WHERE       race=@race AND athlete=@athlete
            ";

        using (var cmd = _db.Cmd(query))
        {
            cmd.Param("race", raceId).Param("athlete", userId);
            return await cmd.Exec() > 0 ? NoContent() : NotFound();
        }
    }

    private readonly ISqlConn _db;
}
