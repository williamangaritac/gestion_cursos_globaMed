import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@modules/users/domain/entities/user.entity';

export class UserPayloadDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User full name' })
  fullName: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'User status', enum: UserStatus })
  status: UserStatus;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Access token (JWT)' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token (JWT)' })
  refreshToken: string;

  @ApiProperty({ description: 'User information', type: UserPayloadDto })
  user: UserPayloadDto;

  @ApiProperty({ description: 'Token type', example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: 'Access token expiration in seconds', example: 900 })
  expiresIn: number;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;
}

