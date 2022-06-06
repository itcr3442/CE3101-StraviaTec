using System;
using System.IO;
using System.Net.Mime;

using Microsoft.AspNetCore.Mvc;

using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/Activities/{activityId}/Comments")]
public class CommentsController : ControllerBase
{
    public CommentsController(ISqlConn sql, IMongoConn mongo)
    {
        _sql = sql;
        _mongo = mongo;
    }

    /// <summary>
    /// Crea un nuevo comentario
    /// </summary>
    [HttpPost]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Comment(int activityId, Req.NewComment req)
    {
        // Previene inconsistencias
        using (var txn = _sql.Txn())
        {
            using (var cmd = txn.Cmd("SELECT id FROM activities WHERE id=@id"))
            {
                if (cmd.Param("id", activityId).Row<int>() == null)
                {
                    return NotFound();
                }
            }

            _mongo.Collection<StoredComment>("comments")
                  .InsertOne(new StoredComment
                  {
                      Activity = activityId,
                      Author = this.LoginId(),
                      Time = DateTime.Now,
                      Content = req.Content,
                  });
        }

        return NoContent();
    }

    /// <summary>
    /// Obtiene un comentario de la base de datos
    /// </summary>
    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.Comment[]))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Comments(int activityId)
    {
        var cursor = _mongo.Collection<StoredComment>("comments")
                         .Find(doc => doc.Activity == activityId)
                         .SortByDescending(doc => doc.Time)
                         .ToCursor();

        using (cursor)
        {
            return Ok(cursor.ToEnumerable()
                  .Select(doc => new Resp.Comment
                  {
                      User = doc.Author,
                      Time = doc.Time,
                      Content = doc.Content,
                  })
                  .ToArray());
        }
    }

    private readonly ISqlConn _sql;
    private readonly IMongoConn _mongo;
}

[BsonIgnoreExtraElements]
class StoredComment
{
    public int Activity { get; set; }
    public int Author { get; set; }
    public DateTime Time { get; set; }
    public string Content { get; set; } = null!;
}
