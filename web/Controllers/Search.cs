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
    public SearchController(ISqlConn db) => _db = db;

    [HttpGet]
    public ActionResult Users(string query)
    {
        string sql = @"
            SELECT   TOP 50 id
            FROM     users
            WHERE    username=@query OR FREETEXT((first_name, last_name), @query)
            ORDER BY id
            ";

        using (var cmd = _db.Cmd(sql))
        {
            return Ok(cmd.Param("query", query).Rows<int>().ToArray());
        }
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

    private readonly ISqlConn _db;
}
