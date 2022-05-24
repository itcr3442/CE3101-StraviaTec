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
[Authorize]
[Route("Api/[action]/{id}/Registration")]
public class RegistrationController : ControllerBase
{
    [HttpPost]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult Races(int id, Category category)
    {
        if (Random.Shared.Next(3) == 0)
        {
            return Conflict();
        }

        return CreatedAtAction(nameof(Races), new { id = id });
    }

    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult Races(int id)
    {
        return Random.Shared.Next(2) == 0 ? Ok() : Conflict();
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
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult UnregisterChallenge(int id)
    {
        return Random.Shared.Next(2) == 0 ? Ok() : Conflict();
    }
}

[ApiController]
[Authorize]
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
[Authorize]
[Route("Api/Races/{raceId}/Receipts/{userId}/[action]")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public class ConfirmationController : ControllerBase
{
    [HttpPost]
    public ActionResult Accept(int raceId, int userId)
    {
        return Ok();
    }

    [HttpPost]
    public ActionResult Reject(int raceId, int userId)
    {
        return Ok();
    }
}
