# ARQUITECTURA DEL SISTEMA - MVP CURSO MANAGEMENT
## Monolito Modular con Arquitectura Hexagonal + Clean Architecture

**Versión:** 1.0.0  
**Última actualización:** 2025-11-07

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General](#1-visión-general)
2. [Diagramas UML del Sistema](#2-diagramas-uml-del-sistema)
   - 2.1 [Diagrama de Casos de Uso por Rol](#21-diagrama-de-casos-de-uso-por-rol)
   - 2.2 [Diagrama de Secuencia - Flujos Principales](#22-diagrama-de-secuencia---flujos-principales)
   - 2.3 [Diagrama de Componentes - Arquitectura Hexagonal](#23-diagrama-de-componentes---arquitectura-hexagonal)
   - 2.4 [Diagrama de Despliegue - Monolito Modular](#24-diagrama-de-despliegue---monolito-modular)
   - 2.5 [Diagrama de Clases - Modelo de Dominio](#25-diagrama-de-clases---modelo-de-dominio)
3. [Principios Arquitectónicos](#3-principios-arquitectónicos)
4. [Stack Tecnológico](#4-stack-tecnológico)
5. [Arquitectura Hexagonal Detallada](#5-arquitectura-hexagonal-detallada)
6. [Modelo de Datos](#6-modelo-de-datos)
7. [Estrategia de Escalabilidad](#7-estrategia-de-escalabilidad)

---

## 1. VISIÓN GENERAL

### 1.1 Objetivo del Sistema

Desarrollar un **MVP de Sistema de Gestión de Cursos** que permita:
- ✅ Registro y autenticación de usuarios (JWT)
- ✅ CRUD completo de cursos/programas
- ✅ Asignación de usuarios a cursos
- ✅ Consultas REST y GraphQL
- ✅ Interfaz web moderna y responsive

### 1.2 Estrategia de Desarrollo

```
FASE 1: DESARROLLO LOCAL
├── Docker Compose en localhost
├── PostgreSQL local
├── Testing completo >60%
└── MVP funcional al 100%
         ↓
FASE 2: PREPARACIÓN CLOUD
├── Optimización de imágenes Docker
├── Configuración de variables de entorno
├── Scripts de CI/CD
└── Documentación de deployment
         ↓
FASE 3: MIGRACIÓN CLOUD
├── Deploy backend (AWS/Railway/Render)
├── Deploy frontend (Vercel)
├── Base de datos en cloud (Supabase/AWS RDS)
└── Monitoreo y logs
```

### 1.3 Arquitectura de Alto Nivel

```
┌──────────────────────────────────────────────────────────────┐
│                    LOCALHOST DEVELOPMENT                      │
│                                                                │
│  ┌────────────────┐         ┌────────────────┐              │
│  │   Frontend     │         │    Backend     │              │
│  │   Next.js 14   │◄───────►│    NestJS      │              │
│  │   Port: 3000   │  HTTP   │   Port: 3001   │              │
│  └────────────────┘  GraphQL└────────┬───────┘              │
│                                       │                       │
│                      ┌────────────────┴────────────────┐     │
│                      │                                  │     │
│              ┌───────▼────────┐              ┌─────────▼────┐│
│              │   PostgreSQL   │              │     Redis    ││
│              │   Port: 5432   │              │  Port: 6379  ││
│              └────────────────┘              └──────────────┘│
│                                                                │
│              🐳 Todo corre en Docker Compose                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. DIAGRAMAS UML DEL SISTEMA

Esta sección presenta los diagramas UML completos del sistema, incluyendo casos de uso por rol, flujos de secuencia, arquitectura de componentes y modelo de dominio.

---

### 2.1 Diagrama de Casos de Uso por Rol

#### 2.1.1 Casos de Uso - Usuario ADMIN

```
                                    ┌─────────────────────────┐
                                    │   Gestionar Usuarios    │
                    ┌───────────────┤  - Crear Usuario        │
                    │               │  - Editar Usuario       │
                    │               │  - Eliminar Usuario     │
                    │               │  - Listar Usuarios      │
                    │               │  - Cambiar Rol          │
                    │               └─────────────────────────┘
                    │
                    │               ┌─────────────────────────┐
       ┌────────┐   │               │  Gestionar Programas    │
       │        │───┼───────────────┤  - Crear Programa       │
       │ ADMIN  │   │               │  - Editar Programa      │
       │        │   │               │  - Eliminar Programa    │
       └────────┘   │               │  - Activar/Desactivar   │
                    │               └─────────────────────────┘
                    │
                    │               ┌─────────────────────────┐
                    │               │ Gestionar Inscripciones │
                    └───────────────┤  - Inscribir Usuario    │
                                    │  - Cancelar Inscripción │
                                    │  - Ver Inscripciones    │
                                    │  - Aprobar/Rechazar     │
                                    └─────────────────────────┘
```

**Permisos del Admin:**
- ✅ Acceso completo a todos los módulos
- ✅ CRUD de usuarios, programas e inscripciones
- ✅ Gestión de roles y permisos
- ✅ Acceso a reportes y estadísticas
- ✅ Configuración del sistema

---

#### 2.1.2 Casos de Uso - Usuario INSTRUCTOR

```
                                    ┌─────────────────────────┐
                                    │ Ver Programas Asignados │
                    ┌───────────────┤  - Listar Mis Programas │
                    │               │  - Ver Detalles         │
                    │               └─────────────────────────┘
                    │
                    │               ┌─────────────────────────┐
    ┌──────────┐    │               │Gestionar Inscripciones  │
    │          │────┼───────────────┤  - Ver Inscripciones    │
    │INSTRUCTOR│    │               │  - Aprobar Inscripción  │
    │          │    │               │  - Rechazar Inscripción │
    └──────────┘    │               │  - Cancelar Inscripción │
                    │               └─────────────────────────┘
                    │
                    │               ┌─────────────────────────┐
                    │               │   Crear Programas       │
                    └───────────────┤  - Crear Nuevo Programa │
                                    │  - Editar Programa Propio│
                                    │  - Desactivar Programa  │
                                    └─────────────────────────┘
```

**Permisos del Instructor:**
- ✅ Crear y gestionar sus propios programas
- ✅ Ver y gestionar inscripciones de sus programas
- ✅ Ver lista de estudiantes inscritos
- ❌ No puede eliminar usuarios
- ❌ No puede modificar programas de otros instructores

---

#### 2.1.3 Casos de Uso - Usuario STUDENT

```
                                    ┌─────────────────────────┐
                                    │Ver Programas Disponibles│
                    ┌───────────────┤  - Buscar Programas     │
                    │               │  - Filtrar por Categoría│
                    │               │  - Ver Detalles         │
                    │               └─────────────────────────┘
                    │
    ┌─────────┐     │               ┌─────────────────────────┐
    │         │─────┼───────────────│Gestionar Mis Inscripciones│
    │ STUDENT │     │               │  - Inscribirme          │
    │         │     │               │  - Ver Mis Inscripciones│
    └─────────┘     │               │  - Cancelar Inscripción │
                    │               └─────────────────────────┘
                    │
                    │               ┌─────────────────────────┐
                    │               │    Ver Mi Perfil        │
                    └───────────────┤  - Ver Mis Datos        │
                                    │  - Editar Perfil        │
                                    │  - Cambiar Contraseña   │
                                    └─────────────────────────┘
```

**Permisos del Student:**
- ✅ Ver todos los programas disponibles
- ✅ Inscribirse a programas
- ✅ Ver y cancelar sus propias inscripciones
- ✅ Editar su propio perfil
- ❌ No puede crear programas
- ❌ No puede ver inscripciones de otros estudiantes
- ❌ No puede gestionar usuarios

---

### 2.2 Diagrama de Secuencia - Flujos Principales

#### 2.2.1 Flujo de Autenticación (Login)

```
Usuario          Frontend         Backend API      AuthService      PostgreSQL      Redis
  │                 │                  │                │               │             │
  │─────(1)────────>│                  │                │               │             │
  │ Ingresa         │                  │                │               │             │
  │ credenciales    │                  │                │               │             │
  │                 │                  │                │               │             │
  │                 │─────(2)─────────>│                │               │             │
  │                 │ POST /auth/login │                │               │             │
  │                 │                  │                │               │             │
  │                 │                  │────(3)────────>│               │             │
  │                 │                  │ validateUser() │               │             │
  │                 │                  │                │               │             │
  │                 │                  │                │───(4)────────>│             │
  │                 │                  │                │ SELECT user   │             │
  │                 │                  │                │               │             │
  │                 │                  │                │<──(5)─────────│             │
  │                 │                  │                │ User + hash   │             │
  │                 │                  │                │               │             │
  │                 │                  │                │───(6)────────────────────>  │
  │                 │                  │                │ Guarda sesión │             │
  │                 │                  │                │               │             │
  │                 │                  │<───(7)─────────│               │             │
  │                 │                  │ {token, user}  │               │             │
  │                 │                  │                │               │             │
  │                 │<────(8)──────────│                │               │             │
  │                 │ 200 OK           │                │               │             │
  │                 │ {token, user}    │                │               │             │
  │                 │                  │                │               │             │
  │<────(9)─────────│                  │                │               │             │
  │ Redirige a      │                  │                │               │             │
  │ dashboard       │                  │                │               │             │
```

**Detalles técnicos:**
- **JWT Expiration:** 24 horas
- **Password Hashing:** bcrypt con salt rounds = 10
- **Cache:** Redis para sesiones activas (TTL: 24h)
- **Validación:** Zod en frontend, class-validator en backend

---

#### 2.2.2 Flujo de Creación de Programa (Instructor/Admin)

```
Instructor/Admin   Frontend      Backend API    JwtAuthGuard   ProgramsService   PostgreSQL
     │                │               │               │               │              │
     │────(1)────────>│               │               │               │              │
     │ Completa       │               │               │               │              │
     │ formulario     │               │               │               │              │
     │                │               │               │               │              │
     │                │───(2)────────>│               │               │              │
     │                │ POST /programs│               │               │              │
     │                │ + JWT token   │               │               │              │
     │                │               │               │               │              │
     │                │               │───(3)────────>│               │              │
     │                │               │ Valida token  │               │              │
     │                │               │ Verifica rol  │               │              │
     │                │               │               │               │              │
     │                │               │<──(4)─────────│               │              │
     │                │               │ Autorizado    │               │              │
     │                │               │               │               │              │
     │                │               │───(5)────────────────────────>│              │
     │                │               │ create(dto)   │               │              │
     │                │               │               │               │              │
     │                │               │               │───(6)────────────────────>   │
     │                │               │               │ INSERT program│              │
     │                │               │               │               │              │
     │                │               │               │<──(7)─────────────────────   │
     │                │               │               │ Program creado│              │
     │                │               │               │               │              │
     │                │               │<──(8)─────────────────────────│              │
     │                │               │ Program DTO   │               │              │
     │                │               │               │               │              │
     │                │<──(9)─────────│               │               │              │
     │                │ 201 Created   │               │               │              │
     │                │               │               │               │              │
     │<───(10)────────│               │               │               │              │
     │ Mensaje éxito  │               │               │               │              │
```

---

#### 2.2.3 Flujo de Inscripción a Programa (Student)

```
Estudiante    Frontend    Backend API   EnrollmentsService   ProgramsService   PostgreSQL
   │             │             │                │                   │              │
   │──(1)───────>│             │                │                   │              │
   │ Click       │             │                │                   │              │
   │"Inscribirme"│             │                │                   │              │
   │             │             │                │                   │              │
   │             │──(2)───────>│                │                   │              │
   │             │POST /enrollments             │                   │              │
   │             │             │                │                   │              │
   │             │             │───(3)─────────>│                   │              │
   │             │             │ create(dto)    │                   │              │
   │             │             │                │                   │              │
   │             │             │                │──(4)─────────────>│              │
   │             │             │                │ findOne(programId)│              │
   │             │             │                │                   │              │
   │             │             │                │                   │──(5)────────>│
   │             │             │                │                   │SELECT program│
   │             │             │                │                   │              │
   │             │             │                │<──(6)─────────────│              │
   │             │             │                │ Program entity    │              │
   │             │             │                │                   │              │
   │             │             │                │──(7)──────────────────────────>  │
   │             │             │                │ BEGIN TRANSACTION│              │
   │             │             │                │ INSERT enrollment│              │
   │             │             │                │ UPDATE program   │              │
   │             │             │                │ COMMIT           │              │
   │             │             │                │                   │              │
   │             │             │<──(8)──────────│                   │              │
   │             │             │ Enrollment DTO │                   │              │
   │             │             │                │                   │              │
   │             │<──(9)───────│                │                   │              │
   │             │ 201 Created │                │                   │              │
   │             │             │                │                   │              │
   │<──(10)──────│             │                │                   │              │
   │"Inscripción │             │                │                   │              │
   │  exitosa"   │             │                │                   │              │
```

**Validaciones de negocio:**
- ✅ Programa debe estar activo (`isActive = true`)
- ✅ Debe haber cupos disponibles (`enrolledCount < capacity`)
- ✅ Usuario no debe estar ya inscrito
- ✅ Fecha actual debe estar entre `startDate` y `endDate`

---

### 2.3 Diagrama de Componentes - Arquitectura Hexagonal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND - Next.js 14                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ UI Components│  │    Pages     │  │ Redux Store  │  │  API Client  │   │
│  │ React+Tailwind│  │  App Router  │  │State Mgmt    │  │    Axios     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────┬───────┘   │
└────────────────────────────────────────────────────────────────┼─────────────┘
                                                                  │
                                                    HTTP/GraphQL  │
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND - NestJS (Monolito Modular)                       │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │              PRESENTATION LAYER (Inbound Ports)                       │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │  │
│  │  │ REST Controllers │  │ GraphQL Resolvers│  │  Auth Guards     │   │  │
│  │  │  - AuthController│  │  - UsersResolver │  │  - JwtAuthGuard  │   │  │
│  │  │  - UsersController│  │  - ProgramsRes.  │  │  - RolesGuard    │   │  │
│  │  │  - ProgramsCtrl  │  │  - EnrollmentsRes│  │                  │   │  │
│  │  │  - EnrollmentsCtrl│  │                  │  │                  │   │  │
│  │  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘   │  │
│  └───────────┼─────────────────────┼─────────────────────┼─────────────┘  │
│              │                     │                     │                  │
│              ▼                     ▼                     ▼                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │              APPLICATION LAYER (Use Cases)                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │  │
│  │  │ AuthService  │  │ UsersService │  │ProgramsService│  │Enrollments│ │  │
│  │  │              │  │              │  │              │  │  Service  │ │  │
│  │  │ - login()    │  │ - create()   │  │ - create()   │  │ - create()│ │  │
│  │  │ - register() │  │ - findAll()  │  │ - findAll()  │  │ - approve()│ │  │
│  │  │ - validate() │  │ - update()   │  │ - update()   │  │ - cancel()│ │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬────┘ │  │
│  └─────────┼──────────────────┼──────────────────┼────────────────┼──────┘  │
│            │                  │                  │                │          │
│            ▼                  ▼                  ▼                ▼          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    DOMAIN LAYER (Core Business Logic)                 │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │  │
│  │  │ User Entity  │  │Program Entity│  │Enrollment    │  │ Business │ │  │
│  │  │              │  │              │  │   Entity     │  │  Rules   │ │  │
│  │  │ - id         │  │ - id         │  │ - id         │  │          │ │  │
│  │  │ - email      │  │ - name       │  │ - userId     │  │ Validators│ │  │
│  │  │ - role       │  │ - capacity   │  │ - programId  │  │          │ │  │
│  │  │ - hasRole()  │  │ - hasSlots() │  │ - status     │  │          │ │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────────┘ │  │
│  └─────────┼──────────────────┼──────────────────┼──────────────────────┘  │
│            │                  │                  │                          │
│            ▼                  ▼                  ▼                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │            INFRASTRUCTURE LAYER (Outbound Ports)                      │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │  │
│  │  │   Repositories   │  │  Cache Service   │  │  Email Service   │   │  │
│  │  │   (TypeORM)      │  │     (Redis)      │  │                  │   │  │
│  │  │                  │  │                  │  │                  │   │  │
│  │  │ - UsersRepo      │  │ - set()          │  │ - sendEmail()    │   │  │
│  │  │ - ProgramsRepo   │  │ - get()          │  │                  │   │  │
│  │  │ - EnrollmentsRepo│  │ - delete()       │  │                  │   │  │
│  │  └────────┬─────────┘  └────────┬─────────┘  └──────────────────┘   │  │
│  └───────────┼─────────────────────┼──────────────────────────────────────┘  │
└──────────────┼─────────────────────┼───────────────────────────────────────┘
               │                     │
               ▼                     ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   PostgreSQL Database    │  │     Redis Cache          │
│   Port: 5432             │  │     Port: 6379           │
│                          │  │                          │
│   - users                │  │   - sessions             │
│   - programs             │  │   - cache keys           │
│   - enrollments          │  │   - rate limiting        │
└──────────────────────────┘  └──────────────────────────┘
```

**Explicación de capas:**

1. **Presentation Layer (Inbound Ports):**
   - Controllers REST y Resolvers GraphQL
   - Guards para autenticación y autorización (JWT + RBAC)
   - DTOs para validación de entrada

2. **Application Layer (Use Cases):**
   - Servicios con lógica de aplicación
   - Orquestación de casos de uso
   - Coordinación entre dominio e infraestructura

3. **Domain Layer (Core):**
   - Entidades de dominio con reglas de negocio
   - Independiente de frameworks y tecnologías
   - Validadores y lógica de negocio pura

4. **Infrastructure Layer (Outbound Ports):**
   - Repositorios (TypeORM)
   - Servicios externos (Redis, Email)
   - Implementaciones concretas de interfaces

---

### 2.4 Diagrama de Despliegue - Monolito Modular

#### 2.4.1 Arquitectura Actual (Localhost - Docker Compose)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      LOCALHOST DEVELOPMENT                               │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              Docker Compose Network (bridge)                     │   │
│  │                                                                   │   │
│  │   ┌──────────────────┐         ┌──────────────────┐            │   │
│  │   │   Frontend       │         │    Backend       │            │   │
│  │   │   Container      │         │    Container     │            │   │
│  │   │                  │         │                  │            │   │
│  │   │  Next.js 14      │◄───────►│    NestJS        │            │   │
│  │   │  Port: 3000      │  HTTP   │    Port: 3001    │            │   │
│  │   │  Node 20-alpine  │ GraphQL │  Node 20-alpine  │            │   │
│  │   └──────────────────┘         └────────┬─────────┘            │   │
│  │                                          │                       │   │
│  │                         ┌────────────────┴────────────────┐     │   │
│  │                         │                                  │     │   │
│  │                ┌────────▼────────┐              ┌─────────▼────┐│   │
│  │                │   PostgreSQL    │              │    Redis     ││   │
│  │                │   Container     │              │  Container   ││   │
│  │                │                 │              │              ││   │
│  │                │  Port: 5432     │              │  Port: 6379  ││   │
│  │                │postgres:16-alpine│              │redis:7-alpine││   │
│  │                └─────────────────┘              └──────────────┘│   │
│  │                         │                                        │   │
│  │                         ▼                                        │   │
│  │                ┌─────────────────┐                              │   │
│  │                │  Volume:        │                              │   │
│  │                │postgres_data    │                              │   │
│  │                └─────────────────┘                              │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  Acceso desde navegador:                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  http://localhost:3000  ──► Frontend (Next.js)                  │   │
│  │  http://localhost:3001  ──► Backend API (NestJS)                │   │
│  │  http://localhost:3001/api/docs  ──► Swagger Documentation      │   │
│  │  http://localhost:3001/graphql   ──► GraphQL Playground         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Características del despliegue local:**
- ✅ Todo corre en contenedores Docker
- ✅ Red interna para comunicación entre servicios
- ✅ Volúmenes persistentes para PostgreSQL
- ✅ Hot reload en desarrollo (frontend y backend)
- ✅ Fácil de iniciar con `docker-compose up`

---

#### 2.4.2 Arquitectura Futura (Cloud - Escalable a Microservicios)

```
                              ┌─────────────────┐
                              │     USERS       │
                              └────────┬────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            CDN LAYER                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              Vercel CDN - Static Assets & Edge Functions         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │  Next.js     │  │  Next.js     │  │  Next.js     │                 │
│  │ Instance 1   │  │ Instance 2   │  │ Instance N   │                 │
│  │ Vercel Edge  │  │ Vercel Edge  │  │ Auto-scaling │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  - Rate Limiting                                                  │  │
│  │  - Load Balancing                                                 │  │
│  │  - Authentication                                                 │  │
│  │  - Request Routing                                                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER (Monolito Modular)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   NestJS     │  │   NestJS     │  │   NestJS     │                 │
│  │ Instance 1   │  │ Instance 2   │  │ Instance N   │                 │
│  │Railway/Render│  │Railway/Render│  │ Auto-scaling │                 │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                 │
└─────────┼──────────────────┼──────────────────┼──────────────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                      │
│                                                                           │
│  ┌──────────────────────┐         ┌──────────────────────┐             │
│  │  PostgreSQL Master   │────────►│  Read Replica 1      │             │
│  │  Supabase/AWS RDS    │         │                      │             │
│  │  Port: 5432          │────────►│  Read Replica 2      │             │
│  └──────────────────────┘         └──────────────────────┘             │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              Redis Cluster (Upstash/AWS ElastiCache)             │  │
│  │  - Session Management                                             │  │
│  │  - Cache Layer                                                    │  │
│  │  - Rate Limiting                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       MONITORING & LOGGING                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │    Logs      │  │   Metrics    │  │    Alerts    │                 │
│  │  CloudWatch  │  │  Prometheus  │  │  PagerDuty   │                 │
│  │   Datadog    │  │   Grafana    │  │              │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

#### 2.4.3 Estrategia de Migración a Microservicios

```
FASE 1: MONOLITO MODULAR (Actual)
┌─────────────────────────────────────┐
│         Monolito NestJS             │
│  ┌─────────────────────────────┐   │
│  │  Auth Module                │   │
│  │  Users Module               │   │
│  │  Programs Module            │   │
│  │  Enrollments Module         │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
                 │
                 │ Refactor
                 ▼
FASE 2: EXTRACCIÓN DE AUTH
┌──────────────────────┐    ┌──────────────────────┐
│   Monolito NestJS    │    │  Auth Microservice   │
│  ┌────────────────┐  │    │  ┌────────────────┐ │
│  │ Users Module   │  │    │  │  JWT + OAuth   │ │
│  │ Programs Module│  │    │  │  User Auth     │ │
│  │Enrollments Mod │  │    │  └────────────────┘ │
│  └────────────────┘  │    └──────────────────────┘
└──────────────────────┘
                 │
                 │ Split
                 ▼
FASE 3: SEPARACIÓN COMPLETA (Microservicios)
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Auth      │  │    Users     │  │   Programs   │  │ Enrollments  │
│  Service     │  │   Service    │  │   Service    │  │   Service    │
│              │  │              │  │              │  │              │
│  Port: 3001  │  │  Port: 3002  │  │  Port: 3003  │  │  Port: 3004  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │                 │
       └─────────────────┴─────────────────┴─────────────────┘
                                │
                                ▼
                      ┌──────────────────┐
                      │   API Gateway    │
                      │  - Routing       │
                      │  - Auth          │
                      │  - Rate Limiting │
                      └──────────────────┘
```

**Criterios para migrar a microservicios:**
- ✅ > 100,000 usuarios activos
- ✅ > 10 desarrolladores en el equipo
- ✅ Módulos con diferencias de carga 10x
- ✅ Necesidad de deploy independiente > 10 veces/día
- ✅ Equipos especializados por dominio

---

### 2.5 Diagrama de Clases - Modelo de Dominio

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DOMAIN ENTITIES                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│        User              │
├──────────────────────────┤
│ - id: UUID               │
│ - email: String          │
│ - password: String       │
│ - firstName: String      │
│ - lastName: String       │
│ - role: UserRole         │
│ - isActive: Boolean      │
│ - createdAt: DateTime    │
│ - updatedAt: DateTime    │
├──────────────────────────┤
│ + validateEmail(): Boolean│
│ + hashPassword(): void   │
│ + comparePassword(plain: String): Boolean │
│ + hasRole(role: UserRole): Boolean        │
│ + getFullName(): String  │
└────────┬─────────────────┘
         │
         │ 1
         │
         │ has
         │
         │ 0..*
         ▼
┌──────────────────────────┐
│     Enrollment           │
├──────────────────────────┤
│ - id: UUID               │
│ - userId: UUID           │
│ - programId: UUID        │
│ - status: EnrollmentStatus│
│ - enrolledAt: DateTime   │
│ - completedAt: DateTime  │
│ - cancelledAt: DateTime  │
├──────────────────────────┤
│ + canCancel(): Boolean   │
│ + approve(): void        │
│ + reject(): void         │
│ + complete(): void       │
│ + cancel(): void         │
│ + isPending(): Boolean   │
│ + isActive(): Boolean    │
└────────┬─────────────────┘
         │
         │ belongs to
         │
         │ 1
         ▼
┌──────────────────────────┐
│       Program            │
├──────────────────────────┤
│ - id: UUID               │
│ - name: String           │
│ - description: String    │
│ - category: String       │
│ - capacity: Integer      │
│ - enrolledCount: Integer │
│ - startDate: Date        │
│ - endDate: Date          │
│ - isActive: Boolean      │
│ - createdAt: DateTime    │
│ - updatedAt: DateTime    │
├──────────────────────────┤
│ + hasAvailableSlots(): Boolean │
│ + isEnrollmentOpen(): Boolean  │
│ + incrementEnrolled(): void    │
│ + decrementEnrolled(): void    │
│ + activate(): void       │
│ + deactivate(): void     │
│ + isFull(): Boolean      │
└──────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                            ENUMERATIONS                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│      UserRole            │         │   EnrollmentStatus       │
├──────────────────────────┤         ├──────────────────────────┤
│ • ADMIN                  │         │ • PENDING                │
│ • INSTRUCTOR             │         │ • APPROVED               │
│ • STUDENT                │         │ • REJECTED               │
└──────────────────────────┘         │ • COMPLETED              │
                                     │ • CANCELLED              │
                                     └──────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION SERVICES                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┐
│         AuthService                  │
├──────────────────────────────────────┤
│ - usersRepository: Repository<User>  │
│ - jwtService: JwtService             │
│ - redisService: RedisService         │
├──────────────────────────────────────┤
│ + login(email, password): Promise<AuthResponse>     │
│ + register(dto: RegisterDto): Promise<User>         │
│ + validateUser(email, password): Promise<User>      │
│ + generateToken(user: User): String                 │
│ + validateToken(token: String): Promise<User>       │
│ + logout(userId: UUID): Promise<void>               │
│ + refreshToken(token: String): Promise<AuthResponse>│
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│         UsersService                 │
├──────────────────────────────────────┤
│ - usersRepository: Repository<User>  │
├──────────────────────────────────────┤
│ + create(dto: CreateUserDto): Promise<User>         │
│ + findAll(filters: UserFilters): Promise<User[]>    │
│ + findOne(id: UUID): Promise<User>                  │
│ + update(id: UUID, dto: UpdateUserDto): Promise<User>│
│ + remove(id: UUID): Promise<void>                   │
│ + changeRole(id: UUID, role: UserRole): Promise<User>│
│ + activate(id: UUID): Promise<User>                 │
│ + deactivate(id: UUID): Promise<User>               │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│       ProgramsService                │
├──────────────────────────────────────┤
│ - programsRepository: Repository<Program> │
├──────────────────────────────────────┤
│ + create(dto: CreateProgramDto): Promise<Program>   │
│ + findAll(filters: ProgramFilters): Promise<Program[]>│
│ + findOne(id: UUID): Promise<Program>               │
│ + update(id: UUID, dto: UpdateProgramDto): Promise<Program>│
│ + remove(id: UUID): Promise<void>                   │
│ + activate(id: UUID): Promise<Program>              │
│ + deactivate(id: UUID): Promise<Program>            │
│ + getAvailablePrograms(): Promise<Program[]>        │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│      EnrollmentsService              │
├──────────────────────────────────────┤
│ - enrollmentsRepository: Repository<Enrollment>     │
│ - programsService: ProgramsService   │
│ - usersService: UsersService         │
├──────────────────────────────────────┤
│ + create(dto: CreateEnrollmentDto): Promise<Enrollment>│
│ + findAll(filters: EnrollmentFilters): Promise<Enrollment[]>│
│ + findOne(id: UUID): Promise<Enrollment>            │
│ + approve(id: UUID): Promise<Enrollment>            │
│ + reject(id: UUID): Promise<Enrollment>             │
│ + cancel(id: UUID): Promise<Enrollment>             │
│ + complete(id: UUID): Promise<Enrollment>           │
│ + getUserEnrollments(userId: UUID): Promise<Enrollment[]>│
│ + getProgramEnrollments(programId: UUID): Promise<Enrollment[]>│
└──────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                            RELATIONSHIPS                                     │
└─────────────────────────────────────────────────────────────────────────────┘

User (1) ──────────── has ──────────── (0..*) Enrollment
                                                    │
                                                    │ belongs to
                                                    │
                                                    ▼
Program (1) ──────── has ──────────── (0..*) Enrollment

User ──────────── has ──────────── (1) UserRole

Enrollment ──────── has ──────────── (1) EnrollmentStatus

AuthService ──────── uses ──────────── User
UsersService ──────── uses ──────────── User
ProgramsService ──────── uses ──────────── Program
EnrollmentsService ──────── uses ──────────── Enrollment
EnrollmentsService ──────── depends on ──────────── ProgramsService
EnrollmentsService ──────── depends on ──────────── UsersService
```

**Métodos de Negocio Clave:**

**User Entity:**
- `hasRole(role)`: Verifica si el usuario tiene un rol específico
- `comparePassword(plain)`: Compara contraseña en texto plano con hash
- `getFullName()`: Retorna nombre completo del usuario

**Program Entity:**
- `hasAvailableSlots()`: Verifica si hay cupos disponibles (enrolledCount < capacity)
- `isEnrollmentOpen()`: Verifica si las inscripciones están abiertas (fecha actual entre startDate y endDate)
- `incrementEnrolled()`: Incrementa contador de inscritos
- `decrementEnrolled()`: Decrementa contador de inscritos
- `isFull()`: Verifica si el programa está lleno

**Enrollment Entity:**
- `canCancel()`: Verifica si la inscripción puede ser cancelada
- `approve()`: Aprueba la inscripción (cambia status a APPROVED)
- `reject()`: Rechaza la inscripción (cambia status a REJECTED)
- `complete()`: Marca la inscripción como completada
- `isPending()`: Verifica si está en estado PENDING
- `isActive()`: Verifica si está en estado APPROVED

---

## 3. PRINCIPIOS ARQUITECTÓNICOS

### 3.1 Monolito Modular

**¿Por qué Monolito Modular?**
- ✅ **Simplicidad operacional**: Un deployment, un proceso
- ✅ **Desarrollo rápido**: No hay latencia de red entre módulos
- ✅ **Testing integrado**: Fácil probar flujos completos
- ✅ **Transacciones ACID**: Base de datos única
- ✅ **Escalable**: Preparado para extraer microservicios después

**Módulos Independientes:**
```
backend/src/modules/
├── auth/           # Autenticación y autorización
├── programs/       # Gestión de cursos/programas
├── users/          # Gestión de usuarios
└── enrollments/    # Inscripciones usuario-curso
```

Cada módulo tiene:
- **Controllers**: Endpoints REST
- **Services**: Lógica de negocio
- **Entities**: Modelos de dominio
- **DTOs**: Validación de datos
- **Repositories**: Acceso a datos

### 3.2 Arquitectura Hexagonal (Ports & Adapters)

```
┌─────────────────────────────────────────────────────────────┐
│                   HEXAGONAL ARCHITECTURE                     │
│                                                               │
│                    ┌──────────────────┐                      │
│                    │   PRESENTATION   │  Controllers/Resolvers│
│                    │      LAYER       │  (Inbound Adapters) │
│                    └────────┬─────────┘                      │
│                             │                                 │
│                    ┌────────▼─────────┐                      │
│                    │   APPLICATION    │  Use Cases/Services │
│                    │      LAYER       │  (Business Logic)   │
│                    └────────┬─────────┘                      │
│                             │                                 │
│          ┌──────────────────┼──────────────────┐            │
│          │                  │                   │            │
│    ┌─────▼─────┐    ┌──────▼──────┐    ┌──────▼──────┐    │
│    │  DOMAIN   │    │   DOMAIN    │    │   DOMAIN    │    │
│    │  ENTITIES │    │  SERVICES   │    │   EVENTS    │    │
│    └───────────┘    └─────────────┘    └─────────────┘    │
│          │                  │                   │            │
│          └──────────────────┼──────────────────┘            │
│                             │                                 │
│                    ┌────────▼─────────┐                      │
│                    │ INFRASTRUCTURE   │  Repositories       │
│                    │      LAYER       │  (Outbound Adapters)│
│                    └────────┬─────────┘                      │
│                             │                                 │
│                    ┌────────▼─────────┐                      │
│                    │    DATABASE      │  PostgreSQL         │
│                    └──────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

**Beneficios:**
- 🔌 **Ports (Interfaces)**: Contratos claros entre capas
- 🔧 **Adapters**: Implementaciones intercambiables (TypeORM ↔ Prisma)
- 🧪 **Testeable**: Mock de infraestructura fácil
- 🎯 **Independencia**: El core no depende de frameworks

### 3.3 SOLID Principles

**S - Single Responsibility:**
- Cada clase tiene una única responsabilidad
- `CreateProgramUseCase` solo se encarga de crear programas
- `AuthService` solo maneja autenticación

**O - Open/Closed:**
- Abierto para extensión, cerrado para modificación
- Nuevos roles se agregan sin modificar código existente

**L - Liskov Substitution:**
- Las implementaciones pueden ser sustituidas
- `TypeORMRepository` puede ser reemplazado por `PrismaRepository`

**I - Interface Segregation:**
- Interfaces específicas en lugar de generales
- `IAuthService`, `IUsersService` separados

**D - Dependency Inversion:**
- Dependencias de abstracciones, no de concreciones
- Services dependen de interfaces de repositorios

---

## 4. STACK TECNOLÓGICO

### 4.1 Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | 10.x | Framework backend principal |
| **TypeScript** | 5.x | Lenguaje de programación |
| **TypeORM** | 0.3.x | ORM para PostgreSQL |
| **PostgreSQL** | 16 | Base de datos relacional |
| **Redis** | 7.x | Cache y sesiones |
| **Passport JWT** | Latest | Autenticación JWT |
| **class-validator** | Latest | Validación de DTOs |
| **Jest** | 29.x | Testing framework |
| **Swagger** | Latest | Documentación API |

### 4.2 Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 14.2 | Framework React con SSR |
| **React** | 18.3 | Librería UI |
| **Redux Toolkit** | 2.0 | State management |
| **Tailwind CSS** | 3.4 | Estilos utility-first |
| **React Hook Form** | Latest | Manejo de formularios |
| **Zod** | Latest | Validación de esquemas |
| **Axios** | Latest | Cliente HTTP |

### 4.3 DevOps

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Docker** | 24.x | Containerización |
| **Docker Compose** | 2.x | Orquestación local |
| **ESLint** | Latest | Linting |
| **Prettier** | Latest | Formateo de código |

---

## 5. ARQUITECTURA HEXAGONAL DETALLADA

### 5.1 Capas de la Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │  Controllers   │  │   Resolvers    │  │     Guards     │   │
│  │   (REST API)   │  │   (GraphQL)    │  │  (Auth/RBAC)   │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Use Cases / Services                     │ │
│  │  - Orquestación de lógica de negocio                       │ │
│  │  - Coordinación entre dominio e infraestructura            │ │
│  │  - Transacciones                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Core Business Logic                        │ │
│  │  - Entities (User, Program, Enrollment)                    │ │
│  │  - Value Objects                                            │ │
│  │  - Domain Services                                          │ │
│  │  - Business Rules                                           │ │
│  │  - Domain Events                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                            │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │  Repositories  │  │  Cache Service │  │ Email Service  │   │
│  │   (TypeORM)    │  │    (Redis)     │  │                │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
                        ┌───────────────┐
                        │   PostgreSQL  │
                        │     Redis     │
                        └───────────────┘
```

### 5.2 Flujo de Datos

```
Request (HTTP/GraphQL)
         │
         ▼
┌─────────────────┐
│   Controller    │  ◄── Presentation Layer
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Guard       │  ◄── Authentication & Authorization
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Service      │  ◄── Application Layer
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Entity      │  ◄── Domain Layer
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │  ◄── Infrastructure Layer
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Database     │  ◄── Data Layer
└─────────────────┘
```

---

## 6. MODELO DE DATOS

### 6.1 Esquema de Base de Datos

```
┌──────────────────────────────────────────────────────────────────┐
│                         USERS TABLE                               │
├──────────────────────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                                  │
│ email           VARCHAR(255) UNIQUE NOT NULL                      │
│ password        VARCHAR(255) NOT NULL                             │
│ first_name      VARCHAR(100) NOT NULL                             │
│ last_name       VARCHAR(100) NOT NULL                             │
│ role            ENUM('ADMIN','INSTRUCTOR','STUDENT') NOT NULL     │
│ is_active       BOOLEAN DEFAULT true                              │
│ created_at      TIMESTAMP DEFAULT NOW()                           │
│ updated_at      TIMESTAMP DEFAULT NOW()                           │
└──────────────────────────────────────────────────────────────────┘
                                │
                                │ 1
                                │
                                │ has
                                │
                                │ 0..*
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      ENROLLMENTS TABLE                            │
├──────────────────────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                                  │
│ user_id         UUID FOREIGN KEY → users(id)                      │
│ program_id      UUID FOREIGN KEY → programs(id)                   │
│ status          ENUM('PENDING','APPROVED','REJECTED',             │
│                      'COMPLETED','CANCELLED') NOT NULL            │
│ enrolled_at     TIMESTAMP DEFAULT NOW()                           │
│ completed_at    TIMESTAMP NULL                                    │
│ cancelled_at    TIMESTAMP NULL                                    │
└──────────────────────────────────────────────────────────────────┘
                                │
                                │ belongs to
                                │
                                │ 1
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                       PROGRAMS TABLE                              │
├──────────────────────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                                  │
│ name            VARCHAR(255) NOT NULL                             │
│ description     TEXT                                              │
│ category        VARCHAR(100)                                      │
│ capacity        INTEGER NOT NULL                                  │
│ enrolled_count  INTEGER DEFAULT 0                                 │
│ start_date      DATE NOT NULL                                     │
│ end_date        DATE NOT NULL                                     │
│ is_active       BOOLEAN DEFAULT true                              │
│ created_at      TIMESTAMP DEFAULT NOW()                           │
│ updated_at      TIMESTAMP DEFAULT NOW()                           │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Índices y Constraints

**Índices:**
- `users`: `idx_users_email`, `idx_users_role`
- `programs`: `idx_programs_category`, `idx_programs_dates`, `idx_programs_active`
- `enrollments`: `idx_enrollments_user`, `idx_enrollments_program`, `idx_enrollments_status`

**Constraints:**
- `users.email`: UNIQUE
- `enrollments`: UNIQUE(user_id, program_id) - Un usuario no puede inscribirse dos veces al mismo programa
- `programs.capacity`: CHECK (capacity > 0)
- `programs.dates`: CHECK (end_date > start_date)

**Triggers:**
- `update_enrolled_count`: Actualiza `enrolled_count` cuando se crea/cancela una inscripción
- `update_timestamps`: Actualiza `updated_at` en cada modificación

---

## 7. ESTRATEGIA DE ESCALABILIDAD

### 7.1 Escalabilidad Horizontal

**Actual (Monolito):**
```
Load Balancer
      │
      ├──► NestJS Instance 1
      ├──► NestJS Instance 2
      └──► NestJS Instance N
              │
              ▼
         PostgreSQL (Master + Replicas)
```

**Futuro (Microservicios):**
```
API Gateway
      │
      ├──► Auth Service (N instances)
      ├──► Users Service (N instances)
      ├──► Programs Service (N instances)
      └──► Enrollments Service (N instances)
              │
              ▼
         Database per Service
```

### 7.2 Optimizaciones de Performance

**Cache Strategy:**
- ✅ Redis para sesiones de usuario (TTL: 24h)
- ✅ Cache de programas activos (TTL: 5 min)
- ✅ Cache de listas de usuarios (TTL: 10 min)

**Database Optimizations:**
- ✅ Índices en columnas frecuentemente consultadas
- ✅ Read replicas para consultas
- ✅ Connection pooling
- ✅ Query optimization

**API Optimizations:**
- ✅ Paginación en todas las listas
- ✅ Rate limiting (100 req/min por IP)
- ✅ Compression (gzip)
- ✅ CDN para assets estáticos

---

## 📊 RESUMEN

Este documento presenta la arquitectura completa del MVP de Sistema de Gestión de Cursos, implementado como un **Monolito Modular con Arquitectura Hexagonal**, listo para escalar a microservicios cuando sea necesario.

**Características clave:**
- ✅ Diagramas UML completos (Casos de Uso, Secuencia, Componentes, Clases, Despliegue)
- ✅ Arquitectura Hexagonal con separación clara de capas
- ✅ Modelo de dominio robusto con reglas de negocio
- ✅ Estrategia de migración a microservicios bien definida
- ✅ Stack tecnológico moderno y escalable
- ✅ Optimizaciones de performance implementadas

**Próximos pasos:**
1. Implementar monitoreo y logging en producción
2. Agregar métricas de performance
3. Implementar CI/CD completo
4. Evaluar migración a microservicios según métricas de uso

---

**Versión:** 1.0.0
**Última actualización:** 2025-11-07
**Mantenido por:** Equipo de Desarrollo Global Medicine Foundation


