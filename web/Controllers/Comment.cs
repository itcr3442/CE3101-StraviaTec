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
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult Comment(int activityId, Req.NewComment req)
    {
        return Random.Shared.Next(2) == 0 ? NoContent() : BadRequest();
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.Comment[]))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Comments(int activityId)
    {
        return Ok(new Resp.Comment[] {
				new Resp.Comment {
					User = 69,
					Time = DateTime.Now,
					Content = "kk",
				},
				new Resp.Comment {
					User = 70,
					Time = DateTime.Now,
					Content = "kk2",
				}
			});
    }
}
