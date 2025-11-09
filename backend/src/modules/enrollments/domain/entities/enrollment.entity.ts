import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '@modules/users/domain/entities/user.entity';
import { Program } from '@modules/programs/domain/entities/program.entity';

export enum EnrollmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
}

@Entity('enrollments')
@Unique(['userId', 'programId'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'program_id', type: 'uuid' })
  programId: string;

  @ManyToOne(() => Program, { eager: false })
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ name: 'enrolled_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  enrolledAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp with time zone', nullable: true })
  completedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  // Virtual properties
  get isActive(): boolean {
    return this.status === EnrollmentStatus.ACTIVE;
  }

  get isCompleted(): boolean {
    return this.status === EnrollmentStatus.COMPLETED || this.progress === 100;
  }

  get isDropped(): boolean {
    return this.status === EnrollmentStatus.DROPPED;
  }

  get isPending(): boolean {
    return this.status === EnrollmentStatus.PENDING;
  }
}

