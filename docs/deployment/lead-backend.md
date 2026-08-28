# Lead backend deployment contract

Статус на 2026-08-28: **BackgroundSupportApi не развёрнут**. `supportApiUrl` в `dev`/`prod`
равен `null`, поэтому формы заявок в этих окружениях честно показывают ошибку отправки
вместо ложного «успешно отправлено». Этот документ фиксирует, что должно совпасть, когда
backend будет развёрнут.

## Что где живёт

| Часть | Где | Как деплоится |
| --- | --- | --- |
| Статический сайт | Yandex Object Storage, bucket `art-vision-tech`, публичный origin `https://art-vision-tech.ru` | `BackEnd/BackgroundSupportApi/Scripts/MainScript.ps1` собирает `npm run build-prod` и заливает содержимое репозитория в bucket |
| Lead backend | `BackEnd/BackgroundSupportApi`, ASP.NET Core Kestrel | Windows-служба: `Scripts/DeployBackendService.ps1` (publish + окружение + регистрация через `ManageService.ps1`) |

Сайт — статика в объектном хранилище. Проксировать `/api/...` на backend он не умеет,
поэтому заявка уходит **cross-origin**, и CORS здесь обязателен.

## Контракт frontend → backend

```
POST {supportApiUrl}/api/Smtp/SendMessage
Content-Type: application/json

{ "subject": "LandingLead" | "DemoLead" | "CallBack",
  "name": string|null, "contact": string, "tariff": string|null, "otherText": string|null }
```

- `supportApiUrl` задаётся в `src/config/envs/{local,dev,prod}.js` и больше нигде.
- 2xx + `success: true` — единственное подтверждение отправки; всё остальное обрабатывается
  как ошибка (`src/common/utils/smtpUtils.js`).
- `local` использует `http://localhost:5000` — совпадает с Kestrel-эндпоинтом из
  `appsettings.json`, чтобы локальная разработка не отправляла заявки через прод.

## Что нужно обеспечить при деплое

1. **Публичный HTTPS-эндпоинт.** Сайт отдаётся по HTTPS, поэтому запрос на `http://`
   браузер заблокирует как mixed content. TLS терминируется либо reverse proxy перед
   Kestrel, либо сертификатом, привязанным к Kestrel. В репозитории proxy нет —
   это внешняя часть деплоя.
2. **Kestrel не выставлять в интернет напрямую.** Committed `appsettings.json` слушает
   plain HTTP на `0.0.0.0:5000` — это конфигурация для разработки и для работы за proxy.
3. **`ASPNETCORE_ENVIRONMENT=Production`**, иначе `appsettings.Production.json` не
   подхватится и приложение упадёт на пустом CORS-allowlist.
4. **CORS allowlist.** `appsettings.Production.json` уже содержит `https://art-vision-tech.ru`.
   Дополнительные origin'ы добавляются через `AppSettings__AllowedCorsUrls__0`,
   `__1`, ... — не через `AllowAnyOrigin()`.
5. **SMTP-учётные данные только из окружения**: `AppSettings__Smtp__Login`,
   `AppSettings__Smtp__Password` (в разработке — user-secrets). В репозиторий не коммитятся.
6. После деплоя прописать реальный HTTPS-адрес в `supportApiUrl` для `dev`/`prod`
   и пересобрать фронтенд соответствующей командой.

Пункты 3–5 автоматизирует `BackEnd/BackgroundSupportApi/Scripts/DeployBackendService.ps1`:
он делает `dotnet publish`, регистрирует службу через `ManageService.ps1` и кладёт
`ASPNETCORE_ENVIRONMENT`, `AppSettings__Smtp__*` и дополнительные CORS-origin'ы в
переменные окружения службы. DNS, TLS и reverse proxy (пункты 1–2) он не трогает —
это внешний контур.

## Проверено локально

CORS-контракт снят с реального запуска приложения (`ASPNETCORE_ENVIRONMENT=Production`,
Kestrel на loopback), а не только со сборки:

| Запрос | Результат |
| --- | --- |
| `OPTIONS /api/Smtp/SendMessage`, `Origin: https://art-vision-tech.ru` | `204`, `Access-Control-Allow-Origin: https://art-vision-tech.ru`, `Allow-Methods: POST`, `Allow-Headers: content-type` |
| тот же preflight с чужого origin | `204` **без** CORS-заголовков — браузер запрос заблокирует |
| `POST` без `contact` | `400` + CORS-заголовок, до SMTP не доходит |
| `POST` с валидным телом и незаданными SMTP-кредами | `502` + `{"success":false}` — контролируемый failure path |
| пустой `AllowedCorsUrls` | старт падает с `InvalidOperationException`, CORS не открывается |

Путь `2xx` + `success: true` проверить нельзя, пока нет реальных SMTP-кредов и деплоя.

## Почему `supportApiUrl` до сих пор `null`

Проверено на 2026-08-28, публичного endpoint'а для BackgroundSupportApi не существует:

- `titan-auto-barnaul.ru` — NXDOMAIN на 8.8.8.8 и 1.1.1.1 (прежний адрес из `main`);
- `api` / `backend` / `support.art-vision-tech.ru` — NXDOMAIN;
- `art-vision-tech.ru:5000` не отвечает; сам домен отдаёт только статику из бакета;
- в репозитории нет ни reverse proxy, ни TLS-конфигурации, ни описанного сервера-цели.

Пока такого адреса нет, любое непустое значение `supportApiUrl` было бы выдумкой:
формы всё равно не отправляли бы заявку, но выглядели бы настроенными. Поэтому значение
остаётся `null`, а `smtpUtils.send()` отказывается отправлять до fetch.

**Следствие для продукта:** в `dev`/`prod` формы заявок на лендинге видимы, но отправить
заявку нельзя. Это решение владельца — выпускать формы временно нерабочими либо сначала
развернуть backend. Альтернатива, если релиз нужен раньше деплоя, — скрыть формы и
оставить на странице почтовый контакт.
