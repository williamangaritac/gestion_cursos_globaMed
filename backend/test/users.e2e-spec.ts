import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/modules/users/domain/entities/user.entity';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let studentToken: string;
  let createdUserId: string;

  const adminUser = {
    email: `admin-users-${Date.now()}@example.com`,
    password: 'AdminPass123!',
    fullName: 'Admin Users E2E',
    role: UserRole.ADMIN,
  };

  const studentUser = {
    email: `student-users-${Date.now()}@example.com`,
    password: 'StudentPass123!',
    fullName: 'Student Users E2E',
    role: UserRole.STUDENT,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Registrar y obtener token de admin
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(adminUser);

    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password,
      });

    adminToken = adminLoginRes.body.accessToken;

    // Registrar y obtener token de estudiante
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(studentUser);

    const studentLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: studentUser.email,
        password: studentUser.password,
      });

    studentToken = studentLoginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (GET)', () => {
    it('debería obtener todos los usuarios como admin', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('debería fallar sin autenticación', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });

    it('debería fallar para usuarios no admin', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('debería filtrar usuarios por rol', () => {
      return request(app.getHttpServer())
        .get(`/users?role=${UserRole.ADMIN}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('debería filtrar usuarios por estado', () => {
      return request(app.getHttpServer())
        .get('/users?status=ACTIVE')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/users (POST)', () => {
    const newUser = {
      email: `newuser-${Date.now()}@example.com`,
      password: 'NewUserPass123!',
      fullName: 'Nuevo Usuario E2E',
      role: UserRole.INSTRUCTOR,
    };

    it('debería crear un nuevo usuario como admin', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(newUser.email);
          expect(res.body).not.toHaveProperty('password');
          
          createdUserId = res.body.id;
        });
    });

    it('debería fallar al crear sin rol admin', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          ...newUser,
          email: `another-${Date.now()}@example.com`,
        })
        .expect(403);
    });

    it('debería fallar con email duplicado', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect(409);
    });

    it('debería fallar con email inválido', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...newUser,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('debería fallar con contraseña débil', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...newUser,
          email: `weak-${Date.now()}@example.com`,
          password: '123',
        })
        .expect(400);
    });

    it('debería fallar con campos faltantes', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: `missing-${Date.now()}@example.com`,
        })
        .expect(400);
    });
  });

  describe('/users/:id (GET)', () => {
    it('debería obtener un usuario específico por ID', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdUserId);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('debería fallar con UUID inválido', () => {
      return request(app.getHttpServer())
        .get('/users/invalid-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('debería fallar con ID no existente', () => {
      return request(app.getHttpServer())
        .get('/users/123e4567-e89b-12d3-a456-426614174999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('debería actualizar un usuario como admin', () => {
      return request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Nombre Actualizado',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.fullName).toBe('Nombre Actualizado');
        });
    });

    it('debería actualizar el estado del usuario', () => {
      return request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'INACTIVE',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('INACTIVE');
        });
    });

    it('debería fallar con estado inválido', () => {
      return request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'INVALID_STATUS',
        })
        .expect(400);
    });

    it('debería fallar al actualizar sin rol admin', () => {
      return request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          fullName: 'Intento de Hackeo',
        })
        .expect(403);
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('debería fallar al eliminar sin rol admin', () => {
      return request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('debería eliminar un usuario como admin', () => {
      return request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('debería fallar al eliminar usuario no existente', () => {
      return request(app.getHttpServer())
        .delete('/users/123e4567-e89b-12d3-a456-426614174999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('Validaciones de seguridad', () => {
    it('nunca debería retornar la contraseña en las respuestas', async () => {
      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      res.body.forEach((user) => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('debería hashear la contraseña al crear usuario', async () => {
      const testUser = {
        email: `hash-test-${Date.now()}@example.com`,
        password: 'PlainPassword123!',
        fullName: 'Hash Test User',
        role: UserRole.STUDENT,
      };

      const res = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testUser)
        .expect(201);

      expect(res.body).not.toHaveProperty('password');
    });
  });
});

