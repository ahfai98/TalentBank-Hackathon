import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('high-risk')
  async getHighRisk() {
    return this.employeesService.getHighRiskEmployees();
  }

  @Post(':id/extract-skills')
  async extractSkills(@Param('id') id: string) {
    return this.employeesService.extractSkillsFromCV(id);
  }

  @Get(':id/skills')
  async getSkills(@Param('id') id: string) {
    return this.employeesService.getEmployeeSkills(id);
  }

  @Get(':id/portfolio')
  async getPortfolio(
    @Param('id') id: string,
    @Query('threshold') threshold?: string,
  ) {
    const thr = threshold ? parseInt(threshold, 10) : 60;
    return this.employeesService.generatePortfolio(id, thr);
  }
}