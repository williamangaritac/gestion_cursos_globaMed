import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { UserRole, UserStatus } from '../domain/entities/user.entity';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({ description: 'User ID' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'User email' })
  email: string;

  @Expose()
  @ApiProperty({ description: 'User full name' })
  fullName: string;

  @Expose()
  @ApiProperty({ description: 'User role', enum: UserRole })
  role: UserRole;

  @Expose()
  @ApiProperty({ description: 'User status', enum: UserStatus })
  status: UserStatus;

  @Expose()
  @ApiProperty({ description: 'Last login timestamp' })
  lastLoginAt?: Date;

  @Expose()
  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

