import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { JobRepository } from '../jobs/job.repository';
import type { CrawlAllResult } from './types';

@Injectable()
export class CrawlerSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(CrawlerSchedulerService.name);
  private isRunning = false;
  private lastResult: CrawlAllResult | null = null;

  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly jobRepository: JobRepository,
  ) {}

  onModuleInit(): void {
    void this.ensureDailyCrawl();
    setInterval(() => {
      void this.ensureDailyCrawl();
    }, 60 * 60 * 1000);
  }

  private async ensureDailyCrawl(): Promise<void> {
    const lastCrawl = await this.jobRepository.getLastCrawlTime();
    const now = new Date();
    const hoursSinceLast = lastCrawl
      ? (now.getTime() - lastCrawl.getTime()) / (1000 * 60 * 60)
      : Infinity;

    if (hoursSinceLast >= 24 && !this.isRunning) {
      this.logger.log(
        lastCrawl
          ? `距上次采集 ${hoursSinceLast.toFixed(1)} 小时，触发补跑`
          : '无采集历史，启动首次采集',
      );
      try {
        await this.runCrawl();
      } catch (err) {
        this.logger.error('定时补跑失败', err as Error);
      }
    }
  }

  async runCrawl(): Promise<{ started: boolean; result?: CrawlAllResult; message?: string }> {
    if (this.isRunning) {
      this.logger.warn('已有采集任务在运行，跳过');
      return { started: false, message: '采集任务正在运行中' };
    }
    this.isRunning = true;
    try {
      const result = await this.crawlerService.crawlAllSources();
      this.lastResult = result;
      await this.jobRepository.markExpiredJobs();
      return { started: true, result };
    } finally {
      this.isRunning = false;
    }
  }

  getStatus(): {
    isRunning: boolean;
    lastResult: CrawlAllResult | null;
  } {
    return {
      isRunning: this.isRunning,
      lastResult: this.lastResult,
    };
  }
}
