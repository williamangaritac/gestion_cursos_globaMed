import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ProgramStatus } from '../domain/entities/program.entity';
import { UserResponseDto } from '@modules/users/dto/user-response.dto';

@Exclude()
export class ProgramResponseDto {
  @Expose()
  @ApiProperty({ description: 'Program ID' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Program name' })
  name: string;

  @Expose()
  @ApiProperty({ description: 'Program description' })
  description?: string;

  @Expose()
  @ApiProperty({ description: 'Start date' })
  startDate: Date;

  @Expose()
  @ApiProperty({ description: 'End date' })
  endDate?: Date;

  @Expose()
  @ApiProperty({ description: 'Program status', enum: ProgramStatus })
  status: ProgramStatus;

  @Expose()
  @ApiProperty({ description: 'Instructor ID' })
  instructorId?: string;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ description: 'Instructor information', type: UserResponseDto, required: false })
  instructor?: UserResponseDto;

  @Expose()
  @ApiProperty({ description: 'Maximum students allowed' })
  maxStudents: number;

  @Expose()
  @ApiProperty({ description: 'Current number of enrolled students' })
  currentStudents: number;

  @Expose()
  @ApiProperty({ description: 'Available seats' })
  get availableSeats(): number {
    return Math.max(0, this.maxStudents - this.currentStudents);
  }

  @Expose()
  @ApiProperty({ description: 'Capacity percentage' })
  get capacityPercentage(): number {
    return this.maxStudents > 0 ? (this.currentStudents / this.maxStudents) * 100 : 0;
  }

  @Expose()
  @ApiProperty({ description: 'Is program full' })
  get isFull(): boolean {
    return this.currentStudents >= this.maxStudents;
  }

  @Expose()
  @ApiProperty({ description: 'Additional metadata' })
  metadata: Record<string, any>;

  @Expose()
  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

