import conf from "../../config/config.js"

/**
 * Тип заявки. Значения должны совпадать с BackgroundSupportApi SubjectType.
 */
const SUBJECT = {
    landingLead: 'LandingLead',
    demoLead: 'DemoLead',
    callBack: 'CallBack'
};

/**
 * Отправляет заявку через собственный backend (BackgroundSupportApi).
 * Учётные данные SMTP-провайдера остаются на backend и в browser bundle не попадают.
 *
 * @param {{subject: string, contact: string, name?: string, tariff?: string, otherText?: string}} lead
 * @returns {Promise<{success: boolean, error?: string}>} успешный ответ backend
 * @throws {Error} если backend вернул не 2xx или сообщил об ошибке отправки
 */
async function send(lead) {
    const response = await fetch(`${conf.supportApiUrl}/api/Smtp/SendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            subject: lead.subject,
            name: lead.name ?? null,
            contact: lead.contact,
            tariff: lead.tariff ?? null,
            otherText: lead.otherText ?? null
        })
    });

    if (!response.ok)
        throw new Error(`Сервис отправки заявок вернул статус ${response.status}`);

    const result = await response.json().catch(() => null);

    if (result && result.success === false)
        throw new Error(result.error ?? 'Не удалось отправить заявку.');

    return result;
}

export default {
    send,
    SUBJECT
};
