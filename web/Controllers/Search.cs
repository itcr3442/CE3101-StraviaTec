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
    public ActionResult Users(string? query)
    {
        (string selectSql, string orderBy) =
            SearchSelect("users", query, "(first_name, last_name)");

        using (var cmd = _db.Cmd($"{selectSql} ORDER BY {orderBy}"))
        {
            if (query != null)
            {
                cmd.Param("query", query);
            }

            return Ok(cmd.Param("query", query).Rows<int>().ToArray());
        }
    }

    [HttpGet]
    public ActionResult Groups(string? query)
    {
        (string selectSql, string orderBy) = SearchSelect("groups", query, "name");

        using (var cmd = _db.Cmd($"{selectSql} ORDER BY {orderBy}"))
        {
            if (query != null)
            {
                cmd.Param("query", query);
            }

            return Ok(cmd.Param("query", query).Rows<int>().ToArray());
        }
    }

    [HttpGet]
    public ActionResult Races(string? query)
    {
        return RaceChallengeSearch("race", query);
    }

    [HttpGet]
    public ActionResult Challenges(string? query)
    {
        return RaceChallengeSearch("challenge", query);
    }

    private readonly ISqlConn _db;

    [NonAction]
    private ActionResult RaceChallengeSearch(string ty, string? query)
    {
        string table = "${ty}s";
        int self = this.LoginId();

        (string selectSql, string orderBy)
            = SearchSelect(table, query, "name", selfJoin: true);

        string sql = $@"
            {selectSql}
            LEFT JOIN {ty}_private_groups
            ON        id = {ty}
            LEFT JOIN group_members
            ON        {ty}_private_groups.group_id = group_members.group_id
            WHERE     member IS NULL OR member = @id
            GROUP BY  {table}.id
            ORDER BY  {orderBy}
            ";

        using (var cmd = _db.Cmd(sql))
        {
            if (query != null)
            {
                cmd.Param("query", query);
            }

            return Ok(cmd.Param("id", self).Rows<int>().ToArray());
        }
    }

    [NonAction]
    private (string selectSql, string orderBy) SearchSelect
    (
        string table,
        string? query,
        string column,
        bool selfJoin = false
    )
    {
        string head = "SELECT TOP 50 [key] FROM";

        if (query == null)
        {
            return (selectSql: $"{head} {table}", orderBy: "id ASC");
        }

        string selectSql = $"{head} FROM FREETEXTTABLE({table}, {column}, @query)";
        if (selfJoin)
        {
            selectSql += $"JOIN {table} ON [key] = {table}.id";
        }

        return (selectSql, orderBy: "rank DESC");
    }
}
