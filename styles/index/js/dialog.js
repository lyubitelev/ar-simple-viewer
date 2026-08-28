import smtpUtils from "../../../src/common/utils/smtpUtils.js"

let messages = [];
const dialogInputId = "dialog-input";
const dialogInput2Id = "dialog-input2";
const successTimeOut = 1500;
const dialogContainer = document.getElementById('dialog-container');
const dialogTitle = document.getElementById('dialog-title');
const dialogText = document.getElementById('dialog-text');
const openDialogButtons = document.querySelectorAll('.open-dialog');
const closeDialogButton = document.getElementById('close-dialog');
const cancelDialogButton = document.getElementById('cancel-dialog');
const confirmDialogButton = document.getElementById('confirm-dialog');
const confirmDialogButton2 = document.getElementById('confirm-dialog2');
const dialogInput = document.getElementById(dialogInputId);
const dialogInput2 = document.getElementById(dialogInput2Id);

const emailForm2 = 'email-form2';
const emailForm = 'email-form'

// Описания тарифов: docs/product/pricing-policy.md
const tariffDescriptions = {
    "Start": "Тариф Start — бесплатный старт. <br> Из возможностей: <br> - 3D-просмотрщик и AR «в вашем пространстве»; <br> - публичная ссылка, QR-код и embed на сайт; <br> - свои 3D-модели и базовая настройка сцены; <br> - до 500 оплачиваемых просмотров в месяц.",
    "AR Commerce": "Тариф AR Commerce — 990 ₽ в месяц. <br> Включает всё из Start, а также: <br> - полную настройку вьюера и сцены; <br> - до 10 000 оплачиваемых просмотров в месяц; <br> - стандартную поддержку.",
    "Business": "Тариф Business — 2 990 ₽ в месяц. <br> Включает всё из AR Commerce, а также: <br> - до 50 000 оплачиваемых просмотров в месяц; <br> - white-label и уменьшенный брендинг платформы; <br> - приоритетную поддержку.",
    "Enterprise": "Тариф Enterprise — стоимость рассчитывается индивидуально. <br> Обсуждаем: <br> - очень высокий трафик и выделенный SLA; <br> - API-доступ и массовые операции с каталогом; <br> - интеграцию PIM / ERP / CRM; <br> - свои домены и приватное развёртывание."
};

let selectedTariff = null;

function openDialog(event) {
    const tariff = event.currentTarget.dataset.tariff;

    selectedTariff = tariff ?? null;
    dialogTitle.innerHTML = tariff ? `Тариф ${tariff}` : "Заявка";
    dialogText.innerHTML = tariffDescriptions[tariff] ?? "";

    dialogContainer.classList.remove('hidden');
}

function closeDialog() {
    dialogContainer.classList.add('hidden');
}

openDialogButtons.forEach(button => button.addEventListener('click', openDialog));
closeDialogButton.addEventListener('click', closeDialog);
cancelDialogButton.addEventListener('click', closeDialog);

confirmDialogButton2.addEventListener('click', () => {
    const form = document.getElementById(emailForm2);
    const textareaValue = form.querySelector('textarea').value;
    return trySend(dialogInput2.value, emailForm2, textareaValue);
});

confirmDialogButton.addEventListener('click', () => trySend(dialogInput.value, emailForm));

async function trySend(userInput, formId, value = null) {
    if (!userInput || !validateEmail(userInput)) {
        createEmailMsg(formId, 'Ошибка: "Адрес эл. почты" введен неверно', 3500, true);
        return;
    }

    messages.forEach(x => x?.remove());
    messages = [];

    try {
        // Успех показываем только после подтверждённой отправки на нашем backend.
        await smtpUtils.send(formId === emailForm2
            ? {
                subject: smtpUtils.SUBJECT.callBack,
                contact: userInput,
                otherText: value
            }
            : {
                subject: smtpUtils.SUBJECT.landingLead,
                contact: userInput,
                tariff: selectedTariff
            });
    }
    catch (err) {
        console.error('Не удалось отправить заявку.', err);
        createEmailMsg(formId, 'Не удалось отправить заявку. Попробуйте ещё раз позже.', 3500, true);
        return;
    }

    createEmailMsg(formId, 'В ближайшее время наш менеджер с Вами свяжется.', successTimeOut);
    setTimeout(() => {
        closeDialog();
    }, successTimeOut);
}

function createEmailMsg(formId, msg, timeOut, isError = false) {
    const emailForm = document.getElementById(formId);
    let emailErrMsg = document.createElement('div');
    emailErrMsg.classList.add('mt-2', 'fade', 'show', 'd-flex', 'alert', 'alert-dismissible');
    let div = document.createElement('div');
    div.innerHTML = msg;
    div.style.setProperty("color", isError ? "red" : "#57ca67");

    messages.push(emailErrMsg);

    emailErrMsg.appendChild(div);
    emailForm.appendChild(emailErrMsg);

    setTimeout(() => {
        emailErrMsg.remove();
    }, timeOut);
}

function validateEmail(email) {
    return email.match(
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
