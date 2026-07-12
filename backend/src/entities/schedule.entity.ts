import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chamber } from './chamber.entity';
import { DayOfWeek } from '../shared/customeTypes';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  schedule_id!: string;

  @ManyToOne(() => Chamber, (chamber) => chamber.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chamber_id' })
  chamber!: Chamber;

  @Column({
    type: 'enum',
    enum: DayOfWeek,
    nullable: false,
    default: DayOfWeek.SUNDAY,
  })
  day!: DayOfWeek;

  @Column({ type: 'time', nullable: false })
  start_time!: string;

  @Column({ type: 'time', nullable: false })
  end_time!: string;
}
