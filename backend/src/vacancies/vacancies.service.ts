import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacancy } from '../entities/vacancy.entity';
import { VacancyRequiredSkill } from '../entities/vacancy-required-skill.entity';
import { Skill } from '../entities/skill.entity';

@Injectable()
export class VacanciesService {
  constructor(
    @InjectRepository(Vacancy)
    private vacancyRepo: Repository<Vacancy>,
    @InjectRepository(VacancyRequiredSkill)
    private vacancySkillRepo: Repository<VacancyRequiredSkill>,
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
  ) {}

  async findByField(field: string): Promise<Vacancy[]> {
    return this.vacancyRepo.find({ where: { field } });
  }

  async findAllNonHighRisk(): Promise<Vacancy[]> {
    // "Non‑high‑risk" is defined by jobRole.isHighRisk = false.
    // Vacancy itself has a `field` but no direct risk flag.
    // We join with JobRole (same field) to filter only vacancies whose field
    // corresponds to a job role that is NOT high‑risk.
    return this.vacancyRepo
      .createQueryBuilder('vacancy')
      .innerJoin('job_role', 'jr', 'vacancy.field = jr.field')
      .where('jr.isHighRisk = :isHighRisk', { isHighRisk: false })
      .getMany();
  }

  async getRequiredSkillNames(vacancyId: number): Promise<string[]> {
    const skills = await this.vacancySkillRepo
      .createQueryBuilder('vrs')
      .leftJoinAndSelect('vrs.skill', 'skill')
      .where('vrs.vacancyId = :vacancyId', { vacancyId })
      .getMany();
    return skills.map((vrs) => vrs.skill.name);
  }

  async getVacancyWithSkills(vacancyId: number): Promise<Vacancy | null> {
    return this.vacancyRepo.findOne({
      where: { id: vacancyId },
      relations: { requiredSkills: { skill: true } },
    });
  }
}