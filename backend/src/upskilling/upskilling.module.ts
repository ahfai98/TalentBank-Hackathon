import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpskillingService } from './upskilling.service';
import { UpskillingController } from './upskilling.controller';
import { UpskillingCourse } from '../entities/upskilling-course.entity';
import { Skill } from '../entities/skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UpskillingCourse, Skill])],
  providers: [UpskillingService],
  controllers: [UpskillingController],
  exports: [UpskillingService],
})
export class UpskillingModule {}