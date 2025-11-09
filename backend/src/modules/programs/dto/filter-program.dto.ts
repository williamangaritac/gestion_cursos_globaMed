import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsUUID, IsDateString } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ProgramStatus } from '../domain/entities/program.entity';

export class FilterProgramDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter by program status',
    enum: ProgramStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProgramStatus)
  status?: ProgramStatus;

  @ApiProperty({
    description: 'Filter by instructor ID',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  instructorId?: string;

  @ApiProperty({
    description: 'Search by program name or description',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter programs starting from this date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiProperty({
    description: 'Filter programs starting until this date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiProperty({
    description: 'Filter only programs with available seats',
    required: false,
  })
  @IsOptional()
  availableOnly?: boolean;
}

