# 📊 Database Scripts - Course Management System

Este directorio contiene todos los scripts SQL necesarios para inicializar y gestionar la base de datos PostgreSQL del sistema de gestión de cursos.

## 📁 Estructura de Archivos

```
database/
├── README.md                    # Este archivo
├── 01-schema.sql               # Esquema de base de datos (tablas, índices, triggers)
├── 02-seed-users.sql           # Datos iniciales de usuarios
├── 03-seed-programs.sql        # Datos iniciales de programas
└── 04-additional-programs.sql  # Programas adicionales (opcional)
```

## 🚀 Orden de Ejecución

Para inicializar la base de datos desde cero, ejecuta los scripts en el siguiente orden:

### 1. Crear el Esquema
```bash
docker exec -i course-management-db psql -U postgres -d course_management < database/01-schema.sql
```

### 2. Insertar Usuarios Iniciales
```bash
docker exec -i course-management-db psql -U postgres -d course_management < database/02-seed-users.sql
```

### 3. Insertar Programas Iniciales
```bash
docker exec -i course-management-db psql -U postgres -d course_management < database/03-seed-programs.sql
```

### 4. (Opcional) Insertar Programas Adicionales
```bash
docker exec -i course-management-db psql -U postgres -d course_management < database/04-additional-programs.sql
```

## 👥 Usuarios por Defecto

El sistema incluye los siguientes usuarios de prueba:

| Rol | Email | Password | Nombre |
|-----|-------|----------|--------|
| **ADMIN** | admin@example.com | Admin123! | System Administrator |
| **INSTRUCTOR** | instructor@example.com | Instructor123! | John Instructor |
| **STUDENT** | student1@example.com | Student123! | Alice Student |
| **STUDENT** | student2@example.com | Student123! | Bob Student |

> ⚠️ **IMPORTANTE**: Cambia estas contraseñas en producción.

## 📚 Programas Iniciales

### Programas Base (03-seed-programs.sql)
1. **Introduction to Web Development** (ACTIVE)
2. **Advanced React.js** (PUBLISHED)
3. **Backend with Node.js and NestJS** (DRAFT)

### Programas Adicionales (04-additional-programs.sql)
4. **Full Stack Development with MERN** (ACTIVE)
5. **Python for Data Science** (ACTIVE)
6. **Mobile Development with React Native** (ACTIVE)
7. **DevOps and Cloud Computing** (ACTIVE)
8. **Cybersecurity Fundamentals** (PUBLISHED)

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### `users`
- Almacena información de usuarios (admin, instructores, estudiantes)
- Incluye autenticación (password_hash, refresh_token)
- Soft delete (deleted_at)

#### `programs`
- Programas/cursos disponibles
- Estados: DRAFT, PUBLISHED, ACTIVE, COMPLETED, ARCHIVED
- Control de capacidad (max_students, current_students)

#### `enrollments`
- Inscripciones de estudiantes en programas
- Estados: PENDING, ACTIVE, COMPLETED, DROPPED
- Seguimiento de progreso (0-100%)

### Tipos ENUM

```sql
user_role: ADMIN, INSTRUCTOR, STUDENT
user_status: ACTIVE, INACTIVE, SUSPENDED
program_status: DRAFT, PUBLISHED, ACTIVE, COMPLETED, ARCHIVED
enrollment_status: PENDING, ACTIVE, COMPLETED, DROPPED
```

### Triggers Automáticos

1. **update_updated_at**: Actualiza automáticamente el campo `updated_at`
2. **update_program_students_count**: Mantiene sincronizado el contador de estudiantes
3. **validate_enrollment_capacity**: Valida que no se exceda la capacidad del programa
4. **auto_complete_enrollment**: Marca como completado cuando el progreso llega a 100%

## 🔧 Comandos Útiles

### Verificar Usuarios
```bash
docker exec course-management-db psql -U postgres -d course_management -c "SELECT id, email, full_name, role, status FROM users ORDER BY created_at;"
```

### Verificar Programas
```bash
docker exec course-management-db psql -U postgres -d course_management -c "SELECT id, name, status, max_students, current_students FROM programs ORDER BY created_at;"
```

### Verificar Inscripciones
```bash
docker exec course-management-db psql -U postgres -d course_management -c "SELECT e.id, u.full_name, p.name, e.status, e.progress FROM enrollments e JOIN users u ON e.user_id = u.id JOIN programs p ON e.program_id = p.id ORDER BY e.enrolled_at DESC;"
```

### Resetear Base de Datos
```bash
# ⚠️ CUIDADO: Esto eliminará todos los datos
docker exec course-management-db psql -U postgres -d course_management -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Luego ejecuta los scripts en orden (1, 2, 3, 4)
```

## 📝 Notas Técnicas

### Extensiones PostgreSQL Requeridas
- `uuid-ossp`: Generación de UUIDs
- `pg_trgm`: Búsqueda de texto completo

### Índices de Rendimiento
- Índices en campos de búsqueda frecuente (email, role, status)
- Índices GIN para búsqueda full-text en nombres y descripciones
- Índices compuestos para consultas complejas

### Constraints y Validaciones
- Email único y formato válido
- Fechas válidas (end_date >= start_date)
- Capacidad de estudiantes (current_students <= max_students)
- Progreso entre 0 y 100%
- Unicidad de inscripción (user_id, program_id)

## 🔒 Seguridad

- Las contraseñas se almacenan hasheadas con bcrypt (10 rounds)
- Soft delete para mantener integridad referencial
- Validaciones a nivel de base de datos
- Constraints para prevenir datos inválidos

## 📊 Vistas Disponibles

### `v_active_programs_stats`
Vista con estadísticas de programas activos:
- Información del programa
- Porcentaje de capacidad utilizada
- Nombre del instructor
- Contadores de inscripciones por estado

```sql
SELECT * FROM v_active_programs_stats;
```

## 🆘 Troubleshooting

### Error: "relation already exists"
La tabla ya existe. Usa `DROP TABLE IF EXISTS` o resetea la base de datos.

### Error: "duplicate key value violates unique constraint"
Estás intentando insertar un registro con un ID o email que ya existe.

### Error: "Program is full"
El programa ha alcanzado su capacidad máxima. Aumenta `max_students` o elige otro programa.

---

**Versión**: 1.0.0  
**Base de Datos**: PostgreSQL 16  
**Última Actualización**: 2025-11-09

