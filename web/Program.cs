using web;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllersWithViews()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()))
    .AddXmlSerializerFormatters();

builder.Services.AddEndpointsApiExplorer()
    .AddSwaggerGen()
    .AddSingleton<IConnectionStrings, ConnectionStrings>()
    .AddScoped<ISqlConn, SqlConn>()
    .AddScoped<ISqlTxn, SqlTxn>()
    .AddSession(options => options.IdleTimeout = TimeSpan.FromMinutes(5));

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

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseSession();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html"); ;

app.Run();
