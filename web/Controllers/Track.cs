using System;
using System.IO;
using System.Net.Mime;
using System.Xml;
using System.Xml.Linq;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Features;
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
    [ActionName("Activities")]
    [Produces(MediaTypeNames.Application.Xml)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task GetActivityTrack(int id)
    {
        await ReadTrack("SELECT track FROM activity_tracks WHERE activity=@id", id);
    }

    [HttpPut]
    [ActionName("Activities")]
    [FileUpload(MediaTypeNames.Application.Xml)]
    [Consumes(MediaTypeNames.Application.Xml)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> PutActivityTrack(int id)
    {
        using (var txn = _db.Txn())
        {
            using (var cmd = txn.Cmd("SELECT athlete FROM activities WHERE id=@id"))
            {
                int? athlete = cmd.Param("id", id).Row<int>();
                if (athlete == null)
                {
                    return NotFound();
                }
                else if (athlete != this.LoginId())
                {
                    return Forbid();
                }
            }

            string delete = "DELETE FROM activity_tracks WHERE activity=@id";
            string insert = "INSERT INTO activity_tracks(activity, track) VALUES(@id, @track)";
            return await WriteTrack(txn, delete, insert, id);
        }
    }

    [HttpGet]
    [ActionName("Races")]
    [Produces(MediaTypeNames.Application.Xml)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task GetRacesTrack(int id)
    {
        await ReadTrack("SELECT track FROM race_tracks WHERE race=@id", id);
    }

    [HttpPut]
    [ActionName("Races")]
    [Authorize(Policy = "Organizer")]
    [FileUpload(MediaTypeNames.Application.Xml)]
    [Consumes(MediaTypeNames.Application.Xml)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> PutRacesTrack(int id)
    {
        using (var txn = _db.Txn())
        {
            string delete = "DELETE FROM race_tracks WHERE race=@id";
            string insert = "INSERT INTO race_tracks(race, track) VALUES(@id, @track)";
            return await WriteTrack(txn, delete, insert, id);
        }
    }

    private ISqlConn _db;

    [NonActionAttribute]
    private async Task ReadTrack(string query, int id)
    {
        using (var cmd = _db.Cmd(query))
        {
            var reader = cmd.Param("id", id).Xml();
            if (reader.MoveToContent() == XmlNodeType.None)
            {
                Response.StatusCode = StatusCodes.Status404NotFound;
                return;
            }

            Response.StatusCode = StatusCodes.Status200OK;
            Response.ContentType = MediaTypeNames.Application.Xml;
            await Response.StartAsync();

            using (var stream = Response.BodyWriter.AsStream(false))
            {
                using (var writer = XmlWriter.Create(stream))
                {
                    writer.WriteNode(reader, true);
                }
            }
        }
    }

    [NonActionAttribute]
    private async Task<ActionResult> WriteTrack(ISqlTxn txn, string delete, string insert, int id)
    {
        using (var cmd = txn.Cmd(delete))
        {
            await cmd.Param("id", id).Exec();
        }

        var settings = new XmlReaderSettings();
        settings.Async = true;

        var features = HttpContext.Features.Get<IHttpBodyControlFeature>();
        if (features != null)
        {
            features.AllowSynchronousIO = true;
        }

        using (var reader = XmlReader.Create(Request.Body, settings))
        {
            using (var cmd = txn.Cmd(insert))
            {
                await cmd.Param("id", id).Param("track", reader).Exec();
            }
        }

        txn.Commit();
        return NoContent();
    }
}
