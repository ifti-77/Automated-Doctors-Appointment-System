import { Controller, Get, Param } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { Doctor } from 'src/entities/doctor.entity';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get('/get-doctors')
  GetDoctors(): Promise<Doctor[]> {
    return this.doctorService.GetDoctors();
  }

  @Get('/get-specialized-doctors/:specialization')
  GetspecializedDoctors(
    @Param('specialization') specialization: string,
  ): Promise<Doctor[]> {
    return this.doctorService.GetspecializedDoctors(specialization);
  }

  @Get('/get-doctors-by-name/:name')
  GetDoctorsByName(@Param('name') name: string): Promise<Doctor[]> {
    return this.doctorService.GetDoctorsByName(name);
  }

  @Get('/get-doctor-by-id/:id')
  GetDoctorById(@Param('id') id: string): Promise<Doctor | null> {
    return this.doctorService.GetDoctorById(id);
  }
}
