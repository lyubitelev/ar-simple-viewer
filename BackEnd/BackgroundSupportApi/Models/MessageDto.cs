using System.ComponentModel.DataAnnotations;

namespace BackgroundSupportApi.Models
{
    public class MessageDto
    {
        /// <summary>Имя из формы заявки. Необязательно.</summary>
        [MaxLength(200)]
        public string? Name { get; set; }

        /// <summary>Контакт клиента: телефон или email.</summary>
        [Required]
        [MaxLength(200)]
        public string Contact { get; set; } = string.Empty;

        /// <summary>Выбранный тариф, если форма его запрашивает.</summary>
        [MaxLength(100)]
        public string? Tariff { get; set; }

        public SubjectType Subject { get; set; }

        [MaxLength(2000)]
        public string? OtherText { get; set; }
    }

    public enum SubjectType
    {
        CallBack = 0,
        LandingLead = 1,
        DemoLead = 2
    }
}
