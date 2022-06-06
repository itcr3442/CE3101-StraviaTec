using System;
using System.Data;
using System.IO;
using System.Net.Mime;

using Microsoft.AspNetCore.Mvc;

using web.Body.Common;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/Sponsors/{id}/Logo")]
public class LogoController : ControllerBase
{
    public LogoController(ISqlConn db) => _db = db;

    [HttpGet]
    [Produces("image/png")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int id)
    {
        using (var cmd = _db.Cmd("SELECT logo FROM sponsor_logos WHERE sponsor=@sponsor"))
        {
            using (var stream = cmd.Param("id", id).Stream())
            {
                var logo = stream.Take();
                if (logo == null)
                {
                    return NotFound();
                }

                return File(logo, "image/png");
            }
        }
    }

    private readonly ISqlConn _db;
}
