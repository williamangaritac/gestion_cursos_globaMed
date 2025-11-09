import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { UserRole, UserStatus } from '../domain/entities/user.entity';

export class FilterUserDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter by user role',
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    description: 'Filter by user status',
    enum: UserStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({
    description: 'Search by email or full name',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}

