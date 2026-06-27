$ErrorActionPreference = "Stop"

$frontendDir = Split-Path -Parent $PSScriptRoot
$repoDir = Split-Path -Parent $frontendDir
$backendDir = Join-Path $repoDir "backend-python"
$binaryDir = Join-Path $frontendDir "src-tauri\binaries"
$targetName = "fluxy-sidecar-x86_64-pc-windows-msvc.exe"
$targetPath = Join-Path $binaryDir $targetName

Get-CimInstance Win32_Process |
    Where-Object { $_.ExecutablePath -eq $targetPath } |
    ForEach-Object {
        Write-Host "Deteniendo sidecar del proyecto en uso (PID $($_.ProcessId))..."
        taskkill /PID $_.ProcessId /T /F | Out-Null
    }

Push-Location $backendDir
try {
    python -m pip install -r requirements-build.txt
    if ($LASTEXITCODE -ne 0) {
        throw "No se pudieron instalar las dependencias de build del sidecar."
    }

    python -m PyInstaller --clean --noconfirm cdcart-backend.spec
    if ($LASTEXITCODE -ne 0) {
        throw "PyInstaller no pudo construir el sidecar."
    }

    New-Item -ItemType Directory -Force -Path $binaryDir | Out-Null
    Copy-Item -Force (Join-Path $backendDir "dist\cdcart-backend.exe") $targetPath
}
finally {
    Pop-Location
}

Write-Host "Sidecar actualizado: $targetPath"
