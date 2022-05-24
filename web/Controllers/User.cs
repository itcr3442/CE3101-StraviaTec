using System;
using System.IO;
using System.Net.Mime;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using web.Body.Common;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Authorize]
[Route("Api/Users")]
public class IdentityController : ControllerBase
{
    public IdentityController(ISqlConn conn) => _conn = conn;

    [HttpPost("[action]")]
    [AllowAnonymous]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.Ref))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> Login(Req.Login req)
    {
        (int id, byte[] hash, byte[] salt) row;
        using (var cmd = _conn.Cmd("SELECT id, hash, salt FROM users WHERE username=@username"))
        {
            var result = cmd.Param("username", req.Username).Tuple<(int, byte[], byte[])>();
            if (result == null)
            {
                return Unauthorized();
            }

            row = result.Value;
        }

        if (!HashFor(req.Password, row.salt).SequenceEqual(row.hash))
        {
            return Unauthorized();
        }

        var claims = new Claim[] { new Claim("id", row.id.ToString()) };
        var scheme = CookieAuthenticationDefaults.AuthenticationScheme;
        var identity = new ClaimsIdentity(claims, scheme);
        await HttpContext.SignInAsync(scheme, new ClaimsPrincipal(identity));

        return Ok(new Resp.Ref(row.id));
    }

    [HttpPost("[action]")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> Logout()
    {
        await HttpContext.SignOutAsync();
		return Ok();
    }

    [HttpPut("{id}/Password")]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult UpdatePassword(Req.UpdatePassword req)
    {
        return Random.Shared.Next(2) == 0 ? Ok() : Unauthorized();
    }

    private ISqlConn _conn;

    // Calcula el campo de hash de clave a partir del plaintext y la sal
    private byte[] HashFor(string password, byte[] salt)
    {
        return KeyDerivation.Pbkdf2(password, salt, KeyDerivationPrf.HMACSHA256, 1000, 16);
    }
}

[ApiController]
[Authorize]
[Route("Api/Users")]
public class UserController : ControllerBase
{
    [HttpPost]
    [Consumes(MediaTypeNames.Application.Json)]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Resp.Ref))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult New(Req.NewUser req)
    {
        switch (Random.Shared.Next(3))
        {
            case 0:
                return CreatedAtAction(nameof(Get), new { id = 69 }, new Resp.Ref(69));

            case 1:
                return BadRequest();

            default:
                return Conflict();
        }
    }

    [HttpGet("{id}")]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Resp.GetUser))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int id)
    {
        return Ok(new Resp.GetUser
        {
            Username = "foo",
            FirstName = "bar",
            LastName = "baz",
            BirthDate = DateTime.Today,
            Nationality = "cr",
            Relationship = UserRelationship.Self,
        });
    }

    [HttpPatch("{id}")]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult Patch(int id, Req.PatchUser req)
    {
        switch (Random.Shared.Next(3))
        {
            case 0:
                return Ok();

            case 1:
                return BadRequest();

            default:
                return Conflict();
        }
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Delete(int id)
    {
        return Ok();
    }
}

[ApiController]
[Authorize]
[Route("Api/Users/{id}/Photo")]
public class PhotoController : ControllerBase
{
    public PhotoController(ISqlConn conn) => _conn = conn;

    [HttpGet]
    [Produces(MediaTypeNames.Image.Jpeg)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int id)
    {
        using (var cmd = _conn.Cmd("SELECT photo FROM photos WHERE user_id=@id"))
        {
            using (var stream = cmd.Param("id", id).Stream())
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
    [Consumes(MediaTypeNames.Image.Jpeg)]
    [RequestSizeLimit(1048576)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Put(int id, IFormFile image)
    {
        return Ok();
    }

    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Delete(int id)
    {
        return Random.Shared.Next(2) == 0 ? Ok() : NotFound();
    }

    private ISqlConn _conn;
}
