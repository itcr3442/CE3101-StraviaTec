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

                    HttpStatusCode status;
                    switch (sqlExc.Number)
                    {
                        case 547:
                        case 2628:
                            status = HttpStatusCode.BadRequest;
                            break;

                        case 2627:
                            status = HttpStatusCode.Conflict;
                            break;

                        default:
                            Console.WriteLine("===============");
                            Console.WriteLine("===============");
                            Console.WriteLine("===============");
                            Console.WriteLine($"Unhandled SQL Server #{sqlExc.Number}");
                            Console.WriteLine("===============");
                            Console.WriteLine("===============");
                            Console.WriteLine("===============");

                            throw contextFeature.Error;
                    }

                    Console.WriteLine(sqlExc.ToString());
                    Console.WriteLine($"SQL Server #{sqlExc.Number} is ${status}");
                    context.Response.StatusCode = (int)status;
                }

                return Task.CompletedTask;
            });
        });
    }
}
