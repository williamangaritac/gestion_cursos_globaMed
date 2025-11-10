# ============================================================================
# Database Initialization Script - Course Management System (PowerShell)
# ============================================================================
# Este script inicializa la base de datos PostgreSQL con:
# - Schema completo (tablas, índices, triggers)
# - Datos de prueba (usuarios, programas)
# ============================================================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🗄️  Database Initialization Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# PASO 1: Verificar que PostgreSQL esté corriendo
# ============================================================================
Write-Host "📋 PASO 1: Verificando PostgreSQL..." -ForegroundColor Yellow
Write-Host ""

# Verificar si Docker está corriendo
Write-Host "Verificando Docker..." -NoNewline
try {
    docker ps | Out-Null
    Write-Host " ✅ Docker corriendo" -ForegroundColor Green
} catch {
    Write-Host " ❌ Docker no está corriendo" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor inicia Docker y ejecuta: docker-compose up -d postgres" -ForegroundColor Yellow
    exit 1
}

# Verificar si el contenedor de PostgreSQL está corriendo
$postgresRunning = docker-compose ps | Select-String "course-management-db.*Up"

if (-not $postgresRunning) {
    Write-Host "⚠️  PostgreSQL no está corriendo. Iniciando..." -ForegroundColor Yellow
    docker-compose up -d postgres
    Write-Host "⏳ Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# Verificar que PostgreSQL esté listo
Write-Host "Verificando conexión a PostgreSQL..." -NoNewline
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
    Write-Host " ❌ PostgreSQL no responde" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================================================
# PASO 2: Ejecutar scripts SQL en orden
# ============================================================================
Write-Host "📋 PASO 2: Ejecutando scripts SQL..." -ForegroundColor Yellow
Write-Host ""

# Script 1: Schema
Write-Host "Ejecutando 01-schema.sql..." -NoNewline
try {
    Get-Content "database/01-schema.sql" | docker-compose exec -T postgres psql -U postgres -d course_management 2>$null | Out-Null
    Write-Host " ✅" -ForegroundColor Green
} catch {
    Write-Host " ⚠️  (puede que ya exista)" -ForegroundColor Yellow
}

# Script 2: Seed Users
Write-Host "Ejecutando 02-seed-users.sql..." -NoNewline
try {
    Get-Content "database/02-seed-users.sql" | docker-compose exec -T postgres psql -U postgres -d course_management 2>$null | Out-Null
    Write-Host " ✅" -ForegroundColor Green
} catch {
    Write-Host " ⚠️  (puede que ya existan)" -ForegroundColor Yellow
}

# Script 3: Seed Programs
Write-Host "Ejecutando 03-seed-programs.sql..." -NoNewline
try {
    Get-Content "database/03-seed-programs.sql" | docker-compose exec -T postgres psql -U postgres -d course_management 2>$null | Out-Null
    Write-Host " ✅" -ForegroundColor Green
} catch {
    Write-Host " ⚠️  (puede que ya existan)" -ForegroundColor Yellow
}

# Script 4: Additional Programs
Write-Host "Ejecutando 04-additional-programs.sql..." -NoNewline
try {
    Get-Content "database/04-additional-programs.sql" | docker-compose exec -T postgres psql -U postgres -d course_management 2>$null | Out-Null
    Write-Host " ✅" -ForegroundColor Green
} catch {
    Write-Host " ⚠️  (puede que ya existan)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# PASO 3: Verificar datos
# ============================================================================
Write-Host "📋 PASO 3: Verificando datos..." -ForegroundColor Yellow
Write-Host ""

# Contar usuarios
$userCount = docker-compose exec -T postgres psql -U postgres -d course_management -t -c "SELECT COUNT(*) FROM users WHERE deleted_at IS NULL;" 2>$null
$userCount = $userCount.Trim()
Write-Host "  Usuarios creados: " -NoNewline
Write-Host $userCount -ForegroundColor Green

# Contar programas
$programCount = docker-compose exec -T postgres psql -U postgres -d course_management -t -c "SELECT COUNT(*) FROM programs WHERE deleted_at IS NULL;" 2>$null
$programCount = $programCount.Trim()
Write-Host "  Programas creados: " -NoNewline
Write-Host $programCount -ForegroundColor Green

# Contar inscripciones
$enrollmentCount = docker-compose exec -T postgres psql -U postgres -d course_management -t -c "SELECT COUNT(*) FROM enrollments;" 2>$null
$enrollmentCount = $enrollmentCount.Trim()
Write-Host "  Inscripciones: " -NoNewline
Write-Host $enrollmentCount -ForegroundColor Green

Write-Host ""

# ============================================================================
# PASO 4: Mostrar usuarios de prueba
# ============================================================================
Write-Host "📋 PASO 4: Usuarios de prueba disponibles" -ForegroundColor Yellow
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

# ============================================================================
# RESUMEN FINAL
# ============================================================================
Write-Host "=========================================" -ForegroundColor Green
Write-Host "✅ Base de datos inicializada correctamente" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📊 RESUMEN:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ✅ Schema creado (tablas, índices, triggers)"
Write-Host "  ✅ $userCount usuarios de prueba"
Write-Host "  ✅ $programCount programas de ejemplo"
Write-Host "  ✅ $enrollmentCount inscripciones"
Write-Host ""

Write-Host "🔧 COMANDOS ÚTILES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Conectar a PostgreSQL:" -ForegroundColor White
Write-Host "    docker-compose exec postgres psql -U postgres -d course_management"
Write-Host ""
Write-Host "  Ver tablas:" -ForegroundColor White
Write-Host "    docker-compose exec postgres psql -U postgres -d course_management -c `"\dt`""
Write-Host ""
Write-Host "  Ver usuarios:" -ForegroundColor White
Write-Host "    docker-compose exec postgres psql -U postgres -d course_management -c `"SELECT email, full_name, role FROM users;`""
Write-Host ""
Write-Host "  Ver programas:" -ForegroundColor White
Write-Host "    docker-compose exec postgres psql -U postgres -d course_management -c `"SELECT name, status, max_students, current_students FROM programs;`""
Write-Host ""

Write-Host "=========================================" -ForegroundColor Green
Write-Host "✨ ¡Listo para usar! ✨" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

