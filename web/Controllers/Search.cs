using System;
using System.IO;
using System.Linq;
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
        int? exact = null;
        if (query != null)
        {
            using (var cmd = _db.Cmd("SELECT id FROM users WHERE username=@query"))
            {
                exact = cmd.Param("query", query).Row<int>();
            }
        }

        var matches = new List<int>();
        if (exact != null)
        {
            matches.Add(exact.Value);
        }

        (string selectSql, string orderBy) =
            SearchSelect("users", query, "(first_name, last_name)");

        using (var cmd = _db.Cmd($"{selectSql} ORDER BY {orderBy}"))
        {
            if (query != null)
            {
                cmd.Param("query", query);
            }

            matches.AddRange(cmd.Rows<int>().Where(id => id != exact));
        }

        return Ok(matches.ToArray());
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

            return Ok(cmd.Rows<int>().ToArray());
        }
    }

    [HttpGet]
    public ActionResult Sponsors(string? query)
    {
        (string selectSql, string orderBy) = SearchSelect("sponsors", query, "brand_name");

        using (var cmd = _db.Cmd($"{selectSql} ORDER BY {orderBy}"))
        {
            if (query != null)
            {
                cmd.Param("query", query);
            }

            return Ok(cmd.Rows<int>().ToArray());
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
        string table = $"{ty}s";
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
            GROUP BY  {table}_.id{(query != null && query != "" ? ", rank" : "")}
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
        string head = "SELECT TOP 50";

        if (query == null || query == "")
        {
            return (selectSql: $"{head} id FROM {table} AS {table}_", orderBy: "id ASC");
        }

        string result = selfJoin ? $"{table}_.id" : "[key]";
        string selectSql = $"{head} {result} FROM FREETEXTTABLE({table}, {column}, @query)";

        if (selfJoin)
        {
            selectSql += $" JOIN {table} AS {table}_ ON [key] = {result}";
        }

        return (selectSql, orderBy: "rank DESC");
    }
}
