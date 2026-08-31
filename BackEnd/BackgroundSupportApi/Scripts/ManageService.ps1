param(
    [string]$exePath = "C:\path\to\your\app\YourApp.exe",
    [string]$serviceName = "YourAppService",
    [string]$displayName = "Your App Service",
    # -1 — интерактивное меню. 1/2 — один неинтерактивный action и возврат управления
    # вызывающему скрипту с exit code (0 — успех, 1 — ошибка).
    [int]$action = -1
)

function Register-Service {
    New-Service -Name $serviceName -BinaryPathName $exePath -DisplayName $displayName -Description "Your Service Description" -ErrorAction Stop
    Start-Service -Name $serviceName -ErrorAction Stop
    Write-Host "Служба $serviceName зарегистрирована и запущена."
}

function Unregister-Service {
    if (-not (Get-Service -Name $serviceName -ErrorAction SilentlyContinue)) {
        Write-Host "Служба $serviceName не существует."
        return
    }

    Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
    sc.exe delete $serviceName
    if ($LASTEXITCODE -ne 0) {
        throw "sc.exe delete $serviceName завершился с кодом $LASTEXITCODE."
    }

    # sc.exe возвращается раньше фактического удаления, если у службы остались
    # открытые дескрипторы. Пока служба видна, регистрировать новую нельзя.
    for ($i = 0; $i -lt 30; $i++) {
        if (-not (Get-Service -Name $serviceName -ErrorAction SilentlyContinue)) {
            Write-Host "Служба $serviceName удалена."
            return
        }

        Start-Sleep -Seconds 1
    }

    throw "Служба $serviceName всё ещё зарегистрирована через 30 с после sc.exe delete."
}

function Invoke-ServiceAction {
    param([int]$choice)

    switch ($choice) {
        1 { Register-Service }
        2 { Unregister-Service }
        0 { Write-Host "Действие не выбрано." }
        default { throw "Неизвестное действие: $choice. Допустимы 1 (регистрация) и 2 (удаление)." }
    }
}

# Неинтерактивный режим: ровно один action и возврат управления. Ошибку глушить нельзя —
# иначе вызывающий deploy-скрипт продолжит работу в неизвестном состоянии.
if ($action -ne -1) {
    try {
        Invoke-ServiceAction -choice $action
    } catch {
        Write-Host "Ошибка действия ${action}: $_"
        exit 1
    }

    exit 0
}

# Интерактивный режим: меню как раньше, ошибка одной операции не завершает сессию.
while ($true) {
    Write-Host "Выберите действие:"
    Write-Host "1: Зарегистрировать службу"
    Write-Host "2: Удалить службу"
    Write-Host "0: Выход"
    $choice = Read-Host "Введите номер"

    if ($choice -eq "0") {
        break
    }

    $parsed = 0
    if (-not [int]::TryParse($choice, [ref]$parsed)) {
        Write-Host "Неверный выбор. Попробуйте снова."
        continue
    }

    try {
        Invoke-ServiceAction -choice $parsed
    } catch {
        Write-Host "Ошибка: $_"
    }
}
