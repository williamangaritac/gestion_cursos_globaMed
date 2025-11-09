import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/modules/users/domain/entities/user.entity';
import { ProgramStatus } from '../src/modules/programs/domain/entities/program.entity';

describe('ProgramsController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;
  let createdProgramId: string;
  let instructorId: string;

  const adminUser = {
    email: `admin-prog-${Date.now()}@example.com`,
    password: 'AdminPass123!',
    fullName: 'Admin Programs E2E',
    role: UserRole.ADMIN,
  };

  const instructorUser = {
    email: `instructor-prog-${Date.now()}@example.com`,
    password: 'InstructorPass123!',
    fullName: 'Instructor Programs E2E',
    role: UserRole.INSTRUCTOR,
  };

  const studentUser = {
    email: `student-prog-${Date.now()}@example.com`,
    password: 'StudentPass123!',
    fullName: 'Student Programs E2E',
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

    // Registrar usuarios y obtener tokens
    await request(app.getHttpServer()).post('/auth/register').send(adminUser);
    const adminLoginRes = await request(app.getHttpServer()).post('/auth/login').send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLoginRes.body.accessToken;

    const instructorRegRes = await request(app.getHttpServer()).post('/auth/register').send(instructorUser);
    instructorId = instructorRegRes.body.user.id;
    const instructorLoginRes = await request(app.getHttpServer()).post('/auth/login').send({ email: instructorUser.email, password: instructorUser.password });
    instructorToken = instructorLoginRes.body.accessToken;

    await request(app.getHttpServer()).post('/auth/register').send(studentUser);
    const studentLoginRes = await request(app.getHttpServer()).post('/auth/login').send({ email: studentUser.email, password: studentUser.password });
    studentToken = studentLoginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/programs (GET)', () => {
    it('debería retornar todos los programas para usuarios autenticados', () => {
      return request(app.getHttpServer())
        .get('/programs')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('debería fallar sin autenticación', () => {
      return request(app.getHttpServer())
        .get('/programs')
        .expect(401);
    });

    it('debería filtrar programas por estado', () => {
      return request(app.getHttpServer())
        .get(`/programs?status=${ProgramStatus.ACTIVE}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    });

    it('debería buscar programas por título', () => {
      return request(app.getHttpServer())
        .get('/programs?search=Test')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    });
  });

  describe('/programs (POST)', () => {
    const newProgram = {
      title: 'Programa de Prueba E2E',
      description: 'Este es un programa de prueba para E2E testing',
      status: ProgramStatus.DRAFT,
      capacity: 30,
      duration: 8,
      startDate: new Date('2024-06-01').toISOString(),
      endDate: new Date('2024-08-01').toISOString(),
    };

    it('debería crear un nuevo programa como admin', () => {
      return request(app.getHttpServer())
        .post('/programs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...newProgram, instructorId: instructorId })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(newProgram.title);
          expect(res.body.currentStudents).toBe(0);
          createdProgramId = res.body.id;
        });
    });

    it('debería crear un nuevo programa como instructor', () => {
      return request(app.getHttpServer())
        .post('/programs')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ ...newProgram, title: 'Programa Instructor E2E', instructorId: instructorId })
        .expect(201);
    });

    it('debería fallar al crear programa como estudiante', () => {
      return request(app.getHttpServer())
        .post('/programs')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ ...newProgram, instructorId: instructorId })
        .expect(403);
    });

    it('debería fallar con campos faltantes', () => {
      return request(app.getHttpServer())
        .post('/programs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Programa Incompleto' })
        .expect(400);
    });

    it('debería fallar con capacidad inválida', () => {
      return request(app.getHttpServer())
        .post('/programs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...newProgram, capacity: -5, instructorId: instructorId })
        .expect(400);
    });

    it('debería fallar con fechas inválidas', () => {
      return request(app.getHttpServer())
        .post('/programs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...newProgram,
          startDate: new Date('2024-08-01').toISOString(),
          endDate: new Date('2024-06-01').toISOString(),
          instructorId: instructorId,
        })
        .expect(400);
    });
  });

  describe('/programs/:id (GET)', () => {
    it('debería retornar un programa específico por id', () => {
      return request(app.getHttpServer())
        .get(`/programs/${createdProgramId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdProgramId);
          expect(res.body).toHaveProperty('instructor');
        });
    });

    it('debería fallar con UUID inválido', () => {
      return request(app.getHttpServer())
        .get('/programs/invalid-uuid')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);
    });

    it('debería fallar con id no existente', () => {
      return request(app.getHttpServer())
        .get('/programs/123e4567-e89b-12d3-a456-426614174999')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });
  });

  describe('/programs/:id (PATCH)', () => {
    it('debería actualizar programa como admin', () => {
      return request(app.getHttpServer())
        .patch(`/programs/${createdProgramId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Título Actualizado', status: ProgramStatus.PUBLISHED })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Título Actualizado');
          expect(res.body.status).toBe(ProgramStatus.PUBLISHED);
        });
    });

    it('debería actualizar programa como instructor', () => {
      return request(app.getHttpServer())
        .patch(`/programs/${createdProgramId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ description: 'Descripción actualizada por instructor' })
        .expect(200);
    });

    it('debería fallar al actualizar como estudiante', () => {
      return request(app.getHttpServer())
        .patch(`/programs/${createdProgramId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Título Hackeado' })
        .expect(403);
    });

    it('debería actualizar capacidad', () => {
      return request(app.getHttpServer())
        .patch(`/programs/${createdProgramId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ capacity: 50 })
        .expect(200)
        .expect((res) => {
          expect(res.body.capacity).toBe(50);
        });
    });
  });

  describe('/programs/:id (DELETE)', () => {
    let programToDelete: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/programs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Programa a Eliminar',
          description: 'Este programa será eliminado',
          status: ProgramStatus.DRAFT,
          capacity: 20,
          duration: 4,
          startDate: new Date('2024-09-01').toISOString(),
          endDate: new Date('2024-10-01').toISOString(),
          instructorId: instructorId,
        });
      programToDelete = res.body.id;
    });

    it('debería fallar al eliminar como estudiante', () => {
      return request(app.getHttpServer())
        .delete(`/programs/${programToDelete}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('debería fallar al eliminar como instructor', () => {
      return request(app.getHttpServer())
        .delete(`/programs/${programToDelete}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(403);
    });

    it('debería eliminar programa como admin', () => {
      return request(app.getHttpServer())
        .delete(`/programs/${programToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Capacidad y estudiantes del programa', () => {
    it('debería mostrar el conteo de estudiantes actuales', () => {
      return request(app.getHttpServer())
        .get(`/programs/${createdProgramId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('currentStudents');
          expect(res.body).toHaveProperty('capacity');
          expect(typeof res.body.currentStudents).toBe('number');
          expect(typeof res.body.capacity).toBe('number');
        });
    });
  });
});

