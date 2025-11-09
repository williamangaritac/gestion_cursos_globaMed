import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/users/domain/entities/user.entity';

export enum ProgramStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({
    type: 'enum',
    enum: ProgramStatus,
    default: ProgramStatus.DRAFT,
  })
  status: ProgramStatus;

  @Column({ name: 'instructor_id', type: 'uuid', nullable: true })
  instructorId?: string;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'instructor_id' })
  instructor?: User;

  @Column({ name: 'max_students', type: 'int', default: 30 })
  maxStudents: number;

  @Column({ name: 'current_students', type: 'int', default: 0 })
  currentStudents: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date;

  // Virtual properties
  get isFull(): boolean {
    return this.currentStudents >= this.maxStudents;
  }

  get availableSeats(): number {
    return Math.max(0, this.maxStudents - this.currentStudents);
  }

  get capacityPercentage(): number {
    return this.maxStudents > 0 ? (this.currentStudents / this.maxStudents) * 100 : 0;
  }

  get isActive(): boolean {
    return this.status === ProgramStatus.ACTIVE && !this.deletedAt;
  }

  get canEnroll(): boolean {
    return this.isActive && !this.isFull;
  }
}

