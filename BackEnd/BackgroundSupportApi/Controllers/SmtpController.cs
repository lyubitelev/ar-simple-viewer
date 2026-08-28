using BackgroundSupportApi.Models;
using BackgroundSupportApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BackgroundSupportApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SmtpController : ControllerBase
    {
        private readonly ISmtpService _smtpService;

        public SmtpController(ISmtpService smtpService)
        {
            _smtpService = smtpService;
        }

        [HttpPost(nameof(SendMessage))]
        [ProducesResponseType(typeof(SmtpResponseInfo), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(SmtpResponseInfo), StatusCodes.Status502BadGateway)]
        public async Task<IActionResult> SendMessage([FromBody] MessageDto messageDto, CancellationToken cancellationToken)
        {
            var result = await _smtpService.SendMessageAsync(messageDto, cancellationToken);

            // Неудачная отправка не должна выглядеть как успех для клиента.
            return result.Success
                ? Ok(result)
                : StatusCode(StatusCodes.Status502BadGateway, result);
        }
    }
}
