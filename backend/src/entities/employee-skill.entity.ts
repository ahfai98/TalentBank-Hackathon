import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { Skill } from './skill.entity';

@Entity()
export class EmployeeSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Employee, emp => emp.employeeSkills)
  employee: Employee;

  @ManyToOne(() => Skill, skill => skill.employeeSkills)
  skill: Skill;
}