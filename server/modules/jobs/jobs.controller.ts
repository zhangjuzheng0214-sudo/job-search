import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import type {
  JobDetail,
  JobListResponse,
  JobType,
  EducationLevel,
  PositionListResponse,
} from '@shared/api.interface';

@Controller('api/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async getList(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('type') type?: JobType,
    @Query('province') province?: string,
    @Query('city') city?: string,
    @Query('education') education?: EducationLevel,
    @Query('keyword') keyword?: string,
    @Query('major') major?: string,
    @Query('publishDays') publishDays?: string,
    @Query('sortBy') sortBy?: 'deadline' | 'recruitCount',
    @Query('onlyHiring') onlyHiring?: string,
    @Query('excludeCategories') excludeCategories?: string,
  ): Promise<JobListResponse> {
    return this.jobsService.getList({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      type,
      province,
      city,
      education,
      keyword,
      major,
      publishDays: publishDays ? parseInt(publishDays, 10) : undefined,
      sortBy,
      onlyHiring: onlyHiring === 'true',
      excludeCategories: excludeCategories
        ? excludeCategories.split(',').filter(Boolean)
        : undefined,
    });
  }

  @Get('positions')
  async getActivePositions(
    @Query('limit') limit?: string,
  ): Promise<PositionListResponse> {
    return this.jobsService.getActivePositions(limit ? parseInt(limit, 10) : 500);
  }

  @Get('provinces')
  async getProvinces(): Promise<string[]> {
    return this.jobsService.getProvinces();
  }

  @Get('cities')
  async getCities(@Query('province') province: string): Promise<string[]> {
    return this.jobsService.getCities(province);
  }

  @Get(':id')
  async getDetail(@Param('id') id: string): Promise<JobDetail> {
    const job = await this.jobsService.getDetail(id);
    if (!job) {
      throw new NotFoundException('岗位不存在');
    }
    return job;
  }
}
