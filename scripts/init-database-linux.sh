#!/bin/bash

# ============================================================================
# Database Initialization Script - Course Management System
# ============================================================================
# Este script inicializa la base de datos PostgreSQL con:
# - Schema completo (tablas, índices, triggers)
# - Datos de prueba (usuarios, programas)
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}🗄️  Database Initialization Script${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""

# ============================================================================
# PASO 1: Verificar que PostgreSQL esté corriendo
# ============================================================================
echo -e "${YELLOW}📋 PASO 1: Verificando PostgreSQL...${NC}"
echo ""

# Verificar si Docker está corriendo
if ! docker ps &> /dev/null; then
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    echo -e "${YELLOW}Por favor inicia Docker y ejecuta: docker-compose up -d postgres${NC}"
    exit 1
fi

# Verificar si el contenedor de PostgreSQL está corriendo
if ! docker-compose ps | grep -q "course-management-db.*Up"; then
    echo -e "${YELLOW}⚠️  PostgreSQL no está corriendo. Iniciando...${NC}"
    docker-compose up -d postgres
    echo -e "${YELLOW}⏳ Esperando a que PostgreSQL esté listo...${NC}"
    sleep 10
fi

# Verificar que PostgreSQL esté listo
echo -n "Verificando conexión a PostgreSQL..."
max_attempts=30
attempt=0
postgres_ready=false

while [ $attempt -lt $max_attempts ] && [ "$postgres_ready" = false ]; do
    if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        postgres_ready=true
    else
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    fi
done

if [ "$postgres_ready" = true ]; then
    echo -e " ${GREEN}✅ PostgreSQL listo${NC}"
else
    echo -e " ${RED}❌ PostgreSQL no responde${NC}"
    exit 1
fi

echo ""

# ============================================================================
# PASO 2: Ejecutar scripts SQL en orden
# ============================================================================
echo -e "${YELLOW}📋 PASO 2: Ejecutando scripts SQL...${NC}"
echo ""

# Script 1: Schema
echo -n "Ejecutando 01-schema.sql..."
if docker-compose exec -T postgres psql -U postgres -d course_management < database/01-schema.sql > /dev/null 2>&1; then
    echo -e " ${GREEN}✅${NC}"
else
    echo -e " ${YELLOW}⚠️  (puede que ya exista)${NC}"
fi

# Script 2: Seed Users
echo -n "Ejecutando 02-seed-users.sql..."
if docker-compose exec -T postgres psql -U postgres -d course_management < database/02-seed-users.sql > /dev/null 2>&1; then
    echo -e " ${GREEN}✅${NC}"
else
    echo -e " ${YELLOW}⚠️  (puede que ya existan)${NC}"
fi

# Script 3: Seed Programs
echo -n "Ejecutando 03-seed-programs.sql..."
if docker-compose exec -T postgres psql -U postgres -d course_management < database/03-seed-programs.sql > /dev/null 2>&1; then
    echo -e " ${GREEN}✅${NC}"
else
    echo -e " ${YELLOW}⚠️  (puede que ya existan)${NC}"
fi

# Script 4: Additional Programs
echo -n "Ejecutando 04-additional-programs.sql..."
if docker-compose exec -T postgres psql -U postgres -d course_management < database/04-additional-programs.sql > /dev/null 2>&1; then
    echo -e " ${GREEN}✅${NC}"
else
    echo -e " ${YELLOW}⚠️  (puede que ya existan)${NC}"
fi

echo ""

# ============================================================================
# PASO 3: Verificar datos
# ============================================================================
echo -e "${YELLOW}📋 PASO 3: Verificando datos...${NC}"
echo ""

# Contar usuarios
user_count=$(docker-compose exec -T postgres psql -U postgres -d course_management -t -c "SELECT COUNT(*) FROM users WHERE deleted_at IS NULL;" | tr -d ' ')
echo -e "  Usuarios creados: ${GREEN}${user_count}${NC}"

# Contar programas
program_count=$(docker-compose exec -T postgres psql -U postgres -d course_management -t -c "SELECT COUNT(*) FROM programs WHERE deleted_at IS NULL;" | tr -d ' ')
echo -e "  Programas creados: ${GREEN}${program_count}${NC}"

# Contar inscripciones
enrollment_count=$(docker-compose exec -T postgres psql -U postgres -d course_management -t -c "SELECT COUNT(*) FROM enrollments;" | tr -d ' ')
echo -e "  Inscripciones: ${GREEN}${enrollment_count}${NC}"

echo ""

# ============================================================================
# PASO 4: Mostrar usuarios de prueba
# ============================================================================
echo -e "${YELLOW}📋 PASO 4: Usuarios de prueba disponibles${NC}"
echo ""

echo -e "${CYAN}👤 CREDENCIALES DE PRUEBA:${NC}"
echo ""
echo -e "${YELLOW}  Admin:${NC}"
echo -e "${WHITE}    Email:    admin@globalmed.com${NC}"
echo -e "${WHITE}    Password: Admin123!${NC}"
echo ""
echo -e "${YELLOW}  Instructor:${NC}"
echo -e "${WHITE}    Email:    instructor@globalmed.com${NC}"
echo -e "${WHITE}    Password: Instructor123!${NC}"
echo ""
echo -e "${YELLOW}  Estudiante:${NC}"
echo -e "${WHITE}    Email:    student@globalmed.com${NC}"
echo -e "${WHITE}    Password: Student123!${NC}"
echo ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✅ Base de datos inicializada correctamente${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

echo -e "${CYAN}📊 RESUMEN:${NC}"
echo ""
echo -e "  ✅ Schema creado (tablas, índices, triggers)"
echo -e "  ✅ ${user_count} usuarios de prueba"
echo -e "  ✅ ${program_count} programas de ejemplo"
echo -e "  ✅ ${enrollment_count} inscripciones"
echo ""

echo -e "${CYAN}🔧 COMANDOS ÚTILES:${NC}"
echo ""
echo -e "${WHITE}  Conectar a PostgreSQL:${NC}"
echo -e "    docker-compose exec postgres psql -U postgres -d course_management"
echo ""
echo -e "${WHITE}  Ver tablas:${NC}"
echo -e "    docker-compose exec postgres psql -U postgres -d course_management -c \"\\dt\""
echo ""
echo -e "${WHITE}  Ver usuarios:${NC}"
echo -e "    docker-compose exec postgres psql -U postgres -d course_management -c \"SELECT email, full_name, role FROM users;\""
echo ""
echo -e "${WHITE}  Ver programas:${NC}"
echo -e "    docker-compose exec postgres psql -U postgres -d course_management -c \"SELECT name, status, max_students, current_students FROM programs;\""
echo ""

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✨ ¡Listo para usar! ✨${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

