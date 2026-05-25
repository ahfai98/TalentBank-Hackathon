import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacanciesService } from './vacancies.service';
import { VacanciesController } from './vacancies.controller';
import { Vacancy } from '../entities/vacancy.entity';
import { VacancyRequiredSkill } from '../entities/vacancy-required-skill.entity';
import { Skill } from '../entities/skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vacancy, VacancyRequiredSkill, Skill])],
  providers: [VacanciesService],
  controllers: [VacanciesController],
  exports: [VacanciesService],
})
export class VacanciesModule {}