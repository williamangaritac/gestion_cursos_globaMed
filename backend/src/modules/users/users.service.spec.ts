import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, UserRole, UserStatus } from './domain/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    fullName: 'Usuario de Prueba',
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
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
      getMany: jest.fn(),
      getCount: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      password: 'Password123!',
      fullName: 'Nuevo Usuario',
      role: UserRole.STUDENT,
    };

    it('debería crear un nuevo usuario exitosamente', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('$2b$10$hashedpassword'));

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('debería hashear la contraseña antes de guardar', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);
      const hashSpy = jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('$2b$10$hashedpassword'));

      await service.create(createUserDto);

      expect(hashSpy).toHaveBeenCalledWith(createUserDto.password, 10);
    });
  });

  describe('findAll', () => {
    it('debería retornar un array de usuarios', async () => {
      const users = [mockUser];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll({});

      expect(result).toEqual(users);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('debería aplicar filtros de rol y estado', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser]),
        getCount: jest.fn(),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findAll({ role: UserRole.STUDENT, status: UserStatus.ACTIVE });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.andWhere).toHaveBeenCalled();
    });

    it('debería retornar un array vacío si no hay usuarios', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll({});

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('debería retornar un usuario por ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('debería retornar un usuario por email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: mockUser.email } });
    });

    it('debería retornar null si el email no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      fullName: 'Nombre Actualizado',
      status: UserStatus.INACTIVE,
    };

    it('debería actualizar un usuario exitosamente', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('debería hashear la contraseña si se actualiza', async () => {
      const updateWithPassword = { ...updateUserDto, password: 'NewPassword123!' };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);
      const hashSpy = jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('$2b$10$newhashedpassword'));

      await service.update(mockUser.id, updateWithPassword);

      expect(hashSpy).toHaveBeenCalledWith(updateWithPassword.password, 10);
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      const updateWithEmail = { email: 'existing@example.com' };
      mockRepository.findOne
        .mockResolvedValueOnce(mockUser) // Primera llamada: usuario actual
        .mockResolvedValueOnce({ ...mockUser, id: 'different-id' }); // Segunda llamada: otro usuario con ese email

      await expect(service.update(mockUser.id, updateWithEmail)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('debería eliminar un usuario exitosamente', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await service.remove(mockUser.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
      expect(mockRepository.delete).toHaveBeenCalledWith(mockUser.id);
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('debería retornar el conteo de usuarios', async () => {
      mockRepository.count.mockResolvedValue(5);

      const result = await service.count({});

      expect(result).toBe(5);
      expect(mockRepository.count).toHaveBeenCalled();
    });
  });
});

