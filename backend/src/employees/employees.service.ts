import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { JobRole } from '../entities/job-role.entity';
import { Skill } from '../entities/skill.entity';
import { EmployeeSkill } from '../entities/employee-skill.entity';
import { VacanciesService } from '../vacancies/vacancies.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(JobRole)
    private jobRoleRepo: Repository<JobRole>,
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
    @InjectRepository(EmployeeSkill)
    private employeeSkillRepo: Repository<EmployeeSkill>,
    private vacanciesService: VacanciesService,
  ) {}

  // 1. High‑risk employees
    async getHighRiskEmployees() {
    return this.employeeRepo.find({
        where: { jobRole: { isHighRisk: true } },
        relations: { jobRole: true },        // fixed
    });
    }

  // 2. Mock LLM: extract skills from CV text (case‑insensitive substring match)
  async extractSkillsFromCV(employeeId: string) {
    const employee = await this.employeeRepo.findOne({
    where: { employeeId },
    relations: { jobRole: true },          // fixed
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const allSkills = await this.skillRepo.find();
    const cvLower = employee.cvText.toLowerCase();

    const matchedSkills: Skill[] = [];
    for (const skill of allSkills) {
      if (cvLower.includes(skill.name.toLowerCase())) {
        matchedSkills.push(skill);
      }
    }

    // Save EmployeeSkill entries (avoid duplicates)
    for (const skill of matchedSkills) {
      const exists = await this.employeeSkillRepo.findOne({
        where: { employee: { id: employee.id }, skill: { id: skill.id } },
      });
      if (!exists) {
        const empSkill = this.employeeSkillRepo.create({
          employee,
          skill,
        });
        await this.employeeSkillRepo.save(empSkill);
      }
    }

    return { extracted: matchedSkills.map(s => s.name) };
  }

  // 3. Get employee skills (names)
  async getEmployeeSkills(employeeId: string) {
    const employee = await this.employeeRepo.findOne({
    where: { employeeId },
    relations: { employeeSkills: { skill: true } },  // fixed
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee.employeeSkills.map(es => es.skill.name);
  }

  // 4. Portfolio generation (core algorithm)
  async generatePortfolio(employeeId: string, threshold: number) {
    const employee = await this.employeeRepo.findOne({
    where: { employeeId },
    relations: { jobRole: true, employeeSkills: { skill: true } }, // fixed
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const employeeSkills = employee.employeeSkills.map(es => es.skill.name);
    const currentField = employee.jobRole.field;

    // Same‑field vacancies
    const sameFieldVacancies = await this.vacanciesService.findByField(currentField);
    let matches: any[] = [];

    for (const vacancy of sameFieldVacancies) {
      const requiredSkills = await this.vacanciesService.getRequiredSkillNames(vacancy.id);
      const overlap = requiredSkills.filter(skill => employeeSkills.includes(skill));
      const matchPercent = (overlap.length / requiredSkills.length) * 100;
      matches.push({
        vacancy,
        matchPercent,
        matchingSkills: overlap,
        missingSkills: requiredSkills.filter(skill => !employeeSkills.includes(skill)),
      });
    }

    if (matches.length > 0) {
      matches.sort((a, b) => b.matchPercent - a.matchPercent);
      return {
        employeeName: employee.name,
        currentJob: employee.jobRole.title,
        type: 'same-field',
        matches,
      };
    }

    // Cross‑role (only non‑high‑risk vacancies)
    const crossVacancies = await this.vacanciesService.findAllNonHighRisk();
    const crossMatches: any[] = [];

    for (const vacancy of crossVacancies) {
      const requiredSkills = await this.vacanciesService.getRequiredSkillNames(vacancy.id);
      const overlap = requiredSkills.filter(skill => employeeSkills.includes(skill));
      const matchPercent = (overlap.length / requiredSkills.length) * 100;
      if (matchPercent >= threshold) {
        crossMatches.push({
          vacancy,
          matchPercent,
          matchingSkills: overlap,
          missingSkills: requiredSkills.filter(skill => !employeeSkills.includes(skill)),
        });
      }
    }

    crossMatches.sort((a, b) => b.matchPercent - a.matchPercent);
    return {
      employeeName: employee.name,
      currentJob: employee.jobRole.title,
      type: 'cross-role',
      matches: crossMatches,
    };
  }
}