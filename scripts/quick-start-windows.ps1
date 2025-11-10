# ============================================================================
# Quick Start Script - Course Management System (PowerShell)
# ============================================================================
# Este script despliega automáticamente todo el proyecto en localhost
# ============================================================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 Course Management System - Quick Start" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# PASO 1: Verificar requisitos previos
# ============================================================================
Write-Host "📋 PASO 1: Verificando requisitos previos..." -ForegroundColor Yellow
Write-Host ""

# Verificar Docker
Write-Host "Verificando Docker..." -NoNewline
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host " ✅ Docker instalado" -ForegroundColor Green
    docker --version
} else {
    Write-Host " ❌ Docker NO está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Verificar Docker Compose
Write-Host "Verificando Docker Compose..." -NoNewline
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    Write-Host " ✅ Docker Compose instalado" -ForegroundColor Green
    docker-compose --version
} else {
    Write-Host " ❌ Docker Compose NO está instalado" -ForegroundColor Red
    exit 1
}

# Verificar que Docker esté corriendo
Write-Host "Verificando que Docker esté corriendo..." -NoNewline
try {
    docker ps | Out-Null
    Write-Host " ✅ Docker está corriendo" -ForegroundColor Green
} catch {
    Write-Host " ❌ Docker NO está corriendo" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor inicia Docker Desktop" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================================================
# PASO 2: Configurar variables de entorno
# ============================================================================
Write-Host "📋 PASO 2: Configurando variables de entorno..." -ForegroundColor Yellow
Write-Host ""

if (-Not (Test-Path ".env")) {
    Write-Host "Creando archivo .env desde .env.example..." -NoNewline
    Copy-Item ".env.example" ".env"
    Write-Host " ✅ Archivo .env creado" -ForegroundColor Green
} else {
    Write-Host "✅ Archivo .env ya existe" -ForegroundColor Green
}

if (-Not (Test-Path "backend/.env")) {
    Write-Host "Creando backend/.env..." -NoNewline
    Copy-Item "backend/.env.example" "backend/.env" -ErrorAction SilentlyContinue
    Write-Host " ✅" -ForegroundColor Green
}

if (-Not (Test-Path "frontend/.env.local")) {
    Write-Host "Creando frontend/.env.local..." -NoNewline
    Copy-Item "frontend/.env.example" "frontend/.env.local" -ErrorAction SilentlyContinue
    Write-Host " ✅" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# PASO 3: Detener servicios previos (si existen)
# ============================================================================
Write-Host "📋 PASO 3: Limpiando servicios previos..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Deteniendo contenedores previos..." -NoNewline
docker-compose down 2>$null
Write-Host " ✅" -ForegroundColor Green

Write-Host ""

# ============================================================================
# PASO 4: Iniciar servicios con Docker Compose
# ============================================================================
Write-Host "📋 PASO 4: Iniciando servicios con Docker Compose..." -ForegroundColor Yellow
Write-Host ""

Write-Host "🐳 Construyendo e iniciando contenedores..." -ForegroundColor Cyan
Write-Host "   (Esto puede tomar 2-5 minutos la primera vez)" -ForegroundColor Gray
Write-Host ""

docker-compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error al iniciar los servicios con Docker" -ForegroundColor Red
    Write-Host "Por favor revisa los logs con: docker-compose logs" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Contenedores iniciados correctamente" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 5: Esperar a que los servicios estén listos
# ============================================================================
Write-Host "📋 PASO 5: Esperando a que los servicios estén listos..." -ForegroundColor Yellow
Write-Host ""

# Esperar PostgreSQL
Write-Host "Esperando PostgreSQL..." -NoNewline
$maxAttempts = 30
$attempt = 0
$postgresReady = $false

while ($attempt -lt $maxAttempts -and -not $postgresReady) {
    try {
        docker-compose exec -T postgres pg_isready -U postgres 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $postgresReady = $true
        }
    } catch {
        # Ignorar errores
    }
    
    if (-not $postgresReady) {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
        $attempt++
    }
}

if ($postgresReady) {
    Write-Host " ✅ PostgreSQL listo" -ForegroundColor Green
} else {
    Write-Host " ⚠️ PostgreSQL tardó más de lo esperado" -ForegroundColor Yellow
}

# Esperar Backend
Write-Host "Esperando Backend API..." -NoNewline
Start-Sleep -Seconds 10

$maxAttempts = 30
$attempt = 0
$backendReady = $false

while ($attempt -lt $maxAttempts -and -not $backendReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
        }
    } catch {
        # Ignorar errores
    }
    
    if (-not $backendReady) {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
        $attempt++
    }
}

if ($backendReady) {
    Write-Host " ✅ Backend API listo" -ForegroundColor Green
} else {
    Write-Host " ⚠️ Backend tardó más de lo esperado" -ForegroundColor Yellow
}

# Esperar Frontend
Write-Host "Esperando Frontend..." -NoNewline
Start-Sleep -Seconds 5

$maxAttempts = 30
$attempt = 0
$frontendReady = $false

while ($attempt -lt $maxAttempts -and -not $frontendReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
        }
    } catch {
        # Ignorar errores
    }
    
    if (-not $frontendReady) {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
        $attempt++
    }
}

if ($frontendReady) {
    Write-Host " ✅ Frontend listo" -ForegroundColor Green
} else {
    Write-Host " ⚠️ Frontend tardó más de lo esperado" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# PASO 6: Abrir navegador
# ============================================================================
Write-Host "📋 PASO 6: Abriendo aplicación en el navegador..." -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 2

# Abrir Frontend
Write-Host "Abriendo Frontend (http://localhost:3000)..." -NoNewline
Start-Process "http://localhost:3000"
Write-Host " ✅" -ForegroundColor Green

Start-Sleep -Seconds 1

# Abrir Backend API Docs
Write-Host "Abriendo API Docs (http://localhost:3001/api/docs)..." -NoNewline
Start-Process "http://localhost:3001/api/docs"
Write-Host " ✅" -ForegroundColor Green

Write-Host ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================
Write-Host "=========================================" -ForegroundColor Green
Write-Host "🎉 ¡DESPLIEGUE COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📊 SERVICIOS DISPONIBLES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  🌐 Frontend:           http://localhost:3000" -ForegroundColor White
Write-Host "  🔌 Backend API:        http://localhost:3001/api" -ForegroundColor White
Write-Host "  📚 API Docs (Swagger): http://localhost:3001/api/docs" -ForegroundColor White
Write-Host "  🔍 GraphQL Playground: http://localhost:3001/graphql" -ForegroundColor White
Write-Host "  🗄️  PostgreSQL:         localhost:5432" -ForegroundColor White
Write-Host "  🔴 Redis:              localhost:6379" -ForegroundColor White
Write-Host ""

Write-Host "👤 CREDENCIALES DE PRUEBA:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Admin:" -ForegroundColor Yellow
Write-Host "    Email:    admin@globalmed.com" -ForegroundColor White
Write-Host "    Password: Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "  Instructor:" -ForegroundColor Yellow
Write-Host "    Email:    instructor@globalmed.com" -ForegroundColor White
Write-Host "    Password: Instructor123!" -ForegroundColor White
Write-Host ""
Write-Host "  Estudiante:" -ForegroundColor Yellow
Write-Host "    Email:    student@globalmed.com" -ForegroundColor White
Write-Host "    Password: Student123!" -ForegroundColor White
Write-Host ""

Write-Host "🔧 COMANDOS ÚTILES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Ver logs:              docker-compose logs -f" -ForegroundColor White
Write-Host "  Ver logs de un servicio: docker-compose logs -f backend" -ForegroundColor White
Write-Host "  Detener servicios:     docker-compose down" -ForegroundColor White
Write-Host "  Reiniciar servicios:   docker-compose restart" -ForegroundColor White
Write-Host "  Ver estado:            docker-compose ps" -ForegroundColor White
Write-Host ""

Write-Host "📖 DOCUMENTACIÓN:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  README.md              - Documentación principal" -ForegroundColor White
Write-Host "  ARCHITECTURE.md        - Arquitectura del sistema" -ForegroundColor White
Write-Host "  GETTING_STARTED.md     - Guía de inicio" -ForegroundColor White
Write-Host "  CREDENTIALS.md         - Credenciales completas" -ForegroundColor White
Write-Host ""

Write-Host "=========================================" -ForegroundColor Green
Write-Host "✨ ¡Disfruta desarrollando! ✨" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

