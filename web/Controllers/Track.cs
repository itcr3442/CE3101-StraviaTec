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
[Route("Api/[action]/{id}/Path")]
[RequestSizeLimit(4194304)] // 4MiB
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public class TrackController : ControllerBase
{
    [HttpGet]
    [Produces(MediaTypeNames.Application.Xml)]
    public ActionResult Activities(int id)
    {
        return File("<todo></todo>", MediaTypeNames.Application.Xml);
    }

    [HttpPut]
    [Consumes(MediaTypeNames.Application.Xml)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult Activities(int id, [FromBody] XElement gpx)
    {
        return Random.Shared.Next(2) == 0 ? Ok() : BadRequest();
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Xml)]
    public ActionResult Races(int id)
    {
        return File("<todo></todo>", MediaTypeNames.Application.Xml);
    }

    [HttpPut]
    [Consumes(MediaTypeNames.Application.Xml)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult Races(int id, [FromBody] XElement gpx)
    {
        return Random.Shared.Next(2) == 0 ? Ok() : BadRequest();
    }
}
