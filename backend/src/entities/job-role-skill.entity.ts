import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { JobRole } from './job-role.entity';
import { Skill } from './skill.entity';

@Entity()
export class JobRoleSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => JobRole, jobRole => jobRole.jobRoleSkills)
  jobRole: JobRole;

  @ManyToOne(() => Skill, skill => skill.jobRoleSkills)
  skill: Skill;
}