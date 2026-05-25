import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Vacancy } from './vacancy.entity';
import { Skill } from './skill.entity';

@Entity()
export class VacancyRequiredSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Vacancy, vacancy => vacancy.requiredSkills)
  vacancy: Vacancy;

  @ManyToOne(() => Skill, skill => skill.vacancyRequiredSkills)
  skill: Skill;
}