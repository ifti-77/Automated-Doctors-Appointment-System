import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Chamber } from "./chamber.entity";
import { User } from "./user.entity";

@Entity('doctors')

export class Doctor{

    @PrimaryGeneratedColumn('uuid')
    doctor_id!: string;

    @OneToOne(() => User, (user) => user.doctor)
    user?: User;

    @Column({ type: 'varchar', length: 255, nullable: false })
    name!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    specialization!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    contact_info!: string;

    @OneToMany(() => Chamber, (chamber) => chamber.doctor)
    chambers!: Chamber[];

}