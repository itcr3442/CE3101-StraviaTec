using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

using web.Body.Common;

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

    public static bool RequireOrganizer(this ControllerBase controller)
    {
        var claim = (controller.HttpContext.User as ClaimsPrincipal).FindFirst("type");
        return claim != null ? claim.Value == UserType.Organizer.ToString() : false;
    }

    // Genera una sal aleatoria de 16 bytes
    public static byte[] RandomSalt()
    {
        var salt = new byte[16];
        Random.Shared.NextBytes(salt);
        return salt;
    }

    // Calcula el campo de hash de clave a partir del plaintext y la sal
    public static byte[] HashFor(string password, byte[] salt)
    {
        return KeyDerivation.Pbkdf2(password, salt, KeyDerivationPrf.HMACSHA256, 1000, 16);
    }
}
