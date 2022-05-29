using System;
using System.IO;
using System.Net.Mime;
using System.Xml;
using System.Xml.Linq;
using Microsoft.AspNetCore.Mvc;
using web.Body.Common;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/[action]/{id}/Track")]
[RequestSizeLimit(4194304)] // 4MiB
[ProducesResponseType(StatusCodes.Status404NotFound)]
public class TrackController : ControllerBase
{
    public TrackController(ISqlConn db) => _db = db;

    [HttpGet]
    [Produces(MediaTypeNames.Application.Xml)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult?> Activities(int id)
    {
        return await ReadTrack("SELECT track FROM activity_tracks WHERE activity=@id", id);
    }

    [HttpPut]
    [Consumes(MediaTypeNames.Application.Xml)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult Activities(int id, [FromBody] XElement gpx)
    {
        return Random.Shared.Next(2) == 0 ? NoContent() : BadRequest();
    }

    [HttpGet]
    [Produces(MediaTypeNames.Application.Xml)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult?> Races(int id)
    {
        return await ReadTrack("SELECT track FROM race_tracks WHERE race=@id", id);
    }

    [HttpPut]
    [Consumes(MediaTypeNames.Application.Xml)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult Races(int id, [FromBody] XElement gpx)
    {
        return Random.Shared.Next(2) == 0 ? NoContent() : BadRequest();
    }

    private ISqlConn _db;

    [NonActionAttribute]
    private async Task<ActionResult?> ReadTrack(string query, int id)
    {
        using (var cmd = _db.Cmd(query))
        {
            var reader = cmd.Param("id", id).Xml();
            if (reader.MoveToContent() == XmlNodeType.None)
            {
                return NotFound();
            }

            Response.StatusCode = StatusCodes.Status200OK;
            Response.ContentType = MediaTypeNames.Application.Xml;
            await Response.StartAsync();

            XmlWriter.Create(Response.BodyWriter.AsStream(true)).WriteNode(reader, true);
            Response.BodyWriter.AsStream(true).Write(new byte[] { 0x54, 0x55, 0x56 }, 0, 3);
            return null;
        }
    }
}
