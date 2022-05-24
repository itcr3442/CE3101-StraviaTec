using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace web;

public static class Authn
{
    public static int LoginId(this ControllerBase controller)
    {
        var principal = controller.HttpContext.User as ClaimsPrincipal;
        return int.Parse(principal.FindFirst("uid")!.Value);
    }

    public static int? RequireSelf(this ControllerBase controller, int id)
    {
        int self = controller.LoginId();
        return id == 0 || id == self ? self : null;
    }
}
