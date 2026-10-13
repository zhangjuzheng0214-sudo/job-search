import { Controller, Get, Post } from '@nestjs/common';
import { CrawlerSchedulerService } from './crawler-scheduler.service';
import { CrawlLogService } from './crawl-log.service';
import { JobRepository } from '../jobs/job.repository';
import { CrawlerService } from './crawler.service';
import type { CrawlAllResult } from './types';

interface CrawlerStatusResponse {
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
  lastResult: CrawlAllResult | null;
  reparseRunning: boolean;
  reparseTotal: number;
  reparseDone: number;
}

@Controller('api/crawler')
export class CrawlerController {
  constructor(
    private readonly schedulerService: CrawlerSchedulerService,
    private readonly crawlLogService: CrawlLogService,
    private readonly jobRepository: JobRepository,
    private readonly crawlerService: CrawlerService,
  ) {}

  @Post('trigger')
  async trigger(): Promise<{ message: string }> {
    void this.schedulerService.runCrawl();
    return { message: '采集任务已启动' };
  }

  @Post('reparse')
  async reparseAll(): Promise<{ message: string; total: number }> {
    const count: number = await this.jobRepository.countAll();
    void this.crawlerService.reparseAllWithAI();
    return { message: `已启动对 ${count} 条公告的 AI 重新解析`, total: count };
  }

  @Get('status')
  async getStatus(): Promise<CrawlerStatusResponse> {
    const status = this.schedulerService.getStatus();
    const lastLog = await this.crawlLogService.getLatest();
    const lastCrawlTime = await this.jobRepository.getLastCrawlTime();
    const reparseStatus = this.crawlerService.getReparseStatus();

    return {
      isRunning: status.isRunning,
      lastCrawlTime: lastCrawlTime ? lastCrawlTime.toISOString() : null,
      lastLog: lastLog
        ? {
            sourceName: lastLog.sourceName,
            startedAt: lastLog.startedAt.toISOString(),
            endedAt: lastLog.endedAt ? lastLog.endedAt.toISOString() : null,
            status: lastLog.status,
            newCount: lastLog.newCount,
            updatedCount: lastLog.updatedCount,
            failedCount: lastLog.failedCount,
            totalCount: lastLog.totalCount,
          }
        : null,
      lastResult: status.lastResult,
      reparseRunning: reparseStatus.running,
      reparseTotal: reparseStatus.total,
      reparseDone: reparseStatus.done,
    };
  }
}
