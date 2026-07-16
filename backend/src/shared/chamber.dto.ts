import { ScheduleDTO } from "./schedule.dto"
import { IsNumber } from "class-validator"

export class ChamberDTO {
    
    address!: string
    schedules!: ScheduleDTO[]
    
    @IsNumber({maxDecimalPlaces: 2,})
    visit_fee!: number 
}