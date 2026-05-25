import { Controller, Get, Param } from '@nestjs/common';
import { UpskillingService } from './upskilling.service';

@Controller('upskilling')
export class UpskillingController {
  constructor(private readonly upskillingService: UpskillingService) {}

  @Get('skill/:skillName')
  async getCourseForSkill(@Param('skillName') skillName: string) {
    const course = await this.upskillingService.getCourseBySkillName(skillName);
    if (!course) {
      return { message: 'No course found for this skill' };
    }
    return course;
  }
}