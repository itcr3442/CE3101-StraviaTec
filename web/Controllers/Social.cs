using System;
using System.IO;
using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/[action]")]
public class DashboardController : ControllerBase
{
    public DashboardController(ISqlConn db) => _db = db;

    /// <summary>
    /// Obtiene el feed del usuario para la pantalla de inicio
    /// </summary>
    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int[]))]
    public ActionResult Feed()
    {
        string query = @"
            SELECT   TOP 100 id
            FROM     activities
            JOIN     friends
            ON       athlete = followee
            WHERE    follower = @id
            ORDER BY end_time DESC
            ";

        using (var cmd = _db.Cmd(query))
        {
            return Ok(cmd.Param("id", this.LoginId()).Rows<int>().ToArray());
        }
    }

    private readonly ISqlConn _db;
}

[ApiController]
[Route("Api/Following/{followeeId}")]
public class FriendsController : ControllerBase
{
    public FriendsController(ISqlConn db) => _db = db;

    /// <summary>
    /// Agrega un amigo a un usuario
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Follow(int followeeId)
    {
        string query = "INSERT INTO friends(follower, followee) VALUES(@follower, @followee)";
        using (var cmd = _db.Cmd(query))
        {
            await cmd.Param("follower", this.LoginId()).Param("followee", followeeId).Exec();
        }

        return CreatedAtAction(nameof(Follow), new { followeeId = followeeId });
    }

    /// <summary>
    /// Elimina a un amigo de un usuario
    /// </summary>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Unfollow(int followeeId)
    {
        string query = "DELETE FROM friends WHERE follower=@follower AND followee=@followee";
        using (var cmd = _db.Cmd(query))
        {
            cmd.Param("follower", this.LoginId()).Param("followee", followeeId);
            return await cmd.Exec() > 0 ? NoContent() : NotFound();
        }
    }

    private ISqlConn _db;
}
