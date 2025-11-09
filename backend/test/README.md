# 📚 Guía de Tests - Backend

## 📖 Índice

1. [Introducción](#introducción)
2. [Estructura de Tests](#estructura-de-tests)
3. [Comandos de Ejecución](#comandos-de-ejecución)
4. [Configuración de Cobertura](#configuración-de-cobertura)
5. [Escribir Tests](#escribir-tests)
6. [Checklist de Tests](#checklist-de-tests)
7. [Depuración de Tests](#depuración-de-tests)

---

## 🎯 Introducción

Este proyecto utiliza **Jest** como framework de testing junto con las utilidades de testing de **NestJS**. Los tests están organizados en dos categorías principales:

- **Tests Unitarios (Unit Tests)**: Prueban componentes individuales de forma aislada
- **Tests de Integración E2E (End-to-End)**: Prueban el flujo completo de la aplicación

---

## 📁 Estructura de Tests

```
backend/
├── src/
│   └── modules/
│       ├── auth/
│       │   └── auth.service.spec.ts          # Tests unitarios de AuthService
│       ├── users/
│       │   └── users.service.spec.ts         # Tests unitarios de UsersService
│       ├── programs/
│       │   └── programs.service.spec.ts      # Tests unitarios de ProgramsService
│       └── enrollments/
│           └── enrollments.service.spec.ts   # Tests unitarios de EnrollmentsService
└── test/
    ├── auth.e2e-spec.ts                      # Tests E2E de autenticación
    ├── users.e2e-spec.ts                     # Tests E2E de usuarios
    ├── programs.e2e-spec.ts                  # Tests E2E de programas
    ├── enrollments.e2e-spec.ts               # Tests E2E de inscripciones
    ├── jest-e2e.json                         # Configuración de Jest para E2E
    └── README.md                             # Esta guía
```

---

## 🚀 Comandos de Ejecución

### Tests Unitarios

```bash
# Ejecutar todos los tests unitarios
npm test

# Ejecutar tests en modo watch (desarrollo)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:cov

# Ejecutar un archivo específico
npm test -- auth.service.spec.ts

# Ejecutar tests con modo verbose
npm test -- --verbose
```

### Tests E2E

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar un archivo E2E específico
npm run test:e2e -- auth.e2e-spec.ts

# Ejecutar tests E2E con modo verbose
npm run test:e2e -- --verbose
```

### Depuración

```bash
# Ejecutar tests en modo debug
npm run test:debug

# Luego abrir chrome://inspect en Chrome
# y conectar al proceso de Node.js
```

---

## 📊 Configuración de Cobertura

### Objetivos de Cobertura

El proyecto está configurado para mantener los siguientes niveles mínimos de cobertura:

- **Líneas (Lines)**: > 80%
- **Funciones (Functions)**: > 80%
- **Ramas (Branches)**: > 75%
- **Statements**: > 80%

### Archivos Excluidos de Cobertura

Los siguientes archivos están excluidos del reporte de cobertura:

- `**/*.module.ts` - Módulos de NestJS
- `**/*.dto.ts` - Data Transfer Objects
- `**/*.entity.ts` - Entidades de TypeORM
- `**/*.interface.ts` - Interfaces de TypeScript
- `**/main.ts` - Archivo de entrada de la aplicación
- `**/migrations/**` - Migraciones de base de datos

### Ver Reporte de Cobertura

```bash
# Generar reporte de cobertura
npm run test:cov

# El reporte HTML se genera en: coverage/lcov-report/index.html
# Abrir en el navegador para ver detalles
```

---

## ✍️ Escribir Tests

### Patrón AAA (Arrange-Act-Assert)

Todos los tests deben seguir el patrón AAA:

```typescript
it('debería crear un nuevo usuario exitosamente', async () => {
  // Arrange (Preparar)
  const createUserDto = {
    email: 'test@example.com',
    password: 'Password123!',
    fullName: 'Usuario de Prueba',
    role: UserRole.STUDENT,
  };
  mockRepository.findOne.mockResolvedValue(null);
  mockRepository.save.mockResolvedValue(mockUser);

  // Act (Actuar)
  const result = await service.create(createUserDto);

  // Assert (Afirmar)
  expect(result).toEqual(mockUser);
  expect(mockRepository.save).toHaveBeenCalled();
});
```

### Tests Unitarios

#### Estructura Básica

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MiServicio } from './mi-servicio.service';

describe('MiServicio', () => {
  let service: MiServicio;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MiServicio],
    }).compile();

    service = module.get<MiServicio>(MiServicio);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('miMetodo', () => {
    it('debería retornar el resultado esperado', () => {
      // Test implementation
    });
  });
});
```

#### Mocking de Dependencias

```typescript
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      MiServicio,
      {
        provide: getRepositoryToken(MiEntidad),
        useValue: mockRepository,
      },
    ],
  }).compile();

  service = module.get<MiServicio>(MiServicio);
  
  // Limpiar mocks antes de cada test
  jest.clearAllMocks();
});
```

### Tests E2E

#### Estructura Básica

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MiController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Aplicar pipes globales
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/mi-endpoint (GET)', () => {
    return request(app.getHttpServer())
      .get('/mi-endpoint')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
      });
  });
});
```

#### Autenticación en Tests E2E

```typescript
let accessToken: string;

beforeAll(async () => {
  // Registrar usuario
  await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'Usuario de Prueba',
      role: UserRole.ADMIN,
    });

  // Obtener token
  const loginRes = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: 'test@example.com',
      password: 'Password123!',
    });

  accessToken = loginRes.body.accessToken;
});

it('debería acceder a endpoint protegido', () => {
  return request(app.getHttpServer())
    .get('/endpoint-protegido')
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(200);
});
```

---

## ✅ Checklist de Tests

### Para Cada Servicio

- [ ] Test de definición del servicio
- [ ] Tests de métodos CRUD (create, read, update, delete)
- [ ] Tests de casos de éxito
- [ ] Tests de casos de error (NotFoundException, ConflictException, etc.)
- [ ] Tests de validaciones de negocio
- [ ] Tests de filtros y búsquedas
- [ ] Mocks de todas las dependencias
- [ ] Limpieza de mocks en `beforeEach`

### Para Cada Endpoint E2E

- [ ] Test de caso de éxito (200, 201)
- [ ] Test sin autenticación (401)
- [ ] Test con permisos insuficientes (403)
- [ ] Test con datos inválidos (400)
- [ ] Test con recursos no encontrados (404)
- [ ] Test de validaciones de DTOs
- [ ] Test de seguridad (no exponer contraseñas, etc.)
- [ ] Test de filtros y paginación

---

## 🐛 Depuración de Tests

### Ejecutar un Solo Test

```typescript
// Usar .only para ejecutar solo este test
it.only('debería ejecutar solo este test', () => {
  // ...
});

// Usar .skip para saltar este test
it.skip('debería saltar este test', () => {
  // ...
});
```

### Ver Salida Detallada

```bash
# Ejecutar con modo verbose
npm test -- --verbose

# Ver todos los console.log
npm test -- --silent=false
```

### Depurar con VSCode

Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Errores Comunes

#### 1. "Cannot find module"

**Solución**: Verificar que todas las dependencias estén instaladas

```bash
npm install
```

#### 2. "Timeout exceeded"

**Solución**: Aumentar el timeout en el test

```typescript
it('test que tarda mucho', async () => {
  // ...
}, 10000); // 10 segundos
```

#### 3. "Database connection error" en E2E

**Solución**: Asegurarse de que la base de datos de prueba esté configurada correctamente en `.env.test`

---

## 📚 Recursos Adicionales

- [Documentación de Jest](https://jestjs.io/docs/getting-started)
- [Documentación de NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Última actualización**: 2025-01-09

