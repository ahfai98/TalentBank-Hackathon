import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { JobRoleSkill } from './job-role-skill.entity';
import { EmployeeSkill } from './employee-skill.entity';
import { VacancyRequiredSkill } from './vacancy-required-skill.entity';
import { UpskillingCourse } from './upskilling-course.entity';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => JobRoleSkill, jrs => jrs.skill)
  jobRoleSkills: JobRoleSkill[];

  @OneToMany(() => EmployeeSkill, es => es.skill)
  employeeSkills: EmployeeSkill[];

  @OneToMany(() => VacancyRequiredSkill, vrs => vrs.skill)
  vacancyRequiredSkills: VacancyRequiredSkill[];

  @OneToMany(() => UpskillingCourse, uc => uc.skill)
  upskillingCourses: UpskillingCourse[];
}