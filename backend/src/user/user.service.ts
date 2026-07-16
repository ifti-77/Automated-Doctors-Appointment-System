import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Doctor } from "src/entities/doctor.entity";
import { Chamber } from "src/entities/chamber.entity";
import { Schedule } from "src/entities/schedule.entity";
import { CreateUserDTO } from "src/shared/user.dto";
import { Repository } from "typeorm";
import { UserRole } from "src/shared/customeTypes";

@Injectable()
export class UserService {

    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Doctor)
        private readonly doctorRepository: Repository<Doctor>,
        @InjectRepository(Chamber)
        private readonly chamberRepository: Repository<Chamber>,
        @InjectRepository(Schedule)
        private readonly scheduleRepository: Repository<Schedule>) { }

    async createUser(newUserDTO: CreateUserDTO): Promise<User> {

        try {
            const exitsUser = await this.userRepository.findOne({ where: { email: newUserDTO.email } })

            if (exitsUser) {
                throw new BadRequestException({ message: "This Email is already exits" })
            }

            return await this.userRepository.manager.transaction(
                async (transactionalEntityManager) => {
                    let savedDoctor: Doctor | undefined = undefined;


                    if (newUserDTO.role === UserRole.DOCTOR && newUserDTO.doctor) {
                        const doctorData = newUserDTO.doctor
                        const doctorEntity = transactionalEntityManager.create(Doctor, {
                            name: doctorData.name,
                            specialization: doctorData.specialization,
                            contact_info: doctorData.contact_info,
                        })
                        savedDoctor = await transactionalEntityManager.save(Doctor, doctorEntity);


                        if (doctorData.chambers && doctorData.chambers.length > 0) {
                            for (const chamberData of doctorData.chambers) {
                                const chamberEntity = transactionalEntityManager.create(Chamber, {
                                    address: chamberData.address,
                                    visit_fee: chamberData.visit_fee.toString(),
                                    doctor: savedDoctor,
                                });
                                const savedChamber = await transactionalEntityManager.save(Chamber, chamberEntity);

                                if (chamberData.schedules && chamberData.schedules.length > 0) {
                                    for (const scheduleData of chamberData.schedules) {
                                        const scheduleEntity = transactionalEntityManager.create(Schedule, {
                                            day: scheduleData.day,
                                            start_time: scheduleData.start_time,
                                            end_time: scheduleData.end_time,
                                            chamber: savedChamber,
                                        });
                                        await transactionalEntityManager.save(Schedule, scheduleEntity);
                                    }
                                }
                            }
                        }
                    }

                    const userEntity = transactionalEntityManager.create(User, {
                        email: newUserDTO.email,
                        password: newUserDTO.password,
                        role: newUserDTO.role,
                        doctor: savedDoctor,
                    });

                    const savedUser = await transactionalEntityManager.save(User, userEntity);

                    if ((savedUser as any).password) delete (savedUser as any).password
                    return savedUser
                },
            )
        } catch (error) {
            throw error
        }

    }
}