import { Module } from "@nestjs/common";
import { Schedule } from "src/entities/schedule.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Chamber } from "src/entities/chamber.entity";
import { Doctor } from "src/entities/doctor.entity";
import { User } from "src/entities/user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
    imports: [TypeOrmModule.forFeature([User, Doctor, Chamber, Schedule])],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}