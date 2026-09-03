/**
 * Содержимое одного общего диалога «Подробнее» (#pricingDetailsModal) для всех тарифов.
 *
 * Источник истины по составу и ценам — docs/product/pricing-policy.md; здесь живёт
 * только его публичная формулировка для лендинга. Карточка тарифа остаётся компактной,
 * а полный состав показывается по требованию, поэтому разметка диалога одна, а не
 * четыре скопированных блока.
 *
 * Узлы есть только на index.html, поэтому все выборки защищены проверками.
 */

const DEFAULT_CTA_LABEL = "Подключить";

const TARIFF_DETAILS = {
    "Start": {
        price: "0 ₽ в месяц + 0,15 ₽ за оплачиваемую AR-сессию",
        summary: "3D-просмотр сам по себе не тарифицируется. Оплата начинается с первой оплачиваемой "
            + "AR-сессии: нет AR-использования — нет платы за платформу.",
        sections: [
            {
                title: "Что входит",
                items: [
                    "3D-просмотрщик",
                    "AR «в вашем пространстве» для одного товара",
                    "Публичная ссылка и QR-код",
                    "Встраивание через iframe/embed",
                    "Свои поддерживаемые 3D-модели",
                    "Базовая настройка сцены",
                    "Стандартный брендинг платформы"
                ]
            },
            {
                title: "Оплата и прозрачность",
                items: [
                    "Нет подписки и фиксированного месячного платежа",
                    "Предсказуемый месячный лимит расходов",
                    "Дашборд биллинга: количество AR-сессий и начисленная сумма",
                    "Лимит расходов будет виден в дашборде после его реализации",
                    "Неуспешные загрузки, боты и очевидные технические повторы не должны считаться "
                        + "отдельными оплачиваемыми сессиями"
                ]
            },
            {
                title: "Не входит",
                items: [
                    "XR Room и сцены из нескольких товаров",
                    "Аналитика взаимодействия",
                    "Commerce-аналитика"
                ]
            }
        ],
        note: "Создание и подготовка 3D-моделей, конфигуратор и заказная разработка считаются отдельно."
    },
    "Pro": {
        price: "990 ₽ в месяц · 10 000 AR/XR-сессий включено · сверх лимита 0,10 ₽ за сессию",
        summary: "Pro — соберите комнату, а не просто примерьте один товар. Размещайте несколько товаров "
            + "в пространстве, сохраняйте композицию и смотрите, что действительно интересно покупателям.",
        sections: [
            {
                title: "XR Room",
                items: [
                    "Несколько товаров каталога в одной пространственной сцене",
                    "Добавление и удаление товаров из композиции",
                    "Перемещение, поворот и масштабирование размещённых товаров",
                    "Сохранение состояния комнаты на платформе",
                    "Повторное открытие комнаты по ссылке или QR на другом устройстве — в том же физическом "
                        + "помещении",
                    "Список выбранных товаров/SKU по текущей композиции",
                    "Стандартная настройка 3D/AR/XR-сцены"
                ]
            },
            {
                title: "Аналитика взаимодействия",
                items: [
                    "AR- и XR-сессии",
                    "Переход из AR в XR",
                    "Популярные товары по взаимодействиям и размещениям",
                    "Среднее время взаимодействия",
                    "Среднее число товаров, размещённых в комнате",
                    "Динамика активности по дням и неделям",
                    "Успешные и неуспешные загрузки моделей"
                ]
            },
            {
                title: "Условия",
                items: [
                    "Всё из тарифа Start",
                    "Стандартная поддержка",
                    "Предсказуемый лимит расходов и понятный путь перехода на Business"
                ]
            }
        ],
        note: "Сохранённая комната рассчитана на продолжение в том же физическом пространстве. Передача "
            + "товаров в корзину, атрибуция выручки и commerce-аналитика относятся к тарифу Business."
    },
    "Business": {
        price: "2 990 ₽ в месяц · 50 000 AR/XR-сессий включено · сверх лимита 0,05 ₽ за сессию",
        summary: "Business — превратите XR в измеримый путь к продаже. Передавайте выбранные товары в корзину "
            + "и смотрите, какие AR/XR-сценарии, товары и комбинации реально доходят до покупки.",
        sections: [
            {
                title: "Передача в корзину",
                items: [
                    "Стандартный сценарий precheck → корзина магазина",
                    "Стандартный JS/API-контракт передачи выбранных SKU, вариантов и конфигурации",
                    "Стандартные события корзины, оформления и покупки — когда магазин их предоставляет"
                ]
            },
            {
                title: "Commerce-аналитика",
                items: [
                    "Источник трафика, referrer и UTM-атрибуция",
                    "Воронка: товар → 3D → AR/XR → выбранные товары → корзина → оформление → покупка",
                    "Конверсия по SKU",
                    "Атрибуция выручки — только при наличии достоверных данных о покупках и заказах",
                    "Товары, которые чаще размещают вместе в одной комнате",
                    "Аналитика конфигуратора там, где он отдаёт нужные события",
                    "Экспорт данных в CSV"
                ]
            },
            {
                title: "Условия",
                items: [
                    "Всё из тарифа Pro",
                    "Уменьшенный/нейтральный брендинг платформы там, где это технически возможно",
                    "Приоритетная поддержка"
                ]
            }
        ],
        note: "Стандартный JS/API-контракт входит в подписку. Ручная адаптация интеграции под конкретный CMS, "
            + "магазин или устаревший checkout оплачивается отдельно."
    },
    "Enterprise": {
        price: "По запросу — индивидуальный расчёт",
        summary: "Enterprise закрывает требования, которые не должны искажать самообслуживаемые тарифы.",
        ctaLabel: "Связаться",
        sections: [
            {
                title: "Типичный объём",
                items: [
                    "Очень высокий трафик",
                    "Выделенный SLA и поддержка",
                    "Массовые операции с каталогом",
                    "Интеграция PIM / ERP / CRM",
                    "Заказные API и интеграции сверх стандартного контракта Business",
                    "Свои домены и расширенный white-label",
                    "Приватное или выделенное развёртывание",
                    "Особые требования к безопасности и инфраструктуре"
                ]
            }
        ],
        note: "Стоимость и состав работ рассчитываются индивидуально."
    }
};

function renderSections(container, sections) {
    container.textContent = "";

    sections.forEach(section => {
        // Одним уровнем ниже названия тарифа в шапке диалога.
        const title = document.createElement("h4");
        title.classList.add("pricing-details-section-title");
        title.textContent = section.title;
        container.appendChild(title);

        const list = document.createElement("ul");
        list.classList.add("pricing-details-list");

        section.items.forEach(item => {
            const listItem = document.createElement("li");
            listItem.textContent = item;
            list.appendChild(listItem);
        });

        container.appendChild(list);
    });
}

function fillDetails(modal, tariff) {
    const details = TARIFF_DETAILS[tariff];
    const titleNode = modal.querySelector(".pricing-details-title");
    const priceNode = modal.querySelector('[data-pricing-details="price"]');
    const summaryNode = modal.querySelector('[data-pricing-details="summary"]');
    const sectionsNode = modal.querySelector('[data-pricing-details="sections"]');
    const noteNode = modal.querySelector('[data-pricing-details="note"]');
    const connectButton = modal.querySelector(".pricing-details-connect");

    if (!details || !titleNode || !priceNode || !summaryNode || !sectionsNode || !noteNode)
        return false;

    titleNode.textContent = tariff;
    priceNode.textContent = details.price;
    summaryNode.textContent = details.summary;
    renderSections(sectionsNode, details.sections);

    noteNode.textContent = details.note || "";
    noteNode.hidden = !details.note;

    // Заявка из диалога попадает в ту же форму, что и кнопка «Подключить» в карточке:
    // тариф передаётся через data-tariff, который читает обработчик #contactModal.
    if (connectButton) {
        connectButton.setAttribute("data-tariff", tariff);
        connectButton.textContent = details.ctaLabel || DEFAULT_CTA_LABEL;
    }

    return true;
}

/**
 * Подключает единый диалог подробностей к кнопкам «Подробнее» карточек тарифов.
 * Диалог открывает Bootstrap по data-bs-toggle: здесь только подстановка содержимого.
 */
export function initPricingDetails() {
    const modal = document.getElementById("pricingDetailsModal");

    if (!modal)
        return;

    modal.addEventListener("show.bs.modal", function (event) {
        const trigger = event.relatedTarget;
        const tariff = trigger?.getAttribute("data-tariff");

        if (fillDetails(modal, tariff))
            return;

        // Пустой диалог хуже отсутствия диалога: не показываем его вовсе.
        console.error("Нет описания для тарифа:", tariff);
        event.preventDefault();
    });
}

export default { initPricingDetails };
