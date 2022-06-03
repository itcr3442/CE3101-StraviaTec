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
[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int[]))]
public class SearchController : ControllerBase
{
    [HttpGet]
    public ActionResult Users(string query)
    {
		return Ok(new int[] { 69, 420 });
    }

    [HttpGet]
    public ActionResult Groups(string query)
    {
		return Ok(new int[] { 69420 });
	}

    [HttpGet]
    public ActionResult Races(bool? filterRegistered, string? nameLike)
    {
		return Ok(new int[] { 69420 });
    }

    [HttpGet]
    public ActionResult Challenges(bool? filterRegistered, string? nameLike)
    {
		return Ok(new int[] { 69420 });
    }
}
