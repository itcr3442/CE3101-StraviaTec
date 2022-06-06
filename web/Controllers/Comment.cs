using System;
using System.IO;
using System.Net.Mime;

using Microsoft.AspNetCore.Mvc;

using MongoDB.Driver;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/Activities/{activityId}/Comments")]
public class CommentsController : ControllerBase
{
    public CommentsController(IMongoConn mongo) => _mongo = mongo;

    [HttpPost]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult Comment(int activityId, Req.NewComment req)
    {
        return Random.Shared.Next(2) == 0 ? NoContent() : BadRequest();
    }

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

    private readonly IMongoConn _mongo;
}

class StoredComment
{
    public int Activity { get; set; }
    public int Author { get; set; }
    public DateTime Time { get; set; }
    public string Content { get; set; } = null!;
}
