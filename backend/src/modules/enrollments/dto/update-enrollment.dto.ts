import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { EnrollmentStatus } from '../domain/entities/enrollment.entity';

export class UpdateEnrollmentDto {
  @ApiProperty({
    description: 'Enrollment status',
    enum: EnrollmentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(EnrollmentStatus, { message: 'Invalid enrollment status' })
  status?: EnrollmentStatus;

  @ApiProperty({
    description: 'Progress (0-100)',
    example: 50,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Progress must be an integer' })
  @Min(0, { message: 'Progress must be at least 0' })
  @Max(100, { message: 'Progress must not exceed 100' })
  progress?: number;
}

