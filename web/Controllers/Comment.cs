using System;
using System.IO;
using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/Activities/{activityId}/Comments")]
public class CommentsController : ControllerBase
{
    [HttpPost]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult Comment(int activityId, Req.NewComment req)
    {
        return Ok();
    }

    [HttpGet("{page}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.Comments))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Comments(int activityId, int pageId)
    {
        return Ok(new Resp.Paged
        {
            Pages = 10,
            Page = new int[] { 69, 420 },
        });
    }
}
