using System;
using System.IO;
using System.Net.Mime;
using System.Xml.Linq;
using Microsoft.AspNetCore.Mvc;
using web.Body.Common;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/Activities/{id?}")]
public class ActivityController : ControllerBase
{
    [HttpPost]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.Ref))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult New(Req.NewActivity req)
    {
        return Random.Shared.Next(2) == 0 ? Ok(new Resp.Ref(69)) : BadRequest();
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.GetActivity))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int id)
    {
        return Ok(new Resp.GetActivity
        {
            User = 69,
            Start = DateTime.Now,
            End = DateTime.Now.AddHours(1),
            Type = ActivityType.Cycling
        });
    }

    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Delete(int id)
    {
        return Ok();
    }
}

[ApiController]
[Route("Api/Activities/{id}/Path")]
public class PathController : ControllerBase
{
    [HttpGet]
    [Produces(MediaTypeNames.Application.Xml)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Download(int id)
    {
        return File("<todo></todo>", MediaTypeNames.Application.Xml);
    }

    [HttpPut]
    [RequestSizeLimit(4194304)] // 4MiB
    [Consumes(MediaTypeNames.Application.Xml)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult Upload(int id, [FromBody] XElement gpx)
    {
        return Random.Shared.Next(2) == 0 ? Ok() : BadRequest();
    }
}
