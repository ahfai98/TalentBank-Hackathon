import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Employee } from './employee.entity';
import { JobRoleSkill } from './job-role-skill.entity';

@Entity()
export class JobRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column()
  field: string;

  @Column({ default: false })
  isHighRisk: boolean;

  @Column({ type: 'float', nullable: true })
  riskScore: number | null;

  @OneToMany(() => Employee, emp => emp.jobRole)
  employees: Employee[];

  @OneToMany(() => JobRoleSkill, jrs => jrs.jobRole)
  jobRoleSkills: JobRoleSkill[];
}