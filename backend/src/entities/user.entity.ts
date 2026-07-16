import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from '../shared/customeTypes';
import { Doctor } from './doctor.entity';
import * as bycrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.Patient })
  role!: UserRole;

  @OneToOne(() => Doctor, (doctor) => doctor.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor?: Doctor;

  @BeforeInsert()
  async hashPassword(){
    const salt = bycrypt.genSaltSync(10)
    this.password = bycrypt.hashSync(this.password, salt)
  }
}
