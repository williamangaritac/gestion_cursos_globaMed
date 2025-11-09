import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Enrollment, EnrollmentStatus } from './domain/entities/enrollment.entity';
import { Program, ProgramStatus } from '@modules/programs/domain/entities/program.entity';
import { User, UserStatus } from '@modules/users/domain/entities/user.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { FilterEnrollmentDto } from './dto/filter-enrollment.dto';
import { EnrollmentResponseDto } from './dto/enrollment-response.dto';
import { PaginatedResultDto } from '@/common/interfaces/paginated-result.interface';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<EnrollmentResponseDto> {
    const { userId, programId, status, progress } = createEnrollmentDto;

    // Verify user exists and is active
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('User is not active');
    }

    // Verify program exists and is active
    const program = await this.programRepository.findOne({
      where: { id: programId },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${programId} not found`);
    }

    if (program.status !== ProgramStatus.ACTIVE) {
      throw new BadRequestException('Program is not active for enrollment');
    }

    // Check if program has available capacity
    if (program.currentStudents >= program.maxStudents) {
      throw new BadRequestException('Program has reached maximum capacity');
    }

    // Check if user is already enrolled
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { userId, programId },
    });

    if (existingEnrollment) {
      throw new ConflictException('User is already enrolled in this program');
    }

    // Create enrollment
    const enrollment = this.enrollmentRepository.create({
      userId,
      programId,
      status: status || EnrollmentStatus.ACTIVE,
      progress: progress || 0,
    });

    const savedEnrollment = await this.enrollmentRepository.save(enrollment);

    // Load relations for response
    const enrollmentWithRelations = await this.enrollmentRepository.findOne({
      where: { id: savedEnrollment.id },
      relations: ['user', 'program'],
    });

    return plainToInstance(EnrollmentResponseDto, enrollmentWithRelations);
  }

  async findAll(
    filterDto: FilterEnrollmentDto,
  ): Promise<PaginatedResultDto<EnrollmentResponseDto>> {
    const { page = 1, limit = 10, status, userId, programId } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.user', 'user')
      .leftJoinAndSelect('enrollment.program', 'program');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('enrollment.status = :status', { status });
    }

    if (userId) {
      queryBuilder.andWhere('enrollment.userId = :userId', { userId });
    }

    if (programId) {
      queryBuilder.andWhere('enrollment.programId = :programId', { programId });
    }

    // Pagination
    queryBuilder.skip(skip).take(limit);

    // Order by enrolled date
    queryBuilder.orderBy('enrollment.enrolledAt', 'DESC');

    const [enrollments, total] = await queryBuilder.getManyAndCount();

    const items = enrollments.map((enrollment) =>
      plainToInstance(EnrollmentResponseDto, enrollment),
    );

    return new PaginatedResultDto(items, total, page, limit);
  }

  async findOne(id: string): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['user', 'program'],
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return plainToInstance(EnrollmentResponseDto, enrollment);
  }

  async update(
    id: string,
    updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['user', 'program'],
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    // Update enrollment
    Object.assign(enrollment, updateEnrollmentDto);

    // Auto-complete if progress reaches 100
    if (updateEnrollmentDto.progress === 100 && enrollment.status === EnrollmentStatus.ACTIVE) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completedAt = new Date();
    }

    const updatedEnrollment = await this.enrollmentRepository.save(enrollment);

    return plainToInstance(EnrollmentResponseDto, updatedEnrollment);
  }

  async updateProgress(id: string, progress: number): Promise<EnrollmentResponseDto> {
    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Progress must be between 0 and 100');
    }

    return this.update(id, { progress });
  }

  async complete(id: string): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['user', 'program'],
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('Enrollment is already completed');
    }

    enrollment.status = EnrollmentStatus.COMPLETED;
    enrollment.progress = 100;
    enrollment.completedAt = new Date();

    const completedEnrollment = await this.enrollmentRepository.save(enrollment);

    return plainToInstance(EnrollmentResponseDto, completedEnrollment);
  }

  async drop(id: string): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['user', 'program'],
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    if (enrollment.status === EnrollmentStatus.DROPPED) {
      throw new BadRequestException('Enrollment is already dropped');
    }

    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot drop a completed enrollment');
    }

    enrollment.status = EnrollmentStatus.DROPPED;

    const droppedEnrollment = await this.enrollmentRepository.save(enrollment);

    return plainToInstance(EnrollmentResponseDto, droppedEnrollment);
  }

  async remove(id: string): Promise<{ message: string }> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    await this.enrollmentRepository.remove(enrollment);

    return { message: 'Enrollment deleted successfully' };
  }

  async countByUser(userId: string): Promise<number> {
    return this.enrollmentRepository.count({
      where: { userId },
    });
  }

  async countByProgram(programId: string): Promise<number> {
    return this.enrollmentRepository.count({
      where: { programId },
    });
  }
}

