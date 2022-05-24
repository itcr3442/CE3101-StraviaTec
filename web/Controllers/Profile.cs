using System;
using System.IO;
using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Authorize]
[Route("Api/Users/{id}/[action]")]
public class ProfileController : ControllerBase
{
    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.HomeStats))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Stats(int id)
    {
        return Ok(new Resp.HomeStats
        {
            Following = 69420,
            Followers = 42069,
            Activities = 1234,
            LatestActivity = 420,
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
}
