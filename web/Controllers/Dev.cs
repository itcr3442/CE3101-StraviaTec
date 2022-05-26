using System;
using System.IO;
using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/Dev")]
public class DevelopmentController : ControllerBase
{
    [HttpGet, HttpPost, HttpPut, HttpDelete, HttpPatch, HttpHead, HttpOptions]
    [Route("Status/{code}")]
    public ActionResult Status(int code)
    {
        return StatusCode(code);
    }
}
