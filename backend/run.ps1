# Ejecución del backend (migraciones, carga de cursos y servidor).
# Requiere: .env configurado y base de datos accesible (PostgreSQL local o Neon).

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Activando entorno virtual..." -ForegroundColor Cyan
& .\venv\Scripts\Activate.ps1

Write-Host "`nAplicando migraciones..." -ForegroundColor Cyan
python manage.py migrate
if (-not $?) { exit 1 }

Write-Host "`nCargando cursos de ejemplo..." -ForegroundColor Cyan
python manage.py load_courses
if (-not $?) { exit 1 }

Write-Host "`nIniciando servidor en http://127.0.0.1:8000/" -ForegroundColor Green
python manage.py runserver
