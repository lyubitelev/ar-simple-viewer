using System.Text.Json.Serialization;
using BackgroundSupportApi.Models;
using BackgroundSupportApi.Services;
using Microsoft.Extensions.Hosting.WindowsServices;

namespace BackgroundSupportApi
{
    public class Program
    {
        private const string LeadFormsCorsPolicy = "LeadForms";

        public static void Main(string[] args)
        {
            WebApplicationBuilder builder;
            var isWindows = OperatingSystem.IsWindows() && WindowsServiceHelpers.IsWindowsService();

            // Как Windows-служба рабочий каталог процесса не совпадает с каталогом приложения,
            // поэтому content root задаётся явно — иначе appsettings.{Environment}.json не найдётся.
            if (isWindows)
                builder = WebApplication.CreateBuilder(new WebApplicationOptions
                {
                    Args = args,
                    ContentRootPath = AppContext.BaseDirectory,
                    ApplicationName = System.Diagnostics.Process.GetCurrentProcess().ProcessName
                });
            else
                builder = WebApplication.CreateBuilder(args);
            builder.Services.Configure<AppSettings>(builder.Configuration.GetSection(nameof(AppSettings)));

            var allowedOrigins = builder.Configuration
                .GetSection($"{nameof(AppSettings)}:{nameof(AppSettings.AllowedCorsUrls)}")
                .Get<string[]>() ?? Array.Empty<string>();

            // Allowlist задаётся конфигурацией окружения (appsettings.{Environment}.json или
            // AppSettings__AllowedCorsUrls__N). Пустой список — ошибка конфигурации, а не повод
            // открывать CORS всем.
            if (allowedOrigins.Length == 0)
                throw new InvalidOperationException(
                    "AppSettings:AllowedCorsUrls is empty. Configure the site origins allowed to post leads.");

            // Заявка приходит с origin статического сайта, поэтому CORS обязателен.
            // Credentials не включаем: запрос их не несёт.
            builder.Services.AddCors(options =>
                options.AddPolicy(LeadFormsCorsPolicy, policy =>
                    policy.WithOrigins(allowedOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod()));

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

            app.UseCors(LeadFormsCorsPolicy);

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // HTTPS-редирект здесь не используется: заявка приходит cross-origin через fetch,
            // а редирект на preflight браузер не выполняет. TLS терминируется на границе
            // деплоя (см. docs/deployment/lead-backend.md).
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}
