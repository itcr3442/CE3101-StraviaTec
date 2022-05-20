using Microsoft.AspNetCore.Mvc;

namespace web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IdentityController : ControllerBase
{
    [HttpPost("login")]
    public IResult Login(string username, string password)
    {
        var ok = username == "foo" && password == "bar";
        return ok ? Results.Ok(new { id = 69 }) : Results.Unauthorized();
    }
}
