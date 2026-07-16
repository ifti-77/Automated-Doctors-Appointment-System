import { IsNotEmpty, IsString } from "class-validator";
import { ChamberDTO } from "./chamber.dto";

export class DoctorDTO {

    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    specialization!: string;
    
    @IsNotEmpty()
    @IsString()
    contact_info!: string;

    chambers!: ChamberDTO[]
}