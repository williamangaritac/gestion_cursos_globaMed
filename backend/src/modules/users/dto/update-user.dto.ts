import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) {
  @ApiProperty({
    description: 'New password (optional)',
    example: 'NewSecurePass123!',
    required: false,
  })
  password?: string;
}

