import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { JobRole } from './job-role.entity';
import { EmployeeSkill } from './employee-skill.entity';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  employeeId: string;

  @Column()
  name: string;

  @ManyToOne(() => JobRole, jobRole => jobRole.employees)
  jobRole: JobRole;

  @Column('text')
  cvText: string;

  @OneToMany(() => EmployeeSkill, es => es.employee)
  employeeSkills: EmployeeSkill[];
}