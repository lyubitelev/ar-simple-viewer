import sessionUtils from "../common/utils/sessionUtils.js";
import smtpUtils from "../common/utils/smtpUtils.js";
import conf from "../config/config.js";

const key = 'localId';

// index.bandle.js подключают и старый index.html, и новый index2.html.
// Разметка страниц отличается, поэтому каждый блок инициализируется только при наличии своих узлов.
window.onload = async () => {
    // Ролик тяжёлый, поэтому запускается до ожидания сессии и превью.
    initHeroVideo();
    await initDemoPreview();
    initContactForms();
};

/**
 * Подставляет ролик в макет телефона. В репозитории его нет (video/* в .gitignore),
 * файл лежит в бакете моделей, а адрес собирается из awsEndPoint — той же схемой,
 * что и адреса моделей в modelIdentity/sessionUtils.
 * Узлы .all-container/.mobile-container есть только в index2.html.
 */
function initHeroVideo() {
    const containerClass = window.innerWidth > 767 ? 'all-container' : 'mobile-container';
    const video = document.querySelector(`.video-container.${containerClass} video`);

    if (!video)
        return;

    const source = document.createElement('source');

    source.src = `${conf.awsEndPoint}/avt-models/video/promo_video.mp4`;
    source.type = 'video/mp4';

    video.innerHTML = '';
    video.appendChild(source);
    video.load();

    video.addEventListener('click', () => {
        if (video.paused)
            video.play();
        else
            video.pause();
    });
}

function findPreviewFrame() {
    const wideScreen = window.innerWidth > 767;
    const preview = document.querySelector(wideScreen ? '.ar-preview.demo-ifr' : '.ar-preview.demo-ifr2');

    // Старый index.html не использует класс ar-preview: там превью адресуется по id.
    return preview ?? document.getElementById('demo-ifr2');
}

async function initDemoPreview() {
    const previewFrame = findPreviewFrame();
    if (!previewFrame)
        return;

    try {
        await sessionUtils.init();
        const storage = JSON.parse(localStorage.getItem(key));
        const modelsInfo = storage?.mainCollection?.data ?? [];

        if (modelsInfo.length === 0)
            return;

        const defaultModel = modelsInfo[Math.floor(Math.random() * modelsInfo.length)];
        previewFrame.setAttribute('src', `./viewer.html?id=${defaultModel.id}`);
    }
    catch (err) {
        console.error(err);
    }
}

/**
 * Возвращает описание формы, только если все её обязательные узлы есть на странице.
 */
function readContactForm(elementIds) {
    const nameInput = document.getElementById(elementIds.name);
    const contactInput = document.getElementById(elementIds.contact);
    const consentCheckbox = document.getElementById(elementIds.consent);
    const submitButtons = document.querySelectorAll(elementIds.submitSelector);

    if (!nameInput || !contactInput || !consentCheckbox || submitButtons.length === 0)
        return null;

    const consentContainer = consentCheckbox.closest(elementIds.consentContainerSelector);
    if (!consentContainer)
        return null;

    return {
        nameInput,
        contactInput,
        consentCheckbox,
        consentContainer,
        submitButtons,
        // Тариф выбирается только в модальной форме.
        tariffSelect: elementIds.tariff ? document.getElementById(elementIds.tariff) : null
    };
}

function initContactForms() {
    const forms = [
        readContactForm({
            name: "formGroupExampleInput",
            contact: "formGroupExampleInput2",
            consent: "flexCheckChecked2",
            consentContainerSelector: ".all-form-check",
            submitSelector: ".empty-send-btn"
        }),
        readContactForm({
            name: "modal-formGroupExampleInput",
            contact: "modal-formGroupExampleInput2",
            consent: "modal-flexCheckChecked2",
            tariff: "modal-formGroupExampleInput3",
            consentContainerSelector: ".modal-form-check",
            submitSelector: ".modal-btn"
        })
    ];

    forms.filter(form => form !== null).forEach(bindContactForm);
}

function ensureErrorMessage(input) {
    let errorMessage = input.nextElementSibling;
    if (!errorMessage || !errorMessage.classList.contains("error-message")) {
        errorMessage = document.createElement("div");
        errorMessage.classList.add("error-message");
        input.parentNode.appendChild(errorMessage);
    }
    return errorMessage;
}

function validateInput(input) {
    const errorMessage = ensureErrorMessage(input);

    if (input.value.trim() === "") {
        errorMessage.textContent = "Это поле обязательно для заполнения";
        input.classList.add("is-invalid");
        return false;
    }

    errorMessage.textContent = "";
    input.classList.remove("is-invalid");
    return true;
}

function validateContact(input) {
    const errorMessage = ensureErrorMessage(input);

    const value = input.value.trim();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^(\+7|8)?[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

    if (!emailPattern.test(value) && !phonePattern.test(value)) {
        errorMessage.textContent = "Введите корректный телефон или email";
        input.classList.add("is-invalid");
        return false;
    }

    errorMessage.textContent = "";
    input.classList.remove("is-invalid");
    return true;
}

function validateCheckbox(checkbox, consentContainer) {
    let errorMessage = consentContainer.nextElementSibling;

    if (errorMessage && errorMessage.classList.contains("error-message")) {
        errorMessage.remove();
    }

    if (!checkbox.checked) {
        errorMessage = document.createElement("div");
        errorMessage.classList.add("error-message", "alert", "alert-danger", "mt-3");
        errorMessage.textContent = "Вы должны дать согласие на обработку персональных данных";
        consentContainer.parentNode.insertBefore(errorMessage, consentContainer.nextSibling);
        return false;
    }

    return true;
}

function showFormMessage(consentContainer, text, alertClass) {
    const message = document.createElement("div");
    message.classList.add("alert", alertClass, "mt-3");
    message.textContent = text;
    consentContainer.parentNode.insertBefore(message, consentContainer.nextSibling);

    setTimeout(() => {
        message.remove();
    }, 3000);
}

function bindContactForm(form) {
    async function submitForm(event) {
        event.preventDefault();

        const isNameValid = validateInput(form.nameInput);
        const isContactValid = validateContact(form.contactInput);
        const isConsentGiven = validateCheckbox(form.consentCheckbox, form.consentContainer);

        if (!isNameValid || !isContactValid || !isConsentGiven)
            return;

        try {
            // Успех показываем только после подтверждённой отправки на нашем backend.
            await smtpUtils.send({
                subject: smtpUtils.SUBJECT.landingLead,
                name: form.nameInput.value,
                contact: form.contactInput.value,
                tariff: form.tariffSelect?.value || null
            });
        }
        catch (err) {
            console.error("Не удалось отправить заявку.", err);
            showFormMessage(form.consentContainer, "Не удалось отправить заявку. Попробуйте ещё раз позже.", "alert-danger");
            return;
        }

        showFormMessage(form.consentContainer, "Ваше сообщение успешно отправлено!", "alert-success");

        form.nameInput.value = "";
        form.contactInput.value = "";
        form.nameInput.classList.remove("is-invalid");
        form.contactInput.classList.remove("is-invalid");

        form.consentContainer.parentNode
            .querySelectorAll(".error-message")
            .forEach(error => error.remove());
    }

    form.submitButtons.forEach(button => {
        button.addEventListener("click", submitForm);
    });
}
