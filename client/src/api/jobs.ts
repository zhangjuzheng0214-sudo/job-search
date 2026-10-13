import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  JobListRequest,
  JobListResponse,
  JobDetail,
  PositionListResponse,
} from '@shared/api.interface';

export async function getJobList(params: JobListRequest): Promise<JobListResponse> {
  const response = await axiosForBackend.get('/api/jobs', { params });
  return response.data;
}

export async function getJobDetail(id: string): Promise<JobDetail> {
  const response = await axiosForBackend.get(`/api/jobs/${id}`);
  return response.data;
}

export async function getActivePositions(limit: number = 500): Promise<PositionListResponse> {
  const response = await axiosForBackend.get('/api/jobs/positions', { params: { limit } });
  return response.data;
}

export async function getProvinces(): Promise<string[]> {
  const response = await axiosForBackend.get('/api/jobs/provinces');
  return response.data;
}

export async function getCities(province: string): Promise<string[]> {
  const response = await axiosForBackend.get('/api/jobs/cities', {
    params: { province },
  });
  return response.data;
}

export interface CrawlStatus {
  isRunning: boolean;
  lastCrawlTime: string | null;
  lastLog: {
    sourceName: string;
    startedAt: string;
    endedAt: string | null;
    status: string;
    newCount: number;
    updatedCount: number;
    failedCount: number;
    totalCount: number;
  } | null;
}

export async function getCrawlStatus(): Promise<CrawlStatus> {
  const response = await axiosForBackend.get('/api/crawler/status');
  return response.data;
}

export async function triggerCrawl(): Promise<void> {
  await axiosForBackend.post('/api/crawler/trigger');
}
