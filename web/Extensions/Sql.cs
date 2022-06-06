using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using System.Net;

using Microsoft.Data.SqlClient;

namespace web.Extensions;

public static class ExceptionMiddlewareExtensions
{
    public static void ConfigureExceptionHandler(this IApplicationBuilder app)
    {
        app.UseExceptionHandler(appError =>
        {
            appError.Run(context => {
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                context.Response.ContentType = "application/json";

                var contextFeature = context.Features.Get<IExceptionHandlerFeature>();
                if (contextFeature != null)
                {
                    var sqlExc = contextFeature.Error as SqlException;
                    if (sqlExc == null)
                    {
                        throw contextFeature.Error;
                    }

                    Console.WriteLine("===============");
                    Console.WriteLine(sqlExc.Number);
                    Console.WriteLine("===============");

                    switch (sqlExc.Number)
                    {
                        case 547:
                            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                            break;

                        default:
                            throw contextFeature.Error;
                    }

                    Console.WriteLine(sqlExc.ToString());
                }

                return Task.CompletedTask;
            });
        });
    }
}
