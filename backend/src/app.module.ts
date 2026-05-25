import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { JobRole } from './entities/job-role.entity';
import { Skill } from './entities/skill.entity';
import { Employee } from './entities/employee.entity';
import { Vacancy } from './entities/vacancy.entity';
import { UpskillingCourse } from './entities/upskilling-course.entity';
import { JobRoleSkill } from './entities/job-role-skill.entity';
import { VacancyRequiredSkill } from './entities/vacancy-required-skill.entity';
import { EmployeeSkill } from './entities/employee-skill.entity';
import { SeedService } from './seed/seed.service';
import { EmployeesModule } from './employees/employees.module';
import { VacanciesModule } from './vacancies/vacancies.module';
import { UpskillingModule } from './upskilling/upskilling.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([
      JobRole,
      Skill,
      Employee,
      Vacancy,
      UpskillingCourse,
      JobRoleSkill,
      VacancyRequiredSkill,
      EmployeeSkill,
    ]),
    EmployeesModule,
    VacanciesModule,
    UpskillingModule,
  ],
  providers: [SeedService], // Make SeedService available for the command
})
export class AppModule {}