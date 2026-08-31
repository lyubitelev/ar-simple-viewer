using System.Text;
using System.Text.Encodings.Web;
using BackgroundSupportApi.Models;
using MimeKit;

namespace BackgroundSupportApi.Extensions
{
    public static class SmtpExtension
    {
        public static MimeMessage Enrich(this MimeMessage mimeMessage, string toEmail)
        {
            mimeMessage.From.Add(new MailboxAddress("info@art-vision-tech.ru", toEmail));
            mimeMessage.To.Add(new MailboxAddress("Уважаемый!", toEmail));
            return mimeMessage;
        }

        public static string GetSubjectDescription(this SubjectType subjectType) =>
            subjectType switch
            {
                SubjectType.LandingLead => "Заявка с главной страницы",
                SubjectType.DemoLead => "Заявка с демо страницы AR",
                SubjectType.CallBack => "Обратная связь",
                _ => "Тема не распознана",
            };

        public static string CreateHtmlBody(this MessageDto messageDto)
        {
            var body = new StringBuilder("Заявка с сайта.<br />");

            if (!string.IsNullOrWhiteSpace(messageDto.Name))
                body.Append($"Имя клиента: {HtmlEncoder.Default.Encode(messageDto.Name)}<br />");

            body.Append($"Контакт клиента: {HtmlEncoder.Default.Encode(messageDto.Contact)}<br />");

            if (!string.IsNullOrWhiteSpace(messageDto.Tariff))
                body.Append($"Тариф: {HtmlEncoder.Default.Encode(messageDto.Tariff)}<br />");

            body.Append($"Отправлено: {DateTime.UtcNow} в UTC<br />");

            if (!string.IsNullOrWhiteSpace(messageDto.OtherText))
                body.Append($"Дополнительный текст: {HtmlEncoder.Default.Encode(messageDto.OtherText)}");

            return body.ToString();
        }
    }
}
