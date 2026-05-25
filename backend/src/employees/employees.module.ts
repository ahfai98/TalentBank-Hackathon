import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee } from '../entities/employee.entity';
import { JobRole } from '../entities/job-role.entity';
import { Skill } from '../entities/skill.entity';
import { EmployeeSkill } from '../entities/employee-skill.entity';
import { VacanciesModule } from '../vacancies/vacancies.module';   // <-- import

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, JobRole, Skill, EmployeeSkill]),
    VacanciesModule,   // <-- add here
  ],
  providers: [EmployeesService],
  controllers: [EmployeesController],
  exports: [EmployeesService],
})
export class EmployeesModule {}