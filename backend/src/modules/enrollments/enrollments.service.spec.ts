import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment, EnrollmentStatus } from './domain/entities/enrollment.entity';
import { ProgramsService } from '../programs/programs.service';
import { UsersService } from '../users/users.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { ProgramStatus } from '../programs/domain/entities/program.entity';
import { UserRole, UserStatus } from '../users/domain/entities/user.entity';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let repository: Repository<Enrollment>;
  let programsService: ProgramsService;
  let usersService: UsersService;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'student@example.com',
    fullName: 'Estudiante de Prueba',
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
  };

  const mockProgram = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    title: 'Programa de Prueba',
    status: ProgramStatus.ACTIVE,
    capacity: 30,
    currentStudents: 10,
  };

  const mockEnrollment: Enrollment = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    userId: mockUser.id,
    programId: mockProgram.id,
    status: EnrollmentStatus.PENDING,
    progress: 0,
    enrolledAt: new Date(),
    completedAt: null,
    user: null,
    program: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      getCount: jest.fn(),
    })),
  };

  const mockProgramsService = {
    findById: jest.fn(),
    hasAvailableCapacity: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        {
          provide: getRepositoryToken(Enrollment),
          useValue: mockRepository,
        },
        {
          provide: ProgramsService,
          useValue: mockProgramsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
    repository = module.get<Repository<Enrollment>>(getRepositoryToken(Enrollment));
    programsService = module.get<ProgramsService>(ProgramsService);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createEnrollmentDto: CreateEnrollmentDto = {
      userId: mockUser.id,
      programId: mockProgram.id,
    };

    it('debería crear una inscripción exitosamente', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockProgramsService.findById.mockResolvedValue(mockProgram);
      mockProgramsService.hasAvailableCapacity.mockResolvedValue(true);
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockEnrollment);
      mockRepository.save.mockResolvedValue(mockEnrollment);

      const result = await service.create(createEnrollmentDto);

      expect(result).toEqual(mockEnrollment);
      expect(mockUsersService.findById).toHaveBeenCalledWith(createEnrollmentDto.userId);
      expect(mockProgramsService.findById).toHaveBeenCalledWith(createEnrollmentDto.programId);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.create(createEnrollmentDto)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar NotFoundException si el programa no existe', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockProgramsService.findById.mockResolvedValue(null);

      await expect(service.create(createEnrollmentDto)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequestException si el programa no está activo', async () => {
      const inactiveProgram = { ...mockProgram, status: ProgramStatus.DRAFT };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockProgramsService.findById.mockResolvedValue(inactiveProgram);

      await expect(service.create(createEnrollmentDto)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException si el programa está lleno', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockProgramsService.findById.mockResolvedValue(mockProgram);
      mockProgramsService.hasAvailableCapacity.mockResolvedValue(false);

      await expect(service.create(createEnrollmentDto)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar ConflictException si ya existe una inscripción', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockProgramsService.findById.mockResolvedValue(mockProgram);
      mockProgramsService.hasAvailableCapacity.mockResolvedValue(true);
      mockRepository.findOne.mockResolvedValue(mockEnrollment);

      await expect(service.create(createEnrollmentDto)).rejects.toThrow(ConflictException);
    });

    it('debería establecer el estado inicial en PENDING', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockProgramsService.findById.mockResolvedValue(mockProgram);
      mockProgramsService.hasAvailableCapacity.mockResolvedValue(true);
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockEnrollment);
      mockRepository.save.mockResolvedValue(mockEnrollment);

      const result = await service.create(createEnrollmentDto);

      expect(result.status).toBe(EnrollmentStatus.PENDING);
    });
  });

  describe('findAll', () => {
    it('debería retornar un array de inscripciones', async () => {
      const enrollments = [mockEnrollment];
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(enrollments),
        getOne: jest.fn(),
        getCount: jest.fn(),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll({});

      expect(result).toEqual(enrollments);
    });

    it('debería aplicar filtros de usuario, programa y estado', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockEnrollment]),
        getOne: jest.fn(),
        getCount: jest.fn(),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findAll({
        userId: mockUser.id,
        programId: mockProgram.id,
        status: EnrollmentStatus.ACTIVE,
      });

      expect(queryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('debería retornar una inscripción por ID', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockEnrollment),
        andWhere: jest.fn(),
        getMany: jest.fn(),
        getCount: jest.fn(),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findById(mockEnrollment.id);

      expect(result).toEqual(mockEnrollment);
    });

    it('debería lanzar NotFoundException si la inscripción no existe', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
        andWhere: jest.fn(),
        getMany: jest.fn(),
        getCount: jest.fn(),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateEnrollmentDto: UpdateEnrollmentDto = {
      progress: 50,
      status: EnrollmentStatus.ACTIVE,
    };

    it('debería actualizar una inscripción exitosamente', async () => {
      const updatedEnrollment = { ...mockEnrollment, ...updateEnrollmentDto };
      mockRepository.findOne.mockResolvedValue(mockEnrollment);
      mockRepository.save.mockResolvedValue(updatedEnrollment);

      const result = await service.update(mockEnrollment.id, updateEnrollmentDto);

      expect(result).toEqual(updatedEnrollment);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debería auto-completar cuando el progreso llega a 100', async () => {
      const completeUpdate = { progress: 100 };
      const completedEnrollment = {
        ...mockEnrollment,
        progress: 100,
        status: EnrollmentStatus.COMPLETED,
        completedAt: expect.any(Date),
      };
      mockRepository.findOne.mockResolvedValue(mockEnrollment);
      mockRepository.save.mockResolvedValue(completedEnrollment);

      const result = await service.update(mockEnrollment.id, completeUpdate);

      expect(result.status).toBe(EnrollmentStatus.COMPLETED);
      expect(result.completedAt).toBeDefined();
    });

    it('debería lanzar NotFoundException si la inscripción no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateEnrollmentDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debería eliminar una inscripción exitosamente', async () => {
      mockRepository.findOne.mockResolvedValue(mockEnrollment);
      mockRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await service.remove(mockEnrollment.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockEnrollment.id);
    });

    it('debería lanzar NotFoundException si la inscripción no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});

