using System;
using System.IO;
using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/[action]/Search")]
[Produces(MediaTypeNames.Application.Json)]
[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.Paged))]
public class SearchController : ControllerBase
{
    [HttpGet]
    public ActionResult Users(string query, int page)
    {
        return Ok(new Resp.Paged
        {
            Pages = 10,
            Page = new int[] { 69, 420 },
        });
    }

    [HttpGet]
    public ActionResult Groups(string query, int page)
    {
        return Ok(new Resp.Paged
        {
            Pages = 1,
            Page = new int[] { 69420 },
        });
    }

    [HttpGet]
    public ActionResult Races(int page, bool? filterRegistered, string? nameLike)
    {
        return Ok(new Resp.Paged
        {
            Pages = 1,
            Page = new int[] { 69420 },
        });
    }

    [HttpGet]
    public ActionResult Challenges(int page, bool? filterRegistered, string? nameLike)
    {
        return Ok(new Resp.Paged
        {
            Pages = 1,
            Page = new int[] { 69420 },
        });
    }
}
