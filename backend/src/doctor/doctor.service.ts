import { Injectable } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Chamber } from 'src/entities/chamber.entity';
import { Schedule } from 'src/entities/schedule.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Chamber)
    private readonly chamberRepository: Repository<Chamber>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async GetDoctors(): Promise<Doctor[]> {
    return await this.doctorRepository.find({
      select: {
        doctor_id: true,
        name: true,
        specialization: true,
        contact_info: true,
        chambers: {
          address: true,
          visit_fee: true,
          schedules: true,
        },
      },
      relations: {
        chambers: {
          schedules: true,
        },
      },
    });
  }

  async GetspecializedDoctors(specialization: string): Promise<Doctor[]> {
    return await this.doctorRepository.find({
      where: {
        specialization: specialization,
      },
      select: {
        doctor_id: true,
        name: true,
        specialization: true,
        contact_info: true,
        chambers: {
          address: true,
          visit_fee: true,
          schedules: true,
        },
      },
      relations: {
        chambers: {
          schedules: true,
        },
      },
    });
  }

  async GetDoctorsByName(name: string): Promise<Doctor[]> {
    return await this.doctorRepository.find({
      where: {
        name: Like(`%${name}%`),
      },
      select: {
        doctor_id: true,
        name: true,
        specialization: true,
        contact_info: true,
        chambers: {
          address: true,
          visit_fee: true,
          schedules: true,
        },
      },
      relations: {
        chambers: {
          schedules: true,
        },
      },
    });
  }

  async GetDoctorById(doctor_id: string): Promise<Doctor | null> {
    return await this.doctorRepository.findOne({
      where: {
        doctor_id: doctor_id,
      },
      select: {
        doctor_id: true,
        name: true,
        specialization: true,
        contact_info: true,
        chambers: {
          address: true,
          visit_fee: true,
          schedules: true,
        },
      },
      relations: {
        chambers: {
          schedules: true,
        },
      },
    });
  }
}
