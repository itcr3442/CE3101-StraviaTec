using System;
using System.Data;
using System.IO;
using System.Net.Mime;
using System.Security.Claims;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;

using MongoDB.Driver;

using web.Body.Common;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/Users")]
public class IdentityController : ControllerBase
{
    public IdentityController(ISqlConn db) => _db = db;

    [HttpPost("[action]")]
    [AllowAnonymous]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.Identity))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> Login(Req.Login req)
    {
        (int id, byte[] hash, byte[] salt, bool organizer) row;

        var query = "SELECT id, hash, salt, is_organizer FROM users WHERE username=@username";
        using (var cmd = _db.Cmd(query))
        {
            var result = cmd.Param("username", req.Username).Row<(int, byte[], byte[], bool)>();
            if (result == null)
            {
                return Unauthorized();
            }

            row = result.Value;
        }

        if (!Authn.HashFor(req.Password, row.salt).SequenceEqual(row.hash))
        {
            return Unauthorized();
        }

        var type = row.organizer ? UserType.Organizer : UserType.Athlete;
        var claims = new Claim[]
        {
            new Claim("id", row.id.ToString()),
            new Claim("type", type.ToString()),
        };

        var scheme = CookieAuthenticationDefaults.AuthenticationScheme;
        var identity = new ClaimsIdentity(claims, scheme);
        await HttpContext.SignInAsync(scheme, new ClaimsPrincipal(identity));

        return Ok(new Resp.Identity { Id = row.id, Type = type });
    }

    [HttpPost("[action]")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> Logout()
    {
        await HttpContext.SignOutAsync();
        return NoContent();
    }

    [HttpPut("{id}/Password")]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> UpdatePassword(int id, Req.UpdatePassword req)
    {
        int? self = this.RequireSelf(id);
        if (self == null)
        {
            return Forbid();
        }

        using (var txn = _db.Txn())
        {
            (byte[] hash, byte[] salt) row;
            using (var cmd = txn.Cmd("SELECT hash, salt FROM users WHERE id=@id"))
            {
                var result = cmd.Param("id", self).Row<(byte[], byte[])>();
                if (result == null)
                {
                    return Unauthorized();
                }

                row = result.Value;
            }

            if (!Authn.HashFor(req.Current, row.salt).SequenceEqual(row.hash))
            {
                return Unauthorized();
            }

            var newSalt = Authn.RandomSalt();
            var newHash = Authn.HashFor(req.New, newSalt);

            using (var cmd = txn.Cmd("UPDATE users SET hash=@hash, salt=@salt WHERE id=@id"))
            {
                await cmd.Param("id", self).Param("hash", newHash).Param("salt", newSalt).Exec();
            }

            txn.Commit();
        }

        return NoContent();
    }

    private readonly ISqlConn _db;
}

[ApiController]
[Route("Api/Users")]
public class UserController : ControllerBase
{
    public UserController(ISqlConn db, IMongoConn mongo)
    {
        _db = db;
        _mongo = mongo;
    }

    [HttpPost]
    [AllowAnonymous]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Resp.Ref))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult New(Req.NewUser req)
    {
        bool is_organizer = req.Type == UserType.Organizer;
        if (is_organizer && !this.RequireOrganizer())
        {
            return Forbid();
        }

        var salt = Authn.RandomSalt();
        var hash = Authn.HashFor(req.Password, salt);

        var query = @"
            INSERT INTO users
            ( username, first_name, last_name, birth_date
            , country, is_organizer, hash, salt
            ) OUTPUT INSERTED.id VALUES
            ( @username, @first_name, @last_name, @birth_date
            , @country, @is_organizer, @hash, @salt
            )";

        int id;
        using (var cmd = _db.Cmd(query))
        {
            cmd.Param("username", req.Username)
               .Param("first_name", req.FirstName)
               .Param("last_name", req.LastName)
               .Param("birth_date", req.BirthDate)
               .Param("country", req.Nationality)
               .Param("is_organizer", is_organizer)
               .Param("hash", hash)
               .Param("salt", salt);

            id = cmd.InsertId();
        }

        return CreatedAtAction(nameof(Get), new { id }, new Resp.Ref(id));
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.GetUser))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Get(int id)
    {
        (int effective, int self) = this.OrSelf(id);

        using (var txn = _db.Txn())
        {
            (string username, string firstName, string lastName,
             DateTime birthDate, string country) row;

            var query = @"
                SELECT username, first_name, last_name, birth_date, country
                FROM   users
                WHERE  id=@id";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("id", effective);

                var result = cmd.Row<(string, string, string, DateTime, string)>();
                if (result == null)
                {
                    return NotFound();
                }

                row = result.Value;
            }

            int? age;
            using (var cmd = txn.Cmd("current_age"))
            {
                cmd.Param("id", effective).Output("age", SqlDbType.Int);
                age = (await cmd.StoredProcedure())["@age"].Value as int?;
            }

            if (age == null)
            {
                return NotFound();
            }

            var relationship = effective == self ? UserRelationship.Self : UserRelationship.None;
            if (effective != self)
            {
                query = @"
                    SELECT follower
                    FROM   friends
                    WHERE  (follower=@id AND followee=@self) OR (follower=@self AND followee=@id)";

                using (var cmd = txn.Cmd(query))
                {
                    cmd.Param("id", effective).Param("self", self);
                    foreach (int follower in cmd.Rows<int>())
                    {
                        relationship = (relationship, follower == self) switch
                        {
                            (UserRelationship.None, true) => UserRelationship.Following,
                            (UserRelationship.None, false) => UserRelationship.FollowedBy,
                            (UserRelationship.Following, false) => UserRelationship.BothFollowing,
                            (UserRelationship.FollowedBy, true) => UserRelationship.BothFollowing,
                            _ => relationship,
                        };
                    }
                }
            }

            return Ok(new Resp.GetUser
            {
                Username = row.username,
                FirstName = row.firstName,
                LastName = row.lastName,
                BirthDate = row.birthDate,
                Age = age.Value,
                Nationality = row.country,
                Relationship = relationship,
            });
        }
    }

    [HttpPatch("{id}")]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult> Patch(int id, Req.PatchUser req)
    {
        int? self = this.RequireSelf(id);
        if (self == null)
        {
            return Forbid();
        }

        using (var txn = _db.Txn())
        {
            (string username, string firstName, string lastName,
             DateTime birthDate, string country) row;

            var query = @"
                SELECT username, first_name, last_name, birth_date, country
                FROM   users
                WHERE  id=@id";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("id", self);

                var result = cmd.Row<(string, string, string, DateTime, string)>();
                if (result == null)
                {
                    return NotFound();
                }

                row = result.Value;
            }

            query = @"
                UPDATE users
                SET    username=@username,
                       first_name=@first_name,
                       last_name=@last_name,
                       birth_date=@birth_date,
                       country=@country
                WHERE  id=@id";

            using (var cmd = txn.Cmd(query))
            {
                await cmd.Param("id", self)
                   .Param("username", req.Username ?? row.username)
                   .Param("first_name", req.FirstName ?? row.firstName)
                   .Param("last_name", req.LastName ?? row.lastName)
                   .Param("birth_date", req.BirthDate ?? row.birthDate)
                   .Param("country", req.Nationality ?? row.country)
                   .Exec();
            }

            txn.Commit();
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int id)
    {
        int? self = this.RequireSelf(id);
        if (self == null)
        {
            return Forbid();
        }

        using (var txn = _db.Txn())
        {
            var comments = _mongo.Collection<StoredComment>("comments");
            var filter = Builders<StoredComment>.Filter;
            comments.DeleteMany(filter.Eq(comment => comment.Author, id));

            using (var cmd = txn.Cmd("SELECT id FROM activities WHERE athlete=@id"))
            {
                foreach (int activity in cmd.Param("id", self).Rows<int>())
                {
                    comments.DeleteMany(filter.Eq(comment => comment.Activity, activity));
                }
            }

            int? count;
            using (var cmd = txn.Cmd("delete_user"))
            {
                cmd.Param("id", self).Output("count", SqlDbType.Int);
                count = (await cmd.StoredProcedure())["@count"].Value as int?;
            }

            if ((count ?? 0) == 0)
            {
                return NotFound();
            }

            txn.Commit();
        }

        await HttpContext.SignOutAsync();
        return NoContent();
    }

    private readonly ISqlConn _db;
    private readonly IMongoConn _mongo;
}

[ApiController]
[Route("Api/Users/{id}/Photo")]
public class PhotoController : ControllerBase
{
    public PhotoController(ISqlConn db) => _db = db;

    [HttpGet]
    [Produces(MediaTypeNames.Image.Jpeg)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int id)
    {
        (int effective, int self) = this.OrSelf(id);

        using (var cmd = _db.Cmd("SELECT photo FROM photos WHERE user_id=@id"))
        {
            using (var stream = cmd.Param("id", effective).Stream())
            {
                var photo = stream.Take();
                if (photo == null)
                {
                    return NotFound();
                }

                return File(photo, MediaTypeNames.Image.Jpeg);
            }
        }
    }

    [HttpPut]
    [FileUpload(MediaTypeNames.Image.Jpeg)]
    [Consumes(MediaTypeNames.Image.Jpeg)]
    [RequestSizeLimit(1048576)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Put(int id)
    {
        int? self = this.RequireSelf(id);
        if (self == null)
        {
            return Forbid();
        }

        using (var txn = _db.Txn())
        {
            using (var cmd = txn.Cmd("DELETE FROM photos WHERE user_id=@id"))
            {
                await cmd.Param("id", self).Exec();
            }

            using (var cmd = txn.Cmd("INSERT INTO photos(user_id, photo) VALUES(@id, @photo)"))
            {
                await cmd.Param("id", self).Param("photo", Request.Body).Exec();
            }

            txn.Commit();
        }

        return NoContent();
    }

    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int id)
    {
        int? self = this.RequireSelf(id);
        if (self == null)
        {
            return Forbid();
        }

        using (var cmd = _db.Cmd("DELETE FROM photos WHERE user_id=@id"))
        {
            return await cmd.Param("id", self).Exec() > 0 ? NoContent() : NotFound();
        }
    }

    private readonly ISqlConn _db;
}
