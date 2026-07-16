import { IsEmail, IsEnum, IsStrongPassword } from "class-validator";
import { UserRole } from "./customeTypes";
import { DoctorDTO } from "./doctor.dto";

export class CreateUserDTO {

    @IsEmail()
    email!: string;
    
    @IsStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})
    password!: string

    @IsEnum(UserRole)
    role!: UserRole;

    doctor!: DoctorDTO
}