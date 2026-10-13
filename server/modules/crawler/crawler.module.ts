import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CrawlerService } from './crawler.service';
import { CrawlLogService } from './crawl-log.service';
import { CrawlerSchedulerService } from './crawler-scheduler.service';
import { CrawlerController } from './crawler.controller';
import { AiJobExtractorService } from './ai-job-extractor.service';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [HttpModule.register({ timeout: 15000 }), JobsModule],
  providers: [CrawlerService, CrawlLogService, CrawlerSchedulerService, AiJobExtractorService],
  controllers: [CrawlerController],
  exports: [CrawlerService],
})
export class CrawlerModule {}
