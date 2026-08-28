# Lead backend deployment contract

Статус на 2026-08-28: **BackgroundSupportApi не развёрнут**. `supportApiUrl` в `dev`/`prod`
равен `null`, поэтому формы заявок в этих окружениях честно показывают ошибку отправки
вместо ложного «успешно отправлено». Этот документ фиксирует, что должно совпасть, когда
backend будет развёрнут.

## Что где живёт

| Часть | Где | Как деплоится |
| --- | --- | --- |
| Статический сайт | Yandex Object Storage, bucket `art-vision-tech`, публичный origin `https://art-vision-tech.ru` | `BackEnd/BackgroundSupportApi/Scripts/MainScript.ps1` собирает `npm run build-prod` и заливает содержимое репозитория в bucket |
| Lead backend | `BackEnd/BackgroundSupportApi`, ASP.NET Core Kestrel | Windows-служба (`ManageService.ps1`, `UseWindowsService()`) |

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

## История

До этого PR `dev`/`prod` указывали на `https://titan-auto-barnaul.ru:5000`. На 2026-08-28
этот хост не резолвится (NXDOMAIN на 8.8.8.8 и 1.1.1.1), поэтому значение убрано, а не
перенесено: конфигурация не должна утверждать существование инфраструктуры, которой нет.
