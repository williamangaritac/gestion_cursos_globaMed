import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsEnum, IsOptional, IsInt, Min, Max, IsString, Matches } from 'class-validator';
import { EnrollmentStatus } from '../domain/entities/enrollment.entity';

export class CreateEnrollmentDto {
  @ApiProperty({
    description: 'User ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsString({ message: 'User ID must be a string' })
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'User ID must be a valid UUID format',
  })
  userId: string;

  @ApiProperty({
    description: 'Program ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsNotEmpty({ message: 'Program ID is required' })
  @IsString({ message: 'Program ID must be a string' })
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'Program ID must be a valid UUID format',
  })
  programId: string;

  @ApiProperty({
    description: 'Enrollment status',
    enum: EnrollmentStatus,
    example: EnrollmentStatus.ACTIVE,
    required: false,
    default: EnrollmentStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(EnrollmentStatus, { message: 'Invalid enrollment status' })
  status?: EnrollmentStatus;

  @ApiProperty({
    description: 'Initial progress (0-100)',
    example: 0,
    minimum: 0,
    maximum: 100,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Progress must be an integer' })
  @Min(0, { message: 'Progress must be at least 0' })
  @Max(100, { message: 'Progress must not exceed 100' })
  progress?: number;
}

