import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "src/entities/user.entity";
import { CreateUserDTO } from "src/shared/user.dto";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('/create-user')
    async createUser(@Body() newUserDTO: CreateUserDTO): Promise<User> 
    {
        return await this.userService.createUser(newUserDTO)
    }
}