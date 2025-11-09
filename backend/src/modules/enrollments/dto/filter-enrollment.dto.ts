import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, Matches } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { EnrollmentStatus } from '../domain/entities/enrollment.entity';

export class FilterEnrollmentDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter by enrollment status',
    enum: EnrollmentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @ApiProperty({
    description: 'Filter by user ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'User ID must be a valid UUID format',
  })
  userId?: string;

  @ApiProperty({
    description: 'Filter by program ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'Program ID must be a valid UUID format',
  })
  programId?: string;
}

