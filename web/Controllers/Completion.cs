using System;
using System.IO;
using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;
using web.Body.Common;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/[action]/Available")]
[Produces(MediaTypeNames.Application.Json)]
[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int[]))]
public class AvailableController : ControllerBase
{
    [HttpGet]
    public ActionResult Categories()
    {
        return Ok(new Category[] { Category.Junior, Category.Elite });
    }

    [HttpGet]
    public ActionResult Races(ActivityType type, Category category)
    {
        return Ok(new int[] { 1, 2, 3 });
    }

    [HttpGet]
    public ActionResult Challenges(ActivityType type)
    {
        return Ok(new int[] { 1, 2, 3 });
    }
}

[ApiController]
[Route("Api/[action]/{id}/Progress")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
[ProducesResponseType(StatusCodes.Status409Conflict)]
public class ProgressController : ControllerBase
{
    [HttpPost]
    public ActionResult Races(int id, int activity)
    {
        return Ok();
    }

    [HttpPost]
    public ActionResult Challenges(int id, int activity)
    {
        return Ok();
    }
}
