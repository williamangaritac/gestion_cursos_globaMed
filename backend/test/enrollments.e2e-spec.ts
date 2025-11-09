import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/modules/users/domain/entities/user.entity';
import { ProgramStatus } from '../src/modules/programs/domain/entities/program.entity';
import { EnrollmentStatus } from '../src/modules/enrollments/domain/entities/enrollment.entity';

describe('EnrollmentsController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;
  let studentId: string;
  let programId: string;
  let enrollmentId: string;

  const adminUser = {
    email: `admin-enroll-${Date.now()}@example.com`,
    password: 'AdminPass123!',
    fullName: 'Admin Enrollments E2E',
    role: UserRole.ADMIN,
  };

  const instructorUser = {
    email: `instructor-enroll-${Date.now()}@example.com`,
    password: 'InstructorPass123!',
    fullName: 'Instructor Enrollments E2E',
    role: UserRole.INSTRUCTOR,
  };

  const studentUser = {
    email: `student-enroll-${Date.now()}@example.com`,
    password: 'StudentPass123!',
    fullName: 'Student Enrollments E2E',
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

    // Registrar usuarios
    await request(app.getHttpServer()).post('/auth/register').send(adminUser);
    const adminLoginRes = await request(app.getHttpServer()).post('/auth/login').send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLoginRes.body.accessToken;

    const instructorRegRes = await request(app.getHttpServer()).post('/auth/register').send(instructorUser);
    const instructorLoginRes = await request(app.getHttpServer()).post('/auth/login').send({ email: instructorUser.email, password: instructorUser.password });
    instructorToken = instructorLoginRes.body.accessToken;

    const studentRegRes = await request(app.getHttpServer()).post('/auth/register').send(studentUser);
    studentId = studentRegRes.body.user.id;
    const studentLoginRes = await request(app.getHttpServer()).post('/auth/login').send({ email: studentUser.email, password: studentUser.password });
    studentToken = studentLoginRes.body.accessToken;

    // Crear programa de prueba
    const programRes = await request(app.getHttpServer())
      .post('/programs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Programa de Prueba Inscripciones',
        description: 'Programa para probar inscripciones',
        status: ProgramStatus.ACTIVE,
        capacity: 30,
        duration: 8,
        startDate: new Date('2024-06-01').toISOString(),
        endDate: new Date('2024-08-01').toISOString(),
        instructorId: instructorRegRes.body.user.id,
      });
    programId = programRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/enrollments (GET)', () => {
    it('debería retornar todas las inscripciones para admin', () => {
      return request(app.getHttpServer())
        .get('/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('debería retornar todas las inscripciones para instructor', () => {
      return request(app.getHttpServer())
        .get('/enrollments')
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(200);
    });

    it('debería retornar solo inscripciones propias para estudiante', () => {
      return request(app.getHttpServer())
        .get('/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((enrollment) => {
            expect(enrollment.userId).toBe(studentId);
          });
        });
    });

    it('debería fallar sin autenticación', () => {
      return request(app.getHttpServer())
        .get('/enrollments')
        .expect(401);
    });

    it('debería filtrar inscripciones por estado', () => {
      return request(app.getHttpServer())
        .get(`/enrollments?status=${EnrollmentStatus.ACTIVE}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('debería filtrar inscripciones por programa', () => {
      return request(app.getHttpServer())
        .get(`/enrollments?programId=${programId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('/enrollments (POST)', () => {
    it('debería crear inscripción como admin', () => {
      return request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: studentId, programId: programId })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.userId).toBe(studentId);
          expect(res.body.programId).toBe(programId);
          expect(res.body.status).toBe(EnrollmentStatus.PENDING);
          expect(res.body.progress).toBe(0);
          enrollmentId = res.body.id;
        });
    });

    it('debería crear inscripción como instructor', async () => {
      const student2Res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `student2-${Date.now()}@example.com`,
          password: 'Student2Pass123!',
          fullName: 'Student 2 E2E',
          role: UserRole.STUDENT,
        });

      return request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ userId: student2Res.body.user.id, programId: programId })
        .expect(201);
    });

    it('debería fallar al crear inscripción duplicada', () => {
      return request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: studentId, programId: programId })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('already enrolled');
        });
    });

    it('debería fallar con usuario no existente', () => {
      return request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: '123e4567-e89b-12d3-a456-426614174999', programId: programId })
        .expect(404);
    });

    it('debería fallar con programa no existente', () => {
      return request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: studentId, programId: '123e4567-e89b-12d3-a456-426614174999' })
        .expect(404);
    });

    it('debería fallar con campos faltantes', () => {
      return request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: studentId })
        .expect(400);
    });

    it('debería fallar al inscribir en programa inactivo', async () => {
      const inactiveProgramRes = await request(app.getHttpServer())
        .post('/programs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Programa Inactivo',
          description: 'Este programa no está activo',
          status: ProgramStatus.DRAFT,
          capacity: 20,
          duration: 4,
          startDate: new Date('2024-09-01').toISOString(),
          endDate: new Date('2024-10-01').toISOString(),
          instructorId: studentId,
        });

      return request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: studentId, programId: inactiveProgramRes.body.id })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('not accepting enrollments');
        });
    });
  });

  describe('/enrollments/:id (GET)', () => {
    it('debería retornar inscripción específica', () => {
      return request(app.getHttpServer())
        .get(`/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(enrollmentId);
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('program');
        });
    });

    it('debería permitir al estudiante ver su propia inscripción', () => {
      return request(app.getHttpServer())
        .get(`/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    });

    it('debería fallar con UUID inválido', () => {
      return request(app.getHttpServer())
        .get('/enrollments/invalid-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('debería fallar con id no existente', () => {
      return request(app.getHttpServer())
        .get('/enrollments/123e4567-e89b-12d3-a456-426614174999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('/enrollments/:id (PATCH)', () => {
    it('debería actualizar progreso de inscripción como admin', () => {
      return request(app.getHttpServer())
        .patch(`/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ progress: 50, status: EnrollmentStatus.ACTIVE })
        .expect(200)
        .expect((res) => {
          expect(res.body.progress).toBe(50);
          expect(res.body.status).toBe(EnrollmentStatus.ACTIVE);
        });
    });

    it('debería actualizar inscripción como instructor', () => {
      return request(app.getHttpServer())
        .patch(`/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ progress: 75 })
        .expect(200)
        .expect((res) => {
          expect(res.body.progress).toBe(75);
        });
    });

    it('debería auto-completar cuando el progreso llega a 100', () => {
      return request(app.getHttpServer())
        .patch(`/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ progress: 100 })
        .expect(200)
        .expect((res) => {
          expect(res.body.progress).toBe(100);
          expect(res.body.status).toBe(EnrollmentStatus.COMPLETED);
          expect(res.body.completedAt).toBeDefined();
        });
    });

    it('debería fallar con valor de progreso inválido', () => {
      return request(app.getHttpServer())
        .patch(`/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ progress: 150 })
        .expect(400);
    });

    it('debería fallar al actualizar como estudiante', () => {
      return request(app.getHttpServer())
        .patch(`/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ progress: 90 })
        .expect(403);
    });
  });

  describe('/enrollments/:id (DELETE)', () => {
    let enrollmentToDelete: string;

    beforeAll(async () => {
      const studentRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `student-delete-${Date.now()}@example.com`,
          password: 'StudentPass123!',
          fullName: 'Student Delete E2E',
          role: UserRole.STUDENT,
        });

      const enrollRes = await request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: studentRes.body.user.id, programId: programId });

      enrollmentToDelete = enrollRes.body.id;
    });

    it('debería fallar al eliminar como estudiante', () => {
      return request(app.getHttpServer())
        .delete(`/enrollments/${enrollmentToDelete}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('debería eliminar inscripción como admin', () => {
      return request(app.getHttpServer())
        .delete(`/enrollments/${enrollmentToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('debería fallar al eliminar inscripción no existente', () => {
      return request(app.getHttpServer())
        .delete('/enrollments/123e4567-e89b-12d3-a456-426614174999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});

