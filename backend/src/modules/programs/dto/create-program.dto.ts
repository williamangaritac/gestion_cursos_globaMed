import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  IsDateString,
  IsObject,
} from 'class-validator';
import { ProgramStatus } from '../domain/entities/program.entity';

export class CreateProgramDto {
  @ApiProperty({
    description: 'Program name',
    example: 'Introduction to Web Development',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Program name is required' })
  @MinLength(3, { message: 'Program name must be at least 3 characters long' })
  @MaxLength(255, { message: 'Program name must not exceed 255 characters' })
  name: string;

  @ApiProperty({
    description: 'Program description',
    example: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Program start date (ISO 8601 format)',
    example: '2025-01-15',
  })
  @IsNotEmpty({ message: 'Start date is required' })
  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate: string;

  @ApiProperty({
    description: 'Program end date (ISO 8601 format)',
    example: '2025-06-15',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate?: string;

  @ApiProperty({
    description: 'Program status',
    enum: ProgramStatus,
    example: ProgramStatus.DRAFT,
    required: false,
    default: ProgramStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ProgramStatus, { message: 'Invalid program status' })
  status?: ProgramStatus;

  @ApiProperty({
    description: 'Instructor ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Instructor ID must be a valid UUID' })
  instructorId?: string;

  @ApiProperty({
    description: 'Maximum number of students',
    example: 30,
    minimum: 1,
    default: 30,
  })
  @IsOptional()
  @IsInt({ message: 'Max students must be an integer' })
  @Min(1, { message: 'Max students must be at least 1' })
  maxStudents?: number;

  @ApiProperty({
    description: 'Additional metadata (JSON object)',
    example: { duration: '6 months', level: 'beginner' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

