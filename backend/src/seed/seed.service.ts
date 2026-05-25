import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { JobRole } from '../entities/job-role.entity';
import { Skill } from '../entities/skill.entity';
import { Employee } from '../entities/employee.entity';
import { Vacancy } from '../entities/vacancy.entity';
import { UpskillingCourse } from '../entities/upskilling-course.entity';
import { JobRoleSkill } from '../entities/job-role-skill.entity';
import { VacancyRequiredSkill } from '../entities/vacancy-required-skill.entity';
import { EmployeeSkill } from '../entities/employee-skill.entity';   // <-- ADD

// Helper to load JSON files reliably in any environment
function loadJsonFile(fileName: string) {
  const possiblePaths = [
    path.join(__dirname, '..', 'mock-data', fileName),
    path.join(__dirname, '..', '..', 'src', 'mock-data', fileName),
  ];
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  }
  throw new Error(`Could not find JSON file: ${fileName}`);
}

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(JobRole) private jobRoleRepo: Repository<JobRole>,
    @InjectRepository(Skill) private skillRepo: Repository<Skill>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @InjectRepository(Vacancy) private vacancyRepo: Repository<Vacancy>,
    @InjectRepository(UpskillingCourse) private courseRepo: Repository<UpskillingCourse>,
    @InjectRepository(JobRoleSkill) private jrSkillRepo: Repository<JobRoleSkill>,
    @InjectRepository(VacancyRequiredSkill) private vacancySkillRepo: Repository<VacancyRequiredSkill>,
    @InjectRepository(EmployeeSkill) private employeeSkillRepo: Repository<EmployeeSkill>, // <-- ADD
  ) {}

  async seed() {
    // Load data
    const jobRolesData = loadJsonFile('job-roles.json');
    const skillsData = loadJsonFile('skills.json');
    const jobRoleSkillsData = loadJsonFile('job-role-skills.json');
    const employeesData = loadJsonFile('employees.json');
    const vacanciesData = loadJsonFile('vacancies.json');
    const coursesData = loadJsonFile('upskilling-courses.json');

    // 1. Clear tables (order matters because of foreign keys)
    await this.vacancySkillRepo.clear();   // VacancyRequiredSkill -> Vacancy, Skill
    await this.jrSkillRepo.clear();        // JobRoleSkill -> JobRole, Skill
    await this.employeeSkillRepo.clear();  // EmployeeSkill -> Employee, Skill  <-- ADD THIS LINE
    await this.employeeRepo.clear();       // Employee -> JobRole
    await this.vacancyRepo.clear();
    await this.courseRepo.clear();
    await this.skillRepo.clear();
    await this.jobRoleRepo.clear();

    // 2. Insert Skills
    const skillMap = new Map<string, Skill>();
    for (const name of skillsData) {
      const skill = this.skillRepo.create({ name });
      await this.skillRepo.save(skill);
      skillMap.set(name, skill);
    }

    // 3. Insert JobRoles
    const jobRoleMap = new Map<string, JobRole>();
    for (const role of jobRolesData) {
      const jobRole = this.jobRoleRepo.create({
        title: role.title,
        field: role.field,
        isHighRisk: role.isHighRisk,
        riskScore: role.riskScore ?? null,
      });
      await this.jobRoleRepo.save(jobRole);
      jobRoleMap.set(role.title, jobRole);
    }

    // 4. Insert JobRoleSkills
    for (const mapping of jobRoleSkillsData) {
      const jobRole = jobRoleMap.get(mapping.jobTitle);
      if (!jobRole) continue;
      for (const skillName of mapping.skills) {
        const skill = skillMap.get(skillName);
        if (skill) {
          const jrSkill = this.jrSkillRepo.create({ jobRole, skill });
          await this.jrSkillRepo.save(jrSkill);
        }
      }
    }

    // 5. Insert Employees
    for (const emp of employeesData) {
      const jobRole = jobRoleMap.get(emp.jobTitle);
      if (!jobRole) continue;
      const employee = this.employeeRepo.create({
        employeeId: emp.employeeId,
        name: emp.name,
        jobRole: jobRole,
        cvText: emp.cvText,
      });
      await this.employeeRepo.save(employee);
    }

    // 6. Insert Vacancies & required skills
    for (const vac of vacanciesData) {
      const vacancy = this.vacancyRepo.create({
        vacancyId: vac.vacancyId,
        jobTitle: vac.jobTitle,
        department: vac.department,
        description: vac.description,
        field: vac.field,
      });
      await this.vacancyRepo.save(vacancy);
      for (const skillName of vac.requiredSkills) {
        const skill = skillMap.get(skillName);
        if (skill) {
          const vs = this.vacancySkillRepo.create({ vacancy, skill });
          await this.vacancySkillRepo.save(vs);
        }
      }
    }

    // 7. Insert UpskillingCourses
    for (const course of coursesData) {
      const skill = skillMap.get(course.skill);
      if (skill) {
        const upCourse = this.courseRepo.create({
          courseName: course.course,
          duration: course.duration,
          skill: skill,
        });
        await this.courseRepo.save(upCourse);
      }
    }

    console.log('✅ Database seeded!');
  }
}