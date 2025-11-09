import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { Program, ProgramStatus } from './domain/entities/program.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

describe('ProgramsService', () => {
  let service: ProgramsService;
  let repository: Repository<Program>;

  const mockProgram: Program = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Programa de Prueba',
    description: 'Descripción del programa de prueba',
    status: ProgramStatus.ACTIVE,
    capacity: 30,
    currentStudents: 0,
    duration: 8,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-01'),
    instructorId: '123e4567-e89b-12d3-a456-426614174001',
    instructor: null,
    enrollments: [],
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramsService,
        {
          provide: getRepositoryToken(Program),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProgramsService>(ProgramsService);
    repository = module.get<Repository<Program>>(getRepositoryToken(Program));

    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createProgramDto: CreateProgramDto = {
      title: 'Nuevo Programa',
      description: 'Descripción del nuevo programa',
      status: ProgramStatus.DRAFT,
      capacity: 25,
      duration: 6,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-11-01'),
      instructorId: '123e4567-e89b-12d3-a456-426614174001',
    };

    it('debería crear un nuevo programa exitosamente', async () => {
      mockRepository.create.mockReturnValue(mockProgram);
      mockRepository.save.mockResolvedValue(mockProgram);

      const result = await service.create(createProgramDto);

      expect(result).toEqual(mockProgram);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debería establecer currentStudents en 0 por defecto', async () => {
      const programWithoutStudents = { ...mockProgram, currentStudents: 0 };
      mockRepository.create.mockReturnValue(programWithoutStudents);
      mockRepository.save.mockResolvedValue(programWithoutStudents);

      const result = await service.create(createProgramDto);

      expect(result.currentStudents).toBe(0);
    });
  });

  describe('findAll', () => {
    it('debería retornar un array de programas', async () => {
      const programs = [mockProgram];
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(programs),
        getCount: jest.fn(),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll({});

      expect(result).toEqual(programs);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('debería aplicar filtros de estado e instructor', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProgram]),
        getCount: jest.fn(),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findAll({ status: ProgramStatus.ACTIVE, instructorId: mockProgram.instructorId });

      expect(queryBuilder.andWhere).toHaveBeenCalled();
    });

    it('debería filtrar por término de búsqueda', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProgram]),
        getCount: jest.fn(),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findAll({ search: 'Prueba' });

      expect(queryBuilder.andWhere).toHaveBeenCalled();
    });

    it('debería retornar un array vacío si no hay programas', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn(),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll({});

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('debería retornar un programa por ID', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockProgram),
        andWhere: jest.fn(),
        getMany: jest.fn(),
        getCount: jest.fn(),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findById(mockProgram.id);

      expect(result).toEqual(mockProgram);
    });

    it('debería lanzar NotFoundException si el programa no existe', async () => {
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
    const updateProgramDto: UpdateProgramDto = {
      title: 'Título Actualizado',
      status: ProgramStatus.PUBLISHED,
    };

    it('debería actualizar un programa exitosamente', async () => {
      const updatedProgram = { ...mockProgram, ...updateProgramDto };
      mockRepository.findOne.mockResolvedValue(mockProgram);
      mockRepository.save.mockResolvedValue(updatedProgram);

      const result = await service.update(mockProgram.id, updateProgramDto);

      expect(result).toEqual(updatedProgram);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockProgram.id } });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el programa no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateProgramDto)).rejects.toThrow(NotFoundException);
    });

    it('debería actualizar solo los campos proporcionados', async () => {
      const partialUpdate = { title: 'Solo Título' };
      const updatedProgram = { ...mockProgram, title: partialUpdate.title };
      mockRepository.findOne.mockResolvedValue(mockProgram);
      mockRepository.save.mockResolvedValue(updatedProgram);

      const result = await service.update(mockProgram.id, partialUpdate);

      expect(result.title).toBe(partialUpdate.title);
      expect(result.description).toBe(mockProgram.description);
    });
  });

  describe('remove', () => {
    it('debería eliminar un programa exitosamente', async () => {
      mockRepository.findOne.mockResolvedValue(mockProgram);
      mockRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await service.remove(mockProgram.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockProgram.id } });
      expect(mockRepository.delete).toHaveBeenCalledWith(mockProgram.id);
    });

    it('debería lanzar NotFoundException si el programa no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('findActivePrograms', () => {
    it('debería retornar solo programas activos', async () => {
      const activePrograms = [mockProgram];
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(activePrograms),
        getOne: jest.fn(),
        getCount: jest.fn(),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findActivePrograms();

      expect(result).toEqual(activePrograms);
      expect(queryBuilder.where).toHaveBeenCalledWith('program.status = :status', { status: ProgramStatus.ACTIVE });
    });
  });

  describe('hasAvailableCapacity', () => {
    it('debería retornar true si el programa tiene capacidad disponible', async () => {
      const programWithCapacity = { ...mockProgram, currentStudents: 20, capacity: 30 };
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(programWithCapacity),
        andWhere: jest.fn(),
        getMany: jest.fn(),
        getCount: jest.fn(),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.hasAvailableCapacity(mockProgram.id);

      expect(result).toBe(true);
    });

    it('debería retornar false si el programa está lleno', async () => {
      const fullProgram = { ...mockProgram, currentStudents: 30, capacity: 30 };
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(fullProgram),
        andWhere: jest.fn(),
        getMany: jest.fn(),
        getCount: jest.fn(),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.hasAvailableCapacity(mockProgram.id);

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('debería retornar el conteo de programas', async () => {
      mockRepository.count.mockResolvedValue(10);

      const result = await service.count({});

      expect(result).toBe(10);
      expect(mockRepository.count).toHaveBeenCalled();
    });
  });
});

