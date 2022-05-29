using System;
using System.IO;
using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/Users/{id}/[action]")]
public class ProfileController : ControllerBase
{
    public ProfileController(ISqlConn db) => _db = db;

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.HomeStats))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Stats(int id)
    {
        (int effective, int self) = this.OrSelf(id);

        using (var cmd = _db.Cmd("SELECT COUNT(id) FROM users WHERE id=@id"))
        {
            if (cmd.Param("id", effective).Row<int>() == 0)
            {
                return NotFound();
            }
        }

        int following;
        using (var cmd = _db.Cmd("SELECT COUNT(followee) FROM friends WHERE follower=@id"))
        {
            following = cmd.Param("id", effective).Row<int>() ?? 0;
        }

        int followers;
        using (var cmd = _db.Cmd("SELECT COUNT(follower) FROM friends WHERE followee=@id"))
        {
            followers = cmd.Param("id", effective).Row<int>() ?? 0;
        }

        int activities;
        using (var cmd = _db.Cmd("SELECT COUNT(id) FROM activities WHERE athlete=@id"))
        {
            activities = cmd.Param("id", effective).Row<int>() ?? 0;
        }

        var query = @"
            SELECT   TOP 1 id
            FROM     activities
            WHERE    athlete=@id
            ORDER BY end_time DESC, id DESC
            ";

        int? latest;
        using (var cmd = _db.Cmd(query))
        {
            latest = cmd.Param("id", effective).Row<int>();
        }

        return Ok(new Resp.HomeStats
        {
            Following = following,
            Followers = followers,
            Activities = activities,
            LatestActivity = latest,
        });
    }

    [HttpGet("{page}")]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.Paged))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult History(int id, int page)
    {
        return Ok(new Resp.Paged
        {
            Pages = 1,
            Page = new int[] { 69, 420 },
        });
    }

    private ISqlConn _db;
}
