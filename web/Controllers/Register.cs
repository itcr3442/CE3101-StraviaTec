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
        }

        return CreatedAtAction(nameof(Races), new { id = id });
    }

    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult Races(int id)
    {
        return Random.Shared.Next(2) == 0 ? NoContent() : Conflict();
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

    private ISqlConn _db;
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
    [HttpPost]
    public ActionResult Accept(int raceId, int userId)
    {
        return NoContent();
    }

    [HttpPost]
    public ActionResult Reject(int raceId, int userId)
    {
        return NoContent();
    }
}
