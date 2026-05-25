import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Skill } from './skill.entity';

@Entity()
export class UpskillingCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseName: string;

  @Column()
  duration: string;

  @ManyToOne(() => Skill, skill => skill.upskillingCourses)
  skill: Skill;
}