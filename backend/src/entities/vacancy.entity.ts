import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { VacancyRequiredSkill } from './vacancy-required-skill.entity';

@Entity()
export class Vacancy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  vacancyId: string;

  @Column()
  jobTitle: string;

  @Column()
  department: string;

  @Column('text')
  description: string;

  @Column()
  field: string;   // same functional field as job roles

  @OneToMany(() => VacancyRequiredSkill, vrs => vrs.vacancy)
  requiredSkills: VacancyRequiredSkill[];
}