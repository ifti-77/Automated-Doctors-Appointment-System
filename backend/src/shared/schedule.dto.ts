import { IsNotEmpty, IsEnum, IsString } from "class-validator";
import { DayOfWeek } from "./customeTypes";

export class ScheduleDTO {

    @IsNotEmpty()
    @IsEnum(DayOfWeek, {
        message: `day must be a valid enum value: ${Object.values(DayOfWeek).join(', ')}`
    })
    day!: DayOfWeek;

    @IsNotEmpty()
    @IsString()
    start_time!: string;

    @IsNotEmpty()
    @IsString()
    end_time!: string;

}