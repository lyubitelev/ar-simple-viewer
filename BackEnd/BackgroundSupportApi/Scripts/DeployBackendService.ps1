<#
.SYNOPSIS
    Публикует BackgroundSupportApi и регистрирует его Windows-службой.

.DESCRIPTION
    Закрывает механическую часть деплоя lead backend: publish, переменные окружения
    и регистрация службы через существующий ManageService.ps1.

    Скрипт повторяемый: если служба уже зарегистрирована, она снимается и создаётся
    заново на свежем published exe. Любая ошибка регистрации/удаления прекращает деплой
    с ненулевым кодом, а не оставляет службу в неизвестном состоянии.

    Скрипт НЕ настраивает DNS, TLS и reverse proxy — это внешняя часть деплоя.
    Kestrel слушает plain HTTP и не должен выставляться в интернет напрямую.
    Требования к внешнему контуру описаны в docs/deployment/lead-backend.md.

.EXAMPLE
    .\DeployBackendService.ps1 -PublishDirectory "C:\Services\BackgroundSupportApi" `
        -SmtpLogin "info@example.ru" -SmtpPassword $password `
        -AllowedCorsUrls "https://art-vision-tech.ru"
#>
param(
    [Parameter(Mandatory = $true)][string]$PublishDirectory,
    [Parameter(Mandatory = $true)][string]$SmtpLogin,
    [Parameter(Mandatory = $true)][string]$SmtpPassword,
    [string[]]$AllowedCorsUrls = @(),
    [string]$ServiceName = "BackgroundSupportApi",
    [string]$DisplayName = "AVT Background Support API",
    [string]$Environment = "Production"
)

$ErrorActionPreference = "Stop"

$projectPath = Join-Path $PSScriptRoot "..\BackgroundSupportApi.csproj"
if (-not (Test-Path $projectPath)) {
    Write-Host "Не найден проект: $projectPath"
    exit 1
}

Write-Host "Шаг 1: publish в $PublishDirectory..."
dotnet publish $projectPath -c Release -o $PublishDirectory
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка publish."
    exit $LASTEXITCODE
}

# Секреты живут только здесь, в окружении службы, и никогда в appsettings*.json.
Write-Host "Шаг 2: переменные окружения службы..."
$serviceEnvironment = @(
    "ASPNETCORE_ENVIRONMENT=$Environment",
    "AppSettings__Smtp__Login=$SmtpLogin",
    "AppSettings__Smtp__Password=$SmtpPassword"
)

for ($i = 0; $i -lt $AllowedCorsUrls.Count; $i++) {
    $serviceEnvironment += "AppSettings__AllowedCorsUrls__$i=$($AllowedCorsUrls[$i])"
}

$serviceRegistryPath = "HKLM:\SYSTEM\CurrentControlSet\Services\$ServiceName"

Write-Host "Шаг 3: регистрация службы $ServiceName..."
$exePath = Join-Path $PublishDirectory "BackgroundSupportApi.exe"
if (-not (Test-Path $exePath)) {
    Write-Host "После publish не найден $exePath"
    exit 1
}

# ManageService.ps1 с -action выполняет ровно одно действие и возвращает exit code,
# поэтому каждый вызов проверяется отдельно.
$manageServicePath = Join-Path $PSScriptRoot "ManageService.ps1"

# Повторный деплой: существующая служба держит старый exe, поэтому сначала снимаем её.
if (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) {
    Write-Host "Служба $ServiceName уже зарегистрирована — удаляем перед повторной регистрацией."
    & $manageServicePath -serviceName $ServiceName -action 2
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Не удалось удалить службу $ServiceName (код $LASTEXITCODE)."
        exit $LASTEXITCODE
    }
}

& $manageServicePath -exePath $exePath -serviceName $ServiceName -displayName $DisplayName -action 1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Регистрация службы $ServiceName не удалась (код $LASTEXITCODE)."
    exit $LASTEXITCODE
}

if (-not (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) -or -not (Test-Path $serviceRegistryPath)) {
    Write-Host "Служба $ServiceName не зарегистрирована, переменные окружения не заданы."
    exit 1
}

# Environment у службы задаётся после регистрации: до неё ветки реестра ещё нет.
Set-ItemProperty -Path $serviceRegistryPath -Name "Environment" -Value $serviceEnvironment -Type MultiString
Restart-Service -Name $ServiceName

Write-Host "Служба $ServiceName запущена, окружение: $Environment."
Write-Host ""
Write-Host "Осталось сделать вне этого скрипта:"
Write-Host " 1. Публичный HTTPS endpoint (reverse proxy / TLS) перед Kestrel."
Write-Host " 2. Прописать этот HTTPS адрес в supportApiUrl (src/config/envs/{dev,prod}.js)."
Write-Host " 3. Пересобрать фронтенд и залить его MainScript.ps1."
