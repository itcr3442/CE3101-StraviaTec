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
[Route("Api/Sponsors/{id}")]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public class SponsorController : ControllerBase
{
    public SponsorController(ISqlConn db) => _db = db;

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.GetSponsor))]
    public ActionResult Get(int id)
    {
        string query = @"
			SELECT brand_name, legal_rep, legal_tel
			FROM   sponsors
			WHERE  id = @sponsor
			";

        (string brandName, string legalRep, string legalTel)? row;
        using (var cmd = _db.Cmd(query))
        {
            row = cmd.Param("sponsor", id).Row<(string, string, string)>();
        }

        if (row == null)
        {
            return NotFound();
        }

        return Ok(new Resp.GetSponsor
        {
            Name = row.Value.brandName,
            LegalRep = row.Value.legalRep,
            LegalTel = row.Value.legalTel,
        });
    }

    [HttpGet("Logo")]
    [Produces("image/png")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult Logo(int id)
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
