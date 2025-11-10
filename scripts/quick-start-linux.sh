#!/bin/bash

# ============================================================================
# Quick Start Script - Course Management System (Bash)
# ============================================================================
# Este script despliega automáticamente todo el proyecto en localhost
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
echo -e "${CYAN}🚀 Course Management System - Quick Start${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""

# ============================================================================
# PASO 1: Verificar requisitos previos
# ============================================================================
echo -e "${YELLOW}📋 PASO 1: Verificando requisitos previos...${NC}"
echo ""

# Verificar Docker
echo -n "Verificando Docker..."
if command -v docker &> /dev/null; then
    echo -e " ${GREEN}✅ Docker instalado${NC}"
    docker --version
else
    echo -e " ${RED}❌ Docker NO está instalado${NC}"
    echo ""
    echo -e "${RED}Por favor instala Docker desde: https://www.docker.com/get-docker${NC}"
    exit 1
fi

# Verificar Docker Compose
echo -n "Verificando Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo -e " ${GREEN}✅ Docker Compose instalado${NC}"
    docker-compose --version
else
    echo -e " ${RED}❌ Docker Compose NO está instalado${NC}"
    exit 1
fi

# Verificar que Docker esté corriendo
echo -n "Verificando que Docker esté corriendo..."
if docker ps &> /dev/null; then
    echo -e " ${GREEN}✅ Docker está corriendo${NC}"
else
    echo -e " ${RED}❌ Docker NO está corriendo${NC}"
    echo ""
    echo -e "${RED}Por favor inicia Docker${NC}"
    exit 1
fi

echo ""

# ============================================================================
# PASO 2: Configurar variables de entorno
# ============================================================================
echo -e "${YELLOW}📋 PASO 2: Configurando variables de entorno...${NC}"
echo ""

if [ ! -f .env ]; then
    echo -n "Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo -e " ${GREEN}✅ Archivo .env creado${NC}"
else
    echo -e "${GREEN}✅ Archivo .env ya existe${NC}"
fi

if [ ! -f backend/.env ]; then
    echo -n "Creando backend/.env..."
    cp backend/.env.example backend/.env 2>/dev/null || true
    echo -e " ${GREEN}✅${NC}"
fi

if [ ! -f frontend/.env.local ]; then
    echo -n "Creando frontend/.env.local..."
    cp frontend/.env.example frontend/.env.local 2>/dev/null || true
    echo -e " ${GREEN}✅${NC}"
fi

echo ""

# ============================================================================
# PASO 3: Detener servicios previos (si existen)
# ============================================================================
echo -e "${YELLOW}📋 PASO 3: Limpiando servicios previos...${NC}"
echo ""

echo -n "Deteniendo contenedores previos..."
docker-compose down 2>/dev/null || true
echo -e " ${GREEN}✅${NC}"

echo ""

# ============================================================================
# PASO 4: Iniciar servicios con Docker Compose
# ============================================================================
echo -e "${YELLOW}📋 PASO 4: Iniciando servicios con Docker Compose...${NC}"
echo ""

echo -e "${CYAN}🐳 Construyendo e iniciando contenedores...${NC}"
echo -e "   ${WHITE}(Esto puede tomar 2-5 minutos la primera vez)${NC}"
echo ""

docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Error al iniciar los servicios con Docker${NC}"
    echo -e "${YELLOW}Por favor revisa los logs con: docker-compose logs${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Contenedores iniciados correctamente${NC}"
echo ""

# ============================================================================
# PASO 5: Esperar a que los servicios estén listos
# ============================================================================
echo -e "${YELLOW}📋 PASO 5: Esperando a que los servicios estén listos...${NC}"
echo ""

# Esperar PostgreSQL
echo -n "Esperando PostgreSQL..."
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
    echo -e " ${YELLOW}⚠️ PostgreSQL tardó más de lo esperado${NC}"
fi

# Esperar Backend
echo -n "Esperando Backend API..."
sleep 10

max_attempts=30
attempt=0
backend_ready=false

while [ $attempt -lt $max_attempts ] && [ "$backend_ready" = false ]; do
    if curl -s http://localhost:3001/api/health &> /dev/null; then
        backend_ready=true
    else
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    fi
done

if [ "$backend_ready" = true ]; then
    echo -e " ${GREEN}✅ Backend API listo${NC}"
else
    echo -e " ${YELLOW}⚠️ Backend tardó más de lo esperado${NC}"
fi

# Esperar Frontend
echo -n "Esperando Frontend..."
sleep 5

max_attempts=30
attempt=0
frontend_ready=false

while [ $attempt -lt $max_attempts ] && [ "$frontend_ready" = false ]; do
    if curl -s http://localhost:3000 &> /dev/null; then
        frontend_ready=true
    else
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    fi
done

if [ "$frontend_ready" = true ]; then
    echo -e " ${GREEN}✅ Frontend listo${NC}"
else
    echo -e " ${YELLOW}⚠️ Frontend tardó más de lo esperado${NC}"
fi

echo ""

# ============================================================================
# PASO 6: Abrir navegador
# ============================================================================
echo -e "${YELLOW}📋 PASO 6: Abriendo aplicación en el navegador...${NC}"
echo ""

sleep 2

# Detectar sistema operativo y abrir navegador
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo -n "Abriendo Frontend (http://localhost:3000)..."
    open http://localhost:3000
    echo -e " ${GREEN}✅${NC}"

    sleep 1

    echo -n "Abriendo API Docs (http://localhost:3001/api/docs)..."
    open http://localhost:3001/api/docs
    echo -e " ${GREEN}✅${NC}"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo -n "Abriendo Frontend (http://localhost:3000)..."
    xdg-open http://localhost:3000 2>/dev/null || true
    echo -e " ${GREEN}✅${NC}"

    sleep 1

    echo -n "Abriendo API Docs (http://localhost:3001/api/docs)..."
    xdg-open http://localhost:3001/api/docs 2>/dev/null || true
    echo -e " ${GREEN}✅${NC}"
else
    echo -e "${YELLOW}⚠️ No se pudo detectar el navegador. Abre manualmente:${NC}"
    echo "   - Frontend: http://localhost:3000"
    echo "   - API Docs: http://localhost:3001/api/docs"
fi

echo ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}🎉 ¡DESPLIEGUE COMPLETADO EXITOSAMENTE!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

echo -e "${CYAN}📊 SERVICIOS DISPONIBLES:${NC}"
echo ""
echo -e "${WHITE}  🌐 Frontend:           http://localhost:3000${NC}"
echo -e "${WHITE}  🔌 Backend API:        http://localhost:3001/api${NC}"
echo -e "${WHITE}  📚 API Docs (Swagger): http://localhost:3001/api/docs${NC}"
echo -e "${WHITE}  🔍 GraphQL Playground: http://localhost:3001/graphql${NC}"
echo -e "${WHITE}  🗄️  PostgreSQL:         localhost:5432${NC}"
echo -e "${WHITE}  🔴 Redis:              localhost:6379${NC}"
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

echo -e "${CYAN}🔧 COMANDOS ÚTILES:${NC}"
echo ""
echo -e "${WHITE}  Ver logs:                docker-compose logs -f${NC}"
echo -e "${WHITE}  Ver logs de un servicio: docker-compose logs -f backend${NC}"
echo -e "${WHITE}  Detener servicios:       docker-compose down${NC}"
echo -e "${WHITE}  Reiniciar servicios:     docker-compose restart${NC}"
echo -e "${WHITE}  Ver estado:              docker-compose ps${NC}"
echo ""

echo -e "${CYAN}📖 DOCUMENTACIÓN:${NC}"
echo ""
echo -e "${WHITE}  README.md              - Documentación principal${NC}"
echo -e "${WHITE}  ARCHITECTURE.md        - Arquitectura del sistema${NC}"
echo -e "${WHITE}  GETTING_STARTED.md     - Guía de inicio${NC}"
echo -e "${WHITE}  CREDENTIALS.md         - Credenciales completas${NC}"
echo ""

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✨ ¡Disfruta desarrollando! ✨${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
