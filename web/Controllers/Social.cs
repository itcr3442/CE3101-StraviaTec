using System;
using System.IO;
using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/[action]")]
public class DashboardController : ControllerBase
{
    [HttpGet("{page}")]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.Paged))]
    public ActionResult Feed(int page)
    {
        return Ok(new Resp.Paged
        {
            Pages = 1,
            Page = new int[] { 69, 420 },
        });
    }
}

[ApiController]
[Route("Api/Following/{followeeId}")]
public class FriendsController : ControllerBase
{
    public FriendsController(ISqlConn db) => _db = db;

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Follow(int followeeId)
    {
        int self = this.LoginId();

        string query = "INSERT INTO friends(follower, followee) VALUES(@follower, @followee)";
        using (var cmd = _db.Cmd(query))
        {
            await cmd.Param("follower", self).Param("followee", followeeId).Exec();
        }

        return CreatedAtAction(nameof(Follow), new { followeeId = followeeId });
    }

    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Unfollow(int followeeId)
    {
        return NoContent();
    }

    private ISqlConn _db;
}
