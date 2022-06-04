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
        return Ok(new Resp.GetChallenge
        {
            Name = "no ser puto",
            Start = DateTime.Today,
            End = DateTime.Today.AddDays(69),
            Type = ActivityType.Kayaking,
            Goal = 420.420M,
            Progress = 69.69M,
            RemainingDays = 4,
            PrivateGroups = new int[] { },
            Status = ChallengeStatus.Registered,
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
