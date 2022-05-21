using System;
using System.IO;
using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;
using web.Body.Common;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/Races")]
public class RaceController : ControllerBase
{
    [HttpPost]
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
            Start = DateTime.Today,
            End = DateTime.Today.AddDays(1),
            Type = ActivityType.Cycling,
            PrivateGroups = new int[] { },
            Price = 69.42M,
            Status = RaceStatus.WaitingConfirmation,
        });
    }

    [HttpGet("{id}/Leaderboard")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.LeaderboardRow[]))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Leaderboard(int id)
    {
        return Ok(new Resp.LeaderboardRow[] { new Resp.LeaderboardRow {
                Activity = 69,
                Seconds = 6969,
                Length = 0.420M,
                }});
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
        return Ok(new Resp.RacePositions[] { new Resp.RacePositions {
                Category = Category.Sub23,
                Activities = new int[] { 69, 420 }
                }, new Resp.RacePositions {
                Category = Category.Junior,
                Activities = new int[] { 69420, 42069 },
                }});
    }

    [HttpPatch("{id}")]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult Patch(int id, Req.PatchRace req)
    {
        return Random.Shared.Next(2) == 0 ? Ok() : BadRequest();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Delete(int id)
    {
        return Ok();
    }
}
