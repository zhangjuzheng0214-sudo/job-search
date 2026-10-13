import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import { eq, desc } from 'drizzle-orm';
import { crawlLogs } from '@server/database/schema';

export interface CrawlLog {
  id: string;
  sourceName: string;
  startedAt: Date;
  endedAt: Date | null;
  status: string;
  newCount: number;
  updatedCount: number;
  failedCount: number;
  totalCount: number;
  errorMessage: string | null;
}

@Injectable()
export class CrawlLogService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async startLog(sourceName: string): Promise<string> {
    const [row] = await this.db
      .insert(crawlLogs)
      .values({
        sourceName,
        startedAt: new Date(),
        status: 'running',
      })
      .returning({ id: crawlLogs.id });
    return row.id;
  }

  async endLog(
    logId: string,
    result: {
      newCount: number;
      updatedCount: number;
      failedCount: number;
      totalCount: number;
      status: string;
      errorMessage?: string;
    },
  ): Promise<void> {
    await this.db
      .update(crawlLogs)
      .set({
        endedAt: new Date(),
        status: result.status,
        newCount: result.newCount,
        updatedCount: result.updatedCount,
        failedCount: result.failedCount,
        totalCount: result.totalCount,
        errorMessage: result.errorMessage ?? null,
      })
      .where(eq(crawlLogs.id, logId));
  }

  async getLatest(): Promise<CrawlLog | null> {
    const [row] = await this.db
      .select()
      .from(crawlLogs)
      .where(eq(crawlLogs.status, 'completed'))
      .orderBy(desc(crawlLogs.startedAt))
      .limit(1);
    if (!row) return null;
    return {
      id: row.id,
      sourceName: row.sourceName,
      startedAt: row.startedAt,
      endedAt: row.endedAt,
      status: row.status,
      newCount: row.newCount,
      updatedCount: row.updatedCount,
      failedCount: row.failedCount,
      totalCount: row.totalCount,
      errorMessage: row.errorMessage,
    };
  }
}
