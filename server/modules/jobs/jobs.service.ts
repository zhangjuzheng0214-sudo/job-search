import { Injectable } from '@nestjs/common';
import { JobRepository } from './job.repository';
import type {
  JobDetail,
  JobListRequest,
  JobListResponse,
  PositionListResponse,
  PositionItem,
} from '@shared/api.interface';

@Injectable()
export class JobsService {
  constructor(private readonly jobRepository: JobRepository) {}

  async getList(params: JobListRequest): Promise<JobListResponse> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const result = await this.jobRepository.getList({
      ...params,
      page,
      pageSize,
    });
    return {
      items: result.items,
      total: result.total,
      page,
      pageSize,
    };
  }

  async getDetail(id: string): Promise<JobDetail | null> {
    return this.jobRepository.getDetail(id);
  }

  async getProvinces(): Promise<string[]> {
    return this.jobRepository.getProvinces();
  }

  async getCities(province: string): Promise<string[]> {
    return this.jobRepository.getCities(province);
  }

  async getActivePositions(limit: number): Promise<PositionListResponse> {
    const result = await this.jobRepository.getActivePositions(limit);
    const items: PositionItem[] = result.items.map((p) => ({
      id: p.id,
      positionName: p.position,
      count: p.count,
      education: p.education || '不限',
      major: p.hardMajor || p.major || '不限',
      ageRequirement: p.ageRequirement ?? null,
      hardRequirements: p.hardRequirements ?? p.otherRequirements ?? null,
      jobId: p.jobId,
      jobTitle: p.jobTitle ?? '',
      organization: p.organization ?? '',
      source: p.source ?? '',
      sourceUrl: p.sourceUrl ?? '',
      deadline: p.deadline ? p.deadline.toISOString() : '',
      publishDate: p.publishDate ? p.publishDate.toISOString() : '',
    }));
    return { items, total: Number(result.total) };
  }
}
