using web;

using System.Net;
using System.Reflection;
using System.Text.Json.Serialization;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Authentication.Cookies;

/* Punto de entrada principal del programa.
 * Aquí se inicializan e inician servicios.
 */

using web.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllersWithViews(config =>
{
    var policy = new AuthorizationPolicyBuilder()
                     .RequireAuthenticatedUser()
                     .Build();

    config.Filters.Add(new AuthorizeFilter(policy));
})
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()))
    .AddXmlSerializerFormatters();

builder.Services.AddEndpointsApiExplorer()
    .AddSwaggerGen(config =>
    {
        config.OperationFilter<FileUploadOperationFilter>();

        var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        config.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
    });

builder.Services.AddSingleton<IConnectionStrings, ConnectionStrings>()
    .AddScoped<ISqlConn, SqlConn>()
    .AddScoped<IMongoConn, MongoConn>()
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
        options.SlidingExpiration = true;
        options.LoginPath = PathString.Empty;

        // https://github.com/dotnet/aspnetcore/issues/18013
        options.Events.OnRedirectToAccessDenied = ctx =>
        {
            if (ctx.Request.Path.StartsWithSegments("/api") &&
                ctx.Response.StatusCode == (int)HttpStatusCode.OK)
            {
                ctx.Response.StatusCode = (int)HttpStatusCode.Forbidden;
            }
            else
            {
                ctx.Response.Redirect(ctx.RedirectUri);
            }

            return Task.FromResult(0);
        };

        // https://github.com/dotnet/aspnetcore/issues/18013
        options.Events.OnRedirectToLogin = ctx =>
        {
            if (ctx.Request.Path.StartsWithSegments("/api") &&
                ctx.Response.StatusCode == (int)HttpStatusCode.OK)
            {
                ctx.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
            }
            else
            {
                ctx.Response.Redirect(ctx.RedirectUri);
            }

            return Task.FromResult(0);
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Organizer", policy => policy.RequireClaim("type", new[] { "Organizer" }));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.ConfigureExceptionHandler();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html"); ;

app.Run();
