import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpskillingCourse } from '../entities/upskilling-course.entity';
import { Skill } from '../entities/skill.entity';

@Injectable()
export class UpskillingService {
  constructor(
    @InjectRepository(UpskillingCourse)
    private courseRepo: Repository<UpskillingCourse>,
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
  ) {}

  async getCourseBySkillName(skillName: string): Promise<UpskillingCourse | null> {
    const skill = await this.skillRepo.findOne({ where: { name: skillName } });
    if (!skill) return null;
    return this.courseRepo.findOne({
      where: { skill: { id: skill.id } },
      relations: { skill: true },
    });
  }
}