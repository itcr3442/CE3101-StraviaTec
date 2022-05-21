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
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult Follow(int followeeId)
    {
        switch (Random.Shared.Next(3))
        {
            case 0:
                return CreatedAtAction(nameof(Follow), new { followeeId = followeeId });

            case 1:
                return Conflict();

            default:
                return BadRequest();
        }
    }

    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Unfollow(int followeeId)
    {
        return Ok();
    }
}
