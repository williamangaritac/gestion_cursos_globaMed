import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { EnrollmentStatus } from '../domain/entities/enrollment.entity';
import { UserResponseDto } from '@modules/users/dto/user-response.dto';
import { ProgramResponseDto } from '@modules/programs/dto/program-response.dto';

@Exclude()
export class EnrollmentResponseDto {
  @Expose()
  @ApiProperty({ description: 'Enrollment ID' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ description: 'User information', type: UserResponseDto, required: false })
  user?: UserResponseDto;

  @Expose()
  @ApiProperty({ description: 'Program ID' })
  programId: string;

  @Expose()
  @Type(() => ProgramResponseDto)
  @ApiProperty({ description: 'Program information', type: ProgramResponseDto, required: false })
  program?: ProgramResponseDto;

  @Expose()
  @ApiProperty({ description: 'Enrollment status', enum: EnrollmentStatus })
  status: EnrollmentStatus;

  @Expose()
  @ApiProperty({ description: 'Progress (0-100)' })
  progress: number;

  @Expose()
  @ApiProperty({ description: 'Enrolled at timestamp' })
  enrolledAt: Date;

  @Expose()
  @ApiProperty({ description: 'Completed at timestamp' })
  completedAt?: Date;

  @Expose()
  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

