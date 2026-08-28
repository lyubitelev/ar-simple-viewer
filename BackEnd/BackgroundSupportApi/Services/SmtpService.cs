using BackgroundSupportApi.Extensions;
using BackgroundSupportApi.Models;
using Microsoft.Extensions.Options;
using MimeKit;

namespace BackgroundSupportApi.Services
{
    public interface ISmtpService
    {
        Task<SmtpResponseInfo> SendMessageAsync(MessageDto messageDto, CancellationToken cancellationToken);
    }

    public class SmtpService : ISmtpService
    {
        private readonly AppSettings _appSettings;
        private readonly ILogger<SmtpService> _logger;

        public SmtpService(IOptions<AppSettings> options, ILogger<SmtpService> logger)
        {
            _appSettings = options.Value;
            _logger = logger;
        }

        public async Task<SmtpResponseInfo> SendMessageAsync(MessageDto messageDto, CancellationToken cancellationToken)
        {
            try
            {
                var fromEmail = _appSettings.Smtp.Login;
                var fromPassword = _appSettings.Smtp.Password;
                var message = new MimeMessage().Enrich(fromEmail);
                message.Subject = messageDto.Subject.GetSubjectDescription();
                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = messageDto.CreateHtmlBody()
                };
                message.Body = bodyBuilder.ToMessageBody();

                using (var client = new MailKit.Net.Smtp.SmtpClient())
                {
                    await client.ConnectAsync("smtp-mail.outlook.com", 587, MailKit.Security.SecureSocketOptions.StartTls, cancellationToken);
                    await client.AuthenticateAsync(fromEmail, fromPassword, cancellationToken);
                    await client.SendAsync(message, cancellationToken);
                    await client.DisconnectAsync(true, cancellationToken);
                }

                return new SmtpResponseInfo
                {
                    Success = true
                };
            }
            catch (Exception ex)
            {
                // Тема заявки безопасна для лога, контактные данные клиента туда не пишем.
                _logger.LogError(ex, "Не удалось отправить заявку. Тема: {Subject}", messageDto.Subject);

                return new SmtpResponseInfo
                {
                    Success = false,
                    Error = "Ошибка при отправке сообщения."
                };
            }
        }
    }
}
