using System.Text.Json.Serialization;
using BackgroundSupportApi.Models;
using BackgroundSupportApi.Services;
using Microsoft.Extensions.Hosting.WindowsServices;
using Microsoft.Extensions.Options;

namespace BackgroundSupportApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            WebApplicationBuilder builder;
            var isWindows = OperatingSystem.IsWindows() && WindowsServiceHelpers.IsWindowsService();

            if (isWindows)
                builder = WebApplication.CreateBuilder(new WebApplicationOptions
                {
                    Args = args,
                    ContentRootPath = AppContext.BaseDirectory,
                    ApplicationName = System.Diagnostics.Process.GetCurrentProcess().ProcessName
                });
            builder = WebApplication.CreateBuilder(args);
            builder.Services.Configure<AppSettings>(builder.Configuration.GetSection(nameof(AppSettings)));
            // SubjectType приходит с фронтенда строкой, чтобы не хардкодить числовые значения в браузере.
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
            builder.Services.AddScoped<ISmtpService, SmtpService>();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            if (isWindows)
                builder.Host.UseWindowsService();

            var app = builder.Build();
            var appSettings = app.Services.GetService<IOptions<AppSettings>>()?.Value;
            app.UseCors(x =>
                x.WithOrigins(appSettings?.AllowedCorsUrls!)
                    .AllowAnyHeader()
                    .AllowCredentials()
                    .AllowAnyMethod());

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}
