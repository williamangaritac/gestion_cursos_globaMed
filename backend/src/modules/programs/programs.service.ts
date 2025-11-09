import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Program, ProgramStatus } from './domain/entities/program.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { FilterProgramDto } from './dto/filter-program.dto';
import { ProgramResponseDto } from './dto/program-response.dto';
import { PaginatedResultDto } from '@/common/interfaces/paginated-result.interface';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
  ) {}

  async create(createProgramDto: CreateProgramDto): Promise<ProgramResponseDto> {
    const { startDate, endDate, ...rest } = createProgramDto;

    // Validate dates
    if (endDate && new Date(endDate) <= new Date(startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    // Create program
    const program = this.programRepository.create({
      ...rest,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      status: createProgramDto.status || ProgramStatus.DRAFT,
      maxStudents: createProgramDto.maxStudents || 30,
      currentStudents: 0,
    });

    const savedProgram = await this.programRepository.save(program);

    return plainToInstance(ProgramResponseDto, savedProgram);
  }

  async findAll(filterDto: FilterProgramDto): Promise<PaginatedResultDto<ProgramResponseDto>> {
    const {
      page = 1,
      limit = 10,
      status,
      instructorId,
      search,
      startDateFrom,
      startDateTo,
      availableOnly,
    } = filterDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.programRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.instructor', 'instructor');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('program.status = :status', { status });
    }

    if (instructorId) {
      queryBuilder.andWhere('program.instructorId = :instructorId', { instructorId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(program.name ILIKE :search OR program.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (startDateFrom) {
      queryBuilder.andWhere('program.startDate >= :startDateFrom', {
        startDateFrom: new Date(startDateFrom),
      });
    }

    if (startDateTo) {
      queryBuilder.andWhere('program.startDate <= :startDateTo', {
        startDateTo: new Date(startDateTo),
      });
    }

    if (availableOnly) {
      queryBuilder.andWhere('program.currentStudents < program.maxStudents');
    }

    // Exclude soft deleted
    queryBuilder.andWhere('program.deletedAt IS NULL');

    // Pagination
    queryBuilder.skip(skip).take(limit);

    // Order by start date
    queryBuilder.orderBy('program.startDate', 'DESC');

    const [programs, total] = await queryBuilder.getManyAndCount();

    const items = programs.map((program) => plainToInstance(ProgramResponseDto, program));

    return new PaginatedResultDto(items, total, page, limit);
  }

  async findOne(id: string): Promise<ProgramResponseDto> {
    const program = await this.programRepository.findOne({
      where: { id },
      relations: ['instructor'],
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    return plainToInstance(ProgramResponseDto, program);
  }

  async update(id: string, updateProgramDto: UpdateProgramDto): Promise<ProgramResponseDto> {
    const program = await this.programRepository.findOne({
      where: { id },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    // Validate dates if provided
    const newStartDate = updateProgramDto.startDate
      ? new Date(updateProgramDto.startDate)
      : program.startDate;
    const newEndDate = updateProgramDto.endDate
      ? new Date(updateProgramDto.endDate)
      : program.endDate;

    if (newEndDate && newEndDate <= newStartDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Validate max students if being reduced
    if (
      updateProgramDto.maxStudents !== undefined &&
      updateProgramDto.maxStudents < program.currentStudents
    ) {
      throw new BadRequestException(
        `Cannot reduce max students below current enrollment (${program.currentStudents})`,
      );
    }

    // Update program
    Object.assign(program, {
      ...updateProgramDto,
      startDate: updateProgramDto.startDate ? new Date(updateProgramDto.startDate) : program.startDate,
      endDate: updateProgramDto.endDate ? new Date(updateProgramDto.endDate) : program.endDate,
    });

    const updatedProgram = await this.programRepository.save(program);

    return plainToInstance(ProgramResponseDto, updatedProgram);
  }

  async remove(id: string): Promise<{ message: string }> {
    const program = await this.programRepository.findOne({
      where: { id },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    // Check if program has active enrollments
    if (program.currentStudents > 0) {
      throw new BadRequestException(
        'Cannot delete program with active enrollments. Archive it instead.',
      );
    }

    // Soft delete
    await this.programRepository.softDelete(id);

    return { message: 'Program deleted successfully' };
  }

  async archive(id: string): Promise<ProgramResponseDto> {
    const program = await this.programRepository.findOne({
      where: { id },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    program.status = ProgramStatus.ARCHIVED;
    const archivedProgram = await this.programRepository.save(program);

    return plainToInstance(ProgramResponseDto, archivedProgram);
  }

  async publish(id: string): Promise<ProgramResponseDto> {
    const program = await this.programRepository.findOne({
      where: { id },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    if (program.status !== ProgramStatus.DRAFT) {
      throw new BadRequestException('Only draft programs can be published');
    }

    program.status = ProgramStatus.PUBLISHED;
    const publishedProgram = await this.programRepository.save(program);

    return plainToInstance(ProgramResponseDto, publishedProgram);
  }

  async activate(id: string): Promise<ProgramResponseDto> {
    const program = await this.programRepository.findOne({
      where: { id },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    if (program.status !== ProgramStatus.PUBLISHED) {
      throw new BadRequestException('Only published programs can be activated');
    }

    program.status = ProgramStatus.ACTIVE;
    const activatedProgram = await this.programRepository.save(program);

    return plainToInstance(ProgramResponseDto, activatedProgram);
  }

  async count(): Promise<number> {
    return this.programRepository.count();
  }

  async countByStatus(status: ProgramStatus): Promise<number> {
    return this.programRepository.count({
      where: { status },
    });
  }
}

