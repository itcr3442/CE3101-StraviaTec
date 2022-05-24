using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace web;

public static class Authn
{
    public static int LoginId(this ControllerBase controller)
    {
        var principal = controller.HttpContext.User as ClaimsPrincipal;
        return int.Parse(principal.FindFirst("id")!.Value);
    }

    public static (int effective, int self) OrSelf(this ControllerBase controller, int id)
    {
        int self = controller.LoginId();
        return (id == 0 ? self : id, self);
    }

    public static int? RequireSelf(this ControllerBase controller, int id)
    {
        (int effective, int self) = controller.OrSelf(id);
        return effective == self ? self : null;
    }
}
