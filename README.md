# 🎓 Sistema de Gestión de Cursos - Global Medicine Foundation

[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?logo=nestjs)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-000000?logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-24.x-2496ED?logo=docker)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-143%20passed-success)](./backend/TESTS_SUMMARY.md)
[![Coverage](https://img.shields.io/badge/Coverage-%3E80%25-brightgreen)](./backend/TESTS_SUMMARY.md)

Sistema completo de gestión de cursos y programas educativos desarrollado con **Arquitectura Hexagonal + Clean Architecture**, implementando un monolito modular escalable listo para migración a microservicios.

**Desarrollado para:** Global Medicine Foundation
**Stack:** NestJS + Next.js 14 + PostgreSQL + Docker
**Arquitectura:** Hexagonal + Clean Architecture + DDD

---

## 📋 Tabla de Contenidos

- [🚀 Inicio Rápido (Despliegue Automático)](#-inicio-rápido-despliegue-automático)
- [📦 Requisitos Previos](#-requisitos-previos)
- [⚙️ Configuración de Puertos](#️-configuración-de-puertos)
- [🔧 Instalación Manual (Paso a Paso)](#-instalación-manual-paso-a-paso)
- [✨ Características](#-características)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [🏛️ Arquitectura](#️-arquitectura)
- [�️ Inicialización de Base de Datos](#️-inicialización-de-base-de-datos)
- [🧪 Testing](#-testing)
- [📚 Documentación Adicional](#-documentación-adicional)
- [🐛 Solución de Problemas](#-solución-de-problemas)

---

## 🚀 Inicio Rápido (Despliegue Automático)

### ⚡ Opción 1: Script Automático (RECOMENDADO)

Este script despliega **automáticamente** todo el proyecto (Frontend + Backend + Base de Datos) en localhost.

#### **Para Windows (PowerShell):**

```powershell
# 1. Clonar el repositorio
git clone https://github.com/williamangaritac/gestion_cursos_globaMed.git
cd gestion_cursos_globaMed

# 2. Ejecutar script automático
.\scripts\quick-start-windows.ps1
```

#### **Para Linux/Mac (Bash):**

```bash
# 1. Clonar el repositorio
git clone https://github.com/williamangaritac/gestion_cursos_globaMed.git
cd gestion_cursos_globaMed

# 2. Dar permisos de ejecución y ejecutar
chmod +x scripts/quick-start-linux.sh
./scripts/quick-start-linux.sh
```

### ✅ ¿Qué hace el script automático?

El script realiza los siguientes pasos automáticamente:

1. ✅ **Verifica requisitos previos** (Docker, Docker Compose)
2. ✅ **Configura variables de entorno** (crea archivos .env)
3. ✅ **Limpia servicios previos** (detiene contenedores antiguos)
4. ✅ **Construye e inicia contenedores** (PostgreSQL, Redis, Backend, Frontend)
5. ✅ **Espera a que los servicios estén listos** (health checks)
6. ✅ **Abre el navegador automáticamente** (Frontend + API Docs)
7. ✅ **Muestra credenciales de prueba** y comandos útiles

**Tiempo estimado:** 3-5 minutos (primera vez)

### 🎯 Resultado Esperado

Después de ejecutar el script, tendrás acceso a:

- **🌐 Frontend:** http://localhost:3000
- **🔌 Backend API:** http://localhost:3001/api
- **📚 API Docs (Swagger):** http://localhost:3001/api/docs
- **🔍 GraphQL Playground:** http://localhost:3001/graphql
- **🗄️ PostgreSQL:** localhost:5432
- **🔴 Redis:** localhost:6379

---

## 📦 Requisitos Previos

### ✅ Requisitos Obligatorios

Antes de ejecutar el script automático o la instalación manual, asegúrate de tener instalado:

| Requisito | Versión Mínima | Verificar Instalación | Descargar |
|-----------|----------------|----------------------|-----------|
| **Docker Desktop** | 24.x | `docker --version` | [Descargar Docker](https://www.docker.com/products/docker-desktop) |
| **Docker Compose** | 2.x | `docker-compose --version` | Incluido en Docker Desktop |
| **Git** | 2.x | `git --version` | [Descargar Git](https://git-scm.com/) |

### 📝 Notas Importantes

- ✅ **Docker Desktop** incluye Docker Compose automáticamente
- ✅ **Docker debe estar corriendo** antes de ejecutar el script
- ✅ **No necesitas instalar Node.js, PostgreSQL ni Redis** (todo se ejecuta en contenedores)
- ✅ Los puertos **3000, 3001, 5432, 6379** deben estar disponibles

---

## ⚙️ Configuración de Puertos

### 📊 Tabla de Puertos Utilizados

| Servicio | Puerto | URL de Acceso | Descripción |
|----------|--------|---------------|-------------|
| **Frontend (Next.js)** | `3000` | http://localhost:3000 | Aplicación web principal |
| **Backend (NestJS)** | `3001` | http://localhost:3001/api | API REST |
| **Swagger Docs** | `3001` | http://localhost:3001/api/docs | Documentación interactiva de la API |
| **GraphQL Playground** | `3001` | http://localhost:3001/graphql | Interfaz GraphQL |
| **PostgreSQL** | `5432` | localhost:5432 | Base de datos |
| **Redis** | `6379` | localhost:6379 | Cache y sesiones |
| **PgAdmin** (opcional) | `5050` | http://localhost:5050 | Administrador de PostgreSQL |

### 🔧 Cambiar Puertos (Opcional)

Si necesitas cambiar los puertos por conflictos, edita el archivo `docker-compose.yml`:

```yaml
# Ejemplo: Cambiar puerto del frontend de 3000 a 3002
frontend:
  ports:
    - "3002:3000"  # Puerto_Host:Puerto_Contenedor
```

---

## 🔧 Instalación Manual (Paso a Paso)

Si el script automático no funciona o prefieres instalación manual, sigue estos pasos:

### **Paso 1: Clonar el Repositorio**

```bash
git clone https://github.com/williamangaritac/gestion_cursos_globaMed.git
cd gestion_cursos_globaMed
```

### **Paso 2: Configurar Variables de Entorno**

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Copiar para backend
cp backend/.env.example backend/.env

# Copiar para frontend
cp frontend/.env.example frontend/.env.local
```

**Nota:** Los archivos `.env.example` ya tienen valores por defecto que funcionan para desarrollo local.

### **Paso 3: Iniciar Servicios con Docker Compose**

```bash
# Construir e iniciar todos los servicios
docker-compose up -d --build

# Ver logs en tiempo real (opcional)
docker-compose logs -f
```

**Tiempo estimado:** 3-5 minutos (primera vez)

### **Paso 4: Verificar que los Servicios Estén Corriendo**

```bash
# Ver estado de los contenedores
docker-compose ps

# Deberías ver 4 servicios corriendo:
# - course-management-db (postgres)
# - course-management-redis (redis)
# - course-management-backend (backend)
# - course-management-frontend (frontend)
```

### **Paso 5: Acceder a la Aplicación**

Abre tu navegador y accede a:

- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:3001/api/docs
- **GraphQL:** http://localhost:3001/graphql

### **Paso 6: Iniciar Sesión**

Usa las credenciales de prueba (ver sección [Credenciales de Prueba](#-credenciales-de-prueba))

---

## ✨ Características

### 🎯 Funcionalidades Core

- ✅ **Autenticación JWT** - Login/Logout con access y refresh tokens
- ✅ **Gestión de Usuarios** - CRUD completo con roles (Admin, Instructor, Student)
- ✅ **Gestión de Programas** - CRUD con filtros, paginación y control de capacidad
- ✅ **Inscripciones** - Asignación de usuarios a programas con validaciones
- ✅ **Control de Progreso** - Seguimiento de progreso de estudiantes (0-100%)
- ✅ **API REST** - Endpoints RESTful completos y documentados
- ✅ **GraphQL** - Consultas optimizadas con filtros avanzados
- ✅ **Validaciones** - Control de errores y feedback al usuario
- ✅ **Control de Acceso** - Guards basados en roles (RBAC)

### 🔒 Seguridad

- ✅ **JWT Authentication** - Access tokens (15 min) + Refresh tokens (7 días)
- ✅ **Password Hashing** - bcrypt con 10 rounds
- ✅ **CORS** - Configurado para frontend específico
- ✅ **Rate Limiting** - Protección contra ataques de fuerza bruta
- ✅ **Input Validation** - class-validator en todos los DTOs
- ✅ **SQL Injection Protection** - TypeORM con prepared statements
- ✅ **XSS Protection** - Sanitización de inputs

### 🏗️ Arquitectura y Calidad

- ✅ **Arquitectura Hexagonal** - Separación clara de capas (Domain, Application, Infrastructure, Presentation)
- ✅ **Clean Architecture** - Independencia de frameworks y bases de datos
- ✅ **DDD (Domain-Driven Design)** - Entidades, Value Objects, Aggregates
- ✅ **Testing >80%** - 143 tests (63 unitarios + 80 E2E) en español
- ✅ **Docker** - Desarrollo y deployment containerizado
- ✅ **TypeScript** - Type safety en todo el código
- ✅ **ESLint + Prettier** - Code quality y formatting

### 🚀 Performance

- ✅ **Redis Cache** - Cache de consultas frecuentes
- ✅ **Database Indexes** - Índices optimizados en PostgreSQL
- ✅ **Lazy Loading** - Carga diferida de módulos en frontend
- ✅ **Connection Pooling** - Pool de conexiones a base de datos
- ✅ **Triggers** - Actualización automática de contadores

---

## 🛠️ Stack Tecnológico

### 🔙 Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | 10.x | Framework principal |
| **Node.js** | 20 LTS | Runtime |
| **TypeScript** | 5.x | Lenguaje |
| **PostgreSQL** | 16 | Base de datos |
| **TypeORM** | 0.3.x | ORM |
| **Redis** | 7.x | Cache y sesiones |
| **Passport JWT** | 10.x | Autenticación |
| **class-validator** | 0.14.x | Validaciones |
| **Jest** | 29.x | Testing |
| **Swagger** | 7.x | Documentación API |

### 🎨 Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 14.x | Framework (App Router) |
| **React** | 18.x | UI Library |
| **TypeScript** | 5.x | Lenguaje |
| **Redux Toolkit** | 2.0.x | State Management |
| **React Hook Form** | 7.x | Formularios |
| **Zod** | 3.x | Validación de schemas |
| **Tailwind CSS** | 3.x | Styling |
| **Axios** | 1.x | HTTP Client |
| **React Query** | 5.x | Server state management |

### 🐳 DevOps

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Docker** | 24.x | Containerización |
| **Docker Compose** | 2.x | Orquestación local |
| **ESLint** | 8.x | Linting |
| **Prettier** | 3.x | Code formatting |

---

## 🏛️ Arquitectura

### 📐 Arquitectura Hexagonal + Clean Architecture

El sistema implementa **Arquitectura Hexagonal (Ports & Adapters)** combinada con **Clean Architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                   HEXAGONAL ARCHITECTURE                     │
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │ Presentation │ ◄─────► │ Application  │                  │
│  │ (Controllers)│         │  (Use Cases) │                  │
│  └──────────────┘         └──────┬───────┘                  │
│                                   │                           │
│                          ┌────────▼─────────┐                │
│                          │     Domain       │                │
│                          │ (Business Logic) │                │
│                          └────────┬─────────┘                │
│                                   │                           │
│                          ┌────────▼─────────┐                │
│                          │ Infrastructure   │                │
│                          │ (DB, External)   │                │
│                          └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### 📁 Estructura de Módulos

```
backend/src/modules/
├── auth/                    # Autenticación y autorización
│   ├── domain/              # Entidades y lógica de negocio
│   ├── application/         # Casos de uso
│   ├── infrastructure/      # Repositorios y adaptadores
│   └── presentation/        # Controllers y DTOs
├── users/                   # Gestión de usuarios
├── programs/                # Gestión de programas
└── enrollments/             # Gestión de inscripciones
```

**Beneficios de esta arquitectura:**

- ✅ **Independencia de frameworks** - Fácil migración a otros frameworks
- ✅ **Alta testabilidad** - 143 tests con >80% de cobertura
- ✅ **Fácil mantenimiento** - Código organizado y modular
- ✅ **Módulos intercambiables** - Cada módulo puede ser un microservicio
- ✅ **Escalabilidad** - Preparado para migración a microservicios

📖 **Ver documentación completa:** [ARCHITECTURE.md](./ARCHITECTURE.md)
📖 **Ver defensa técnica:** [DEFENSA_ARQUITECTURA.md](./DEFENSA_ARQUITECTURA.md)

---

## 🗄️ Inicialización de Base de Datos

### 📊 Script Automático de Base de Datos

Si necesitas reinicializar la base de datos o crear las tablas y datos de prueba manualmente, usa el script automático:

#### **Para Windows (PowerShell):**

```powershell
# Inicializar base de datos con schema y datos de prueba
.\scripts\init-database-windows.ps1
```

#### **Para Linux/Mac (Bash):**

```bash
# Dar permisos de ejecución
chmod +x scripts/init-database-linux.sh

# Inicializar base de datos
./scripts/init-database-linux.sh
```

### ✅ ¿Qué hace el script de base de datos?

El script realiza automáticamente:

1. ✅ **Verifica que PostgreSQL esté corriendo**
2. ✅ **Ejecuta el schema completo** (tablas, índices, triggers, constraints)
3. ✅ **Carga datos de prueba** (usuarios, programas, inscripciones)
4. ✅ **Verifica la integridad** de los datos
5. ✅ **Muestra credenciales** de usuarios de prueba

**Archivos SQL ejecutados:**
- `database/01-schema.sql` - Schema completo
- `database/02-seed-users.sql` - Usuarios de prueba
- `database/03-seed-programs.sql` - Programas de ejemplo
- `database/04-additional-programs.sql` - Programas adicionales

### 👤 Credenciales de Prueba

El sistema incluye usuarios de prueba pre-configurados. Para ver las credenciales completas, consulta:

📖 **[CREDENTIALS.md](./CREDENTIALS.md)** - Credenciales de todos los usuarios de prueba

**Nota:** Las contraseñas están hasheadas con **bcrypt (10 rounds)** por seguridad.

---

## 🧪 Testing

El proyecto incluye **143 tests** (63 unitarios + 80 E2E) con **>80% de cobertura**.

### 🚀 Ejecutar Tests

```bash
# Tests unitarios
cd backend
npm test

# Tests con cobertura
npm run test:cov

# Tests E2E (integración)
npm run test:e2e

# Tests en modo watch
npm run test:watch
```

### 📊 Cobertura de Tests

| Módulo | Tests Unitarios | Tests E2E | Cobertura |
|--------|----------------|-----------|-----------|
| **Auth** | 15 | 20 | >85% |
| **Users** | 18 | 22 | >80% |
| **Programs** | 16 | 18 | >80% |
| **Enrollments** | 14 | 20 | >80% |
| **TOTAL** | **63** | **80** | **>80%** |

📖 **Ver resumen completo:** [backend/TESTS_SUMMARY.md](./backend/TESTS_SUMMARY.md)

---

## 📚 Documentación Adicional

### 📖 Documentación Técnica

| Documento | Descripción |
|-----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitectura completa del sistema (2,348 líneas) |
| [GETTING_STARTED.md](./GETTING_STARTED.md) | Guía de inicio para desarrolladores |
| [DEFENSA_ARQUITECTURA.md](./DEFENSA_ARQUITECTURA.md) | Defensa técnica: Monolito vs Microservicios |
| [CREDENTIALS.md](./CREDENTIALS.md) | Credenciales de todos los usuarios de prueba |
| [backend/TESTS_SUMMARY.md](./backend/TESTS_SUMMARY.md) | Resumen completo de tests |

### 🔧 Guías de Deployment

| Documento | Descripción |
|-----------|-------------|
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Guía de deployment a producción |
| [DEPLOYMENT_SUCCESS.md](./DEPLOYMENT_SUCCESS.md) | Reporte de deployment exitoso |

### � Guías de Uso

| Documento | Descripción |
|-----------|-------------|
| [GUIA_PRUEBA_INSCRIPCIONES.md](./GUIA_PRUEBA_INSCRIPCIONES.md) | Guía para probar inscripciones |

---

## 🐛 Solución de Problemas

### ❌ Problema: "Docker no está corriendo"

**Solución:**
```bash
# Windows: Abre Docker Desktop desde el menú inicio
# Mac: Abre Docker Desktop desde Applications
# Linux: sudo systemctl start docker
```

### ❌ Problema: "Puerto 3000 ya está en uso"

**Solución:**
```bash
# Ver qué proceso usa el puerto
# Windows:
netstat -ano | findstr :3000

# Linux/Mac:
lsof -i :3000

# Matar el proceso o cambiar el puerto en docker-compose.yml
```

### ❌ Problema: "Error al conectar a la base de datos"

**Solución:**
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres

# Reiniciar servicios
docker-compose restart postgres backend
```

### ❌ Problema: "Frontend no carga"

**Solución:**
```bash
# Ver logs del frontend
docker-compose logs frontend

# Reconstruir el contenedor
docker-compose up -d --build frontend

# Verificar variables de entorno en frontend/.env.local
```

### ❌ Problema: "Tests fallan"

**Solución:**
```bash
# Asegúrate de que la base de datos esté corriendo
docker-compose up -d postgres

# Instala dependencias
cd backend
npm install

# Ejecuta tests
npm test
```

### 🆘 Comandos Útiles para Debugging

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Entrar a un contenedor
docker-compose exec backend sh

# Reiniciar todos los servicios
docker-compose restart

# Detener y eliminar todo (limpieza completa)
docker-compose down -v

# Reconstruir todo desde cero
docker-compose up -d --build --force-recreate
```

---

## 🔧 Comandos Útiles

### Docker Compose

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f [servicio]

# Reiniciar un servicio
docker-compose restart [servicio]

# Reconstruir un servicio
docker-compose up -d --build [servicio]

# Ver estado
docker-compose ps

# Ejecutar comando en contenedor
docker-compose exec [servicio] [comando]
```

### Base de Datos

```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U postgres -d course_management

# Backup de base de datos
docker-compose exec postgres pg_dump -U postgres course_management > backup.sql

# Restaurar base de datos
docker-compose exec -T postgres psql -U postgres course_management < backup.sql

# Ver tablas
docker-compose exec postgres psql -U postgres -d course_management -c "\dt"
```

### Desarrollo

```bash
# Instalar dependencias backend
cd backend && npm install

# Instalar dependencias frontend
cd frontend && npm install

# Ejecutar tests
cd backend && npm test

# Ver cobertura
cd backend && npm run test:cov

# Generar hash de password
cd backend && npm run generate:hash
```

---

## 📞 Contacto y Soporte

**Desarrollado para:** Global Medicine Foundation
**Repositorio:** https://github.com/williamangaritac/gestion_cursos_globaMed
**Documentación:** Ver archivos `.md` en la raíz del proyecto

---

## 📄 Licencia

Este proyecto fue desarrollado como prueba técnica para Global Medicine Foundation.

---

## 🎯 Próximos Pasos Recomendados

Después de clonar y ejecutar el proyecto:

1. ✅ **Explora la aplicación** - Inicia sesión con las credenciales de prueba
2. ✅ **Revisa la documentación** - Lee [ARCHITECTURE.md](./ARCHITECTURE.md) y [GETTING_STARTED.md](./GETTING_STARTED.md)
3. ✅ **Ejecuta los tests** - Verifica que todo funcione correctamente
4. ✅ **Explora la API** - Usa Swagger en http://localhost:3001/api/docs
5. ✅ **Prueba GraphQL** - Usa el playground en http://localhost:3001/graphql

---

**✨ ¡Gracias por usar el Sistema de Gestión de Cursos! ✨**


