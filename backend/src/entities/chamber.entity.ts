import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Doctor } from "./doctor.entity";
import { Schedule } from "./schedule.entity";

@Entity("chambers")
export class Chamber {

    @PrimaryGeneratedColumn('uuid')
    chamber_id!: string;

    @ManyToOne(() => Doctor, (doctor) => doctor.chambers, { onDelete: "CASCADE" })
    @JoinColumn({ name: 'doctor_id' })
    doctor!: Doctor;

    @Column({ type: 'varchar', length: 255, nullable: false })
    address!: string;

    @OneToMany(() => Schedule, (schedule) => schedule.chamber)
    schedules!: Schedule[];

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    visit_fee!: string;

}