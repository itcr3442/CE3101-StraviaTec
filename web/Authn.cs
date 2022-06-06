using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

using web.Body.Common;

namespace web;

/* Clase dependency-injected para manejo de autenticación.
 * Esto permite obtener y relacionar IDs de manera general.
 */
public static class Authn
{
	// ID del usuario logueado
    public static int LoginId(this ControllerBase controller)
    {
        var principal = controller.HttpContext.User as ClaimsPrincipal;
        return int.Parse(principal.FindFirst("id")!.Value);
    }

	/* ID efectivo para un ID ede entrada, así como el ID del usuario logueado.
	 * efectivo(id) = id si id != 0, de lo contrario es self.
	 */
    public static (int effective, int self) OrSelf(this ControllerBase controller, int id)
    {
        int self = controller.LoginId();
        return (id == 0 ? self : id, self);
    }

	// Retorna self si id == self, de lo contrario null.
    public static int? RequireSelf(this ControllerBase controller, int id)
    {
        (int effective, int self) = controller.OrSelf(id);
        return effective == self ? self : null;
    }

	// Retorna si el usuario actual es un organizador.
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
