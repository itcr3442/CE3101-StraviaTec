using System;
using System.Data;
using System.IO;
using System.Net.Mime;
using web.Body.Common;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Microsoft.Data.SqlClient;

using Req = web.Body.Req;
using Resp = web.Body.Resp;

namespace web.Controllers;

[ApiController]
[Route("Api/[action]/{id}/Registration")]
public class RegistrationController : ControllerBase
{
    public RegistrationController(ISqlConn db) => _db = db;

    /// <summary>
    /// Registra un usuario a una carrera
    /// </summary>
    [HttpPost]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult> Races(int id, Category category)
    {
        int self = this.LoginId();
        using (var txn = _db.Txn())
        {
            string query = @"
                SELECT COUNT(race)
                FROM   race_participants
                WHERE  race=@race AND athlete=@athlete
                ";

            using (var cmd = txn.Cmd(query))
            {
                if ((cmd.Param("race", id).Param("athlete", self).Row<int>() ?? 0) > 0)
                {
                    return Conflict();
                }
            }

            query = @"
                INSERT INTO receipts(race, athlete, category)
                SELECT @race, @athlete, id
                FROM   categories
                WHERE  name=@category
                ";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("race", id)
                   .Param("athlete", self)
                   .Param("category", category.ToString());

                await cmd.Exec();
            }

            txn.Commit();
        }

        return CreatedAtAction(nameof(Races), new { id = id });
    }

    /// <summary>
    /// Elimina un usuario de una carrera
    /// </summary>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Races(int id)
    {
        int self = this.LoginId();
        int deleted = 0;

        using (var txn = _db.Txn())
        {
            string query = @"
                DELETE FROM race_participants
                WHERE       race=@race AND athlete=@athlete
                ";

            using (var cmd = txn.Cmd(query))
            {
                deleted += await cmd.Param("race", id).Param("athlete", self).Exec();
            }

            query = @"
                DELETE FROM receipts
                WHERE       race=@race AND athlete=@athlete
                ";

            using (var cmd = txn.Cmd(query))
            {
                deleted += await cmd.Param("race", id).Param("athlete", self).Exec();
            }

            txn.Commit();
        }

        return deleted > 0 ? NoContent() : NotFound();
    }

    /// <summary>
    /// Registra un usuario a un reto
    /// </summary>
    [HttpPost]
    [ActionName("Challenges")] // Evita colisi??n de prototipos
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult> RegisterChallenge(int id)
    {
        string query = @"
            INSERT INTO challenge_participants(challenge, athlete)
            VALUES(@challenge, @athlete)
            ";

        using (var cmd = _db.Cmd(query))
        {
            await cmd.Param("challenge", id).Param("athlete", this.LoginId()).Exec();
        }

        return CreatedAtAction("Challenges", new { id = id });
    }

    /// <summary>
    /// Elimina un usuario de un reto
    /// </summary>
    [HttpDelete]
    [ActionName("Challenges")] // Evita colisi??n de prototipos
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UnregisterChallenge(int id)
    {
        int self = this.LoginId();
        using (var txn = _db.Txn())
        {
            int? count;
            using (var cmd = txn.Cmd("unregister_challenge"))
            {
                cmd.Param("athlete", self).Param("challenge", id).Output("count", SqlDbType.Int);
                count = (await cmd.StoredProcedure())["@count"].Value as int?;
            }

            if ((count ?? 0) == 0)
            {
                return NotFound();
            }

            txn.Commit();
        }

        return NoContent();
    }

    private readonly ISqlConn _db;
}

[ApiController]
[Route("Api/Races/{raceId}/Receipts")]
public class ReceiptController : ControllerBase
{
    public ReceiptController(ISqlConn db) => _db = db;

    /// <summary>
    /// Ingresa un recibo pdf de un usuario a inscribirse a una carrera
    /// </summary>
    [HttpPut]
    [FileUpload(MediaTypeNames.Application.Pdf)]
    [Consumes(MediaTypeNames.Application.Pdf)]
    [RequestSizeLimit(1048576)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Put(int raceId)
    {
        int self = this.LoginId();

        string query = @"
            UPDATE receipts
            SET    receipt=@receipt
            WHERE  race=@race AND athlete=@athlete
            ";

        int modified;
        using (var cmd = _db.Cmd(query))
        {
            cmd.Param("race", raceId).Param("athlete", self).Param("receipt", Request.Body);
            modified = await cmd.Exec();
        }

        return modified > 0 ? NoContent() : NotFound();
    }

    /// <summary>
    /// Obtiene la lista de recibos
    /// </summary>
    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int[]))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Get(int raceId)
    {
        using (var txn = _db.Txn())
        {
            using (var cmd = txn.Cmd("SELECT id FROM races WHERE id=@race"))
            {
                if (cmd.Param("race", raceId).Row<int>() == null)
                {
                    return NotFound();
                }
            }

            using (var cmd = txn.Cmd("SELECT athlete FROM receipts WHERE race=@race"))
            {
                return Ok(cmd.Param("race", raceId).Rows<int>().ToArray());
            }
        }
    }

    /// <summary>
    /// Obtiene un recibo espec??fico seg??n la id
    /// </summary>
    [HttpGet("{userId}")]
    [Produces(MediaTypeNames.Application.Pdf)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Download(int raceId, int userId)
    {
        (int effective, int self) = this.OrSelf(userId);

        string query = @"
            SELECT receipt
            FROM   receipts
            WHERE  race=@race AND athlete=@athlete
            ";

        using (var cmd = _db.Cmd(query))
        {
            using (var stream = cmd.Param("race", raceId).Param("athlete", effective).Stream())
            {
                var receipt = stream.Take();
                if (receipt == null)
                {
                    return NotFound();
                }

                return File(receipt, MediaTypeNames.Application.Pdf);
            }
        }
    }

    private readonly ISqlConn _db;
}

[ApiController]
[Route("Api/Races/{raceId}/Receipts/{userId}/[action]")]
[Authorize(Policy = "Organizer")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public class ConfirmationController : ControllerBase
{
    public ConfirmationController(ISqlConn db) => _db = db;

    /// <summary>
    /// Acepta un usaurio que se intent?? registrar a una carrera
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> Accept(int raceId, int userId)
    {
        (int effective, int self) = this.OrSelf(userId);

        using (var txn = _db.Txn())
        {
            string query = @"
                SELECT category
                FROM   receipts
                WHERE  race=@race AND athlete=@athlete
                ";

            int? category;
            using (var cmd = txn.Cmd(query))
            {
                category = cmd.Param("race", raceId).Param("athlete", effective).Row<int>();
            }

            if (category == null)
            {
                return NotFound();
            }

            query = @"
                INSERT INTO race_participants(race, athlete, category)
                VALUES(@race, @athlete, @category)
                ";

            using (var cmd = txn.Cmd(query))
            {
                cmd.Param("race", raceId).Param("athlete", effective).Param("category", category);
                await cmd.Exec();
            }

            query = @"
                DELETE FROM receipts
                WHERE race=@race AND athlete=@athlete
                ";

            using (var cmd = txn.Cmd(query))
            {
                await cmd.Param("race", raceId).Param("athlete", effective).Exec();
            }

            txn.Commit();
        }

        return NoContent();
    }

    /// <summary>
    /// Denega a un usaurio que se intent?? registrar a una carrera
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> Reject(int raceId, int userId)
    {
        (int effective, int self) = this.OrSelf(userId);

        string query = @"
            DELETE FROM receipts
            WHERE       race=@race AND athlete=@athlete
            ";

        using (var cmd = _db.Cmd(query))
        {
            cmd.Param("race", raceId).Param("athlete", effective);
            return await cmd.Exec() > 0 ? NoContent() : NotFound();
        }
    }

    private readonly ISqlConn _db;
}
