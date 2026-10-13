import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import { eq, and, or, like, desc, asc, gte, lt, sql, inArray, isNull } from 'drizzle-orm';
import { jobs, positions, crawlLogs } from '@server/database/schema';
import type {
  JobDetail,
  JobItem,
  JobListRequest,
  JobType,
} from '@shared/api.interface';

export interface UpsertJobData {
  sourceUrl: string;
  title: string;
  organization: string;
  type: JobType;
  location: string;
  province: string;
  city: string;
  education?: string;
  recruitCount: number;
  publishDate: Date | null;
  deadline: Date | null;
  isLongTerm: boolean;
  source: string;
  description: string;
  requirements?: string[];
  benefits?: string[];
  applicationUrl?: string;
  positions: { position: string; major: string; education: string; count: number; responsibility?: string; otherRequirements?: string }[];
  bodyLength: number;
  hasAttachment: boolean;
  generalConditions?: string;
  applyStartDate?: Date | null;
  aiParsed?: boolean;
  categories?: string[];
}

@Injectable()
export class JobRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getList(
    params: JobListRequest,
  ): Promise<{ items: JobItem[]; total: number }> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = this.buildListConditions(params);

    let baseQuery;
    if (params.major) {
      baseQuery = this.db
        .select({ jobs })
        .from(jobs)
        .innerJoin(positions, eq(positions.jobId, jobs.id))
        .where(and(...conditions, like(positions.major, `%${params.major}%`)));
    } else {
      baseQuery = this.db.select().from(jobs).where(and(...conditions));
    }

    const orderExpr = this.buildOrderExpr(params.sortBy);

    const rows = await baseQuery
      .orderBy(orderExpr)
      .limit(pageSize)
      .offset(offset);

    const jobRows = (params.major
      ? (rows as { jobs: typeof jobs.$inferSelect }[]).map((row) => row.jobs)
      : (rows as (typeof jobs.$inferSelect)[])
    );

    const jobIds = jobRows.map((j) => j.id);
    let eduMap = new Map<string, string[]>();
    if (jobIds.length > 0) {
      const allPos = await this.db
        .select({ jobId: positions.jobId, education: positions.education })
        .from(positions)
        .where(and(
          inArray(positions.jobId, jobIds),
          sql`${positions.education} IS NOT NULL AND ${positions.education} <> ''`,
        ));
      for (const p of allPos) {
        const edu = p.education ?? '';
        if (!edu) continue;
        if (!eduMap.has(p.jobId)) eduMap.set(p.jobId, []);
        const arr = eduMap.get(p.jobId)!;
        if (!arr.includes(edu)) arr.push(edu);
      }
    }

    const items = jobRows.map((job) => this.mapJobToItem(job, eduMap.get(job.id)));

    const total = await this.countWithConditions(params, conditions);

    return { items, total };
  }

  async getDetail(id: string): Promise<JobDetail | null> {
    const [job] = await this.db.select().from(jobs).where(eq(jobs.id, id));
    if (!job) return null;

    const posList = await this.db
      .select()
      .from(positions)
      .where(eq(positions.jobId, id))
      .orderBy(asc(positions.sortOrder), asc(positions.id));

    const eduLevels = posList
      .map((p) => p.education)
      .filter((e): e is string => !!e);

    return {
      ...this.mapJobToItem(job, eduLevels),
      description: job.description ?? '',
      requirements: job.requirements ?? [],
      benefits: job.benefits ?? [],
      applicationUrl: job.applicationUrl ?? undefined,
      generalConditions: job.generalConditions ?? undefined,
      applyStartTime: job.applyStartDate ? job.applyStartDate.toISOString() : undefined,
      positions: posList.map((p) => ({
        position: p.position,
        major: p.major ?? '',
        education: p.education ?? '',
        count: p.count,
        responsibility: p.responsibility ?? '',
        otherRequirements: p.otherRequirements ?? '',
        ageRequirement: p.ageRequirement ?? null,
        hardMajor: p.hardMajor ?? null,
        hardRequirements: p.hardRequirements ?? null,
      })),
    };
  }

  async getProvinces(): Promise<string[]> {
    const rows = await this.db
      .select({ province: jobs.province })
      .from(jobs)
      .where(and(eq(jobs.status, 'active'), sql`${jobs.province} IS NOT NULL`))
      .groupBy(jobs.province)
      .orderBy(asc(jobs.province));
    return rows.map((r) => r.province).filter((p): p is string => p !== null);
  }

  async getCities(province: string): Promise<string[]> {
    const rows = await this.db
      .select({ city: jobs.city })
      .from(jobs)
      .where(
        and(
          eq(jobs.status, 'active'),
          eq(jobs.province, province),
          sql`${jobs.city} IS NOT NULL`,
        ),
      )
      .groupBy(jobs.city)
      .orderBy(asc(jobs.city));
    return rows.map((r) => r.city).filter((c): c is string => c !== null);
  }

  async upsertJob(
    data: UpsertJobData,
  ): Promise<{ isNew: boolean; jobId: string }> {
    const now = new Date();

    const result = await this.db
      .insert(jobs)
      .values({
        sourceUrl: data.sourceUrl,
        title: data.title,
        organization: data.organization,
        type: data.type,
        location: data.location,
        province: data.province,
        city: data.city,
        education: data.education,
        recruitCount: data.recruitCount,
        publishDate: data.publishDate,
        deadline: data.deadline,
        isLongTerm: data.isLongTerm,
        source: data.source,
        description: data.description,
        requirements: data.requirements ?? [],
        benefits: data.benefits ?? [],
        applicationUrl: data.applicationUrl,
        status: 'active',
        crawledAt: now,
        bodyLength: data.bodyLength,
        hasAttachment: data.hasAttachment,
        generalConditions: data.generalConditions ?? null,
        applyStartDate: data.applyStartDate ?? null,
        aiParsed: data.aiParsed ?? false,
        categories: data.categories ?? [],
      })
      .onConflictDoUpdate({
        target: jobs.sourceUrl,
        set: {
          title: data.title,
          organization: data.organization,
          deadline: data.deadline,
          recruitCount: data.recruitCount,
          description: data.description,
          bodyLength: data.bodyLength,
          hasAttachment: data.hasAttachment,
          crawledAt: now,
          status: 'active',
          publishDate: data.publishDate,
          isLongTerm: data.isLongTerm,
          requirements: data.requirements ?? [],
          benefits: data.benefits ?? [],
          applicationUrl: data.applicationUrl,
          education: data.education,
          source: data.source,
          generalConditions: data.generalConditions ?? null,
          applyStartDate: data.applyStartDate ?? null,
          aiParsed: data.aiParsed ?? false,
          categories: data.categories ?? [],
        },
      })
      .returning({ id: jobs.id, createdAt: jobs.createdAt, updatedAt: jobs.updatedAt });

    const jobId = result[0].id;
    const isNew =
      result[0].createdAt.getTime() === result[0].updatedAt?.getTime();

    await this.db.delete(positions).where(eq(positions.jobId, jobId));

    if (data.positions.length > 0) {
      await this.db.insert(positions).values(
        data.positions.map((p, idx) => ({
          jobId,
          position: p.position,
          major: p.major || null,
          education: p.education || null,
          count: p.count,
          sortOrder: idx,
          responsibility: p.responsibility || null,
          otherRequirements: p.otherRequirements || null,
        })),
      );
    }

    return { isNew, jobId };
  }

  async countAll(): Promise<number> {
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(jobs);
    return Number(count);
  }

  async findAllForReparse(limit = 200): Promise<{ id: string; sourceUrl: string; title: string; isLongTerm: boolean; publishDate: Date | null }[]> {
    const rows = await this.db
      .select({ id: jobs.id, sourceUrl: jobs.sourceUrl, title: jobs.title, isLongTerm: jobs.isLongTerm, publishDate: jobs.publishDate })
      .from(jobs)
      .orderBy(desc(jobs.publishDate))
      .limit(limit);
    return rows;
  }

  async updateAiParsedResult(
    id: string,
    data: {
      positions: { position: string; major: string; education: string; count: number; responsibility?: string; otherRequirements?: string }[];
      recruitCount: number;
      deadline?: Date | null;
      applyStartDate?: Date | null;
      generalConditions?: string;
      status?: string;
      isLongTerm?: boolean;
      categories?: string[];
    },
  ): Promise<void> {
    const patch: Partial<typeof jobs.$inferInsert> = {
      recruitCount: data.recruitCount,
      generalConditions: data.generalConditions ?? null,
      aiParsed: true,
    };
    if (data.deadline !== undefined) patch.deadline = data.deadline;
    if (data.applyStartDate !== undefined) patch.applyStartDate = data.applyStartDate;
    if (data.status) patch.status = data.status;
    if (data.isLongTerm !== undefined) patch.isLongTerm = data.isLongTerm;
    if (data.categories) patch.categories = data.categories;
    await this.db.update(jobs)
      .set(patch)
      .where(eq(jobs.id, id));

    await this.db.delete(positions).where(eq(positions.jobId, id));

    if (data.positions.length > 0) {
      await this.db.insert(positions).values(
        data.positions.map((p, idx) => ({
          jobId: id,
          position: p.position,
          major: p.major || null,
          education: p.education || null,
          count: p.count,
          sortOrder: idx,
          responsibility: p.responsibility || null,
          otherRequirements: p.otherRequirements || null,
        })),
      );
    }
  }

  async markExpiredJobs(): Promise<number> {
    const now = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const result = await this.db
      .update(jobs)
      .set({ status: 'expired' })
      .where(
        and(
          eq(jobs.status, 'active'),
          or(
            and(
              sql`${jobs.deadline} IS NOT NULL`,
              lt(jobs.deadline, now),
            ),
            and(
              sql`${jobs.deadline} IS NULL`,
              eq(jobs.isLongTerm, false),
              lt(jobs.publishDate, ninetyDaysAgo),
            ),
          ),
        ),
      )
      .returning({ id: jobs.id });
    return result.length;
  }

  async getLastCrawlTime(): Promise<Date | null> {
    const [latest] = await this.db
      .select({ startedAt: crawlLogs.startedAt })
      .from(crawlLogs)
      .where(eq(crawlLogs.status, 'completed'))
      .orderBy(desc(crawlLogs.startedAt))
      .limit(1);
    return latest?.startedAt ?? null;
  }

  private buildListConditions(params: JobListRequest) {
    const conditions = [];

    if (params.type) {
      conditions.push(eq(jobs.type, params.type));
    }
    if (params.province) {
      conditions.push(eq(jobs.province, params.province));
    }
    if (params.city) {
      conditions.push(eq(jobs.city, params.city));
    }
    if (params.education) {
      const rankMap: Record<string, number> = {
        'unlimited': 0,
        'junior-college': 1,
        'bachelor': 2,
        'master': 3,
        'phd': 4,
      };
      const myRank = rankMap[params.education] ?? 0;
      const eligibleValues = Object.entries(rankMap)
        .filter(([, rank]) => rank <= myRank)
        .map(([val]) => val);
      conditions.push(
        or(
          inArray(jobs.education, eligibleValues),
          isNull(jobs.education),
          eq(jobs.education, ''),
        ),
      );
    }
    if (params.keyword) {
      const hasPositionMatch = sql`EXISTS (
        SELECT 1 FROM ${positions}
        WHERE ${positions.jobId} = ${jobs.id}
          AND ${positions.position} ILIKE ${`%${params.keyword}%`}
      )`;
      conditions.push(
        or(
          like(jobs.title, `%${params.keyword}%`),
          like(jobs.organization, `%${params.keyword}%`),
          hasPositionMatch,
        ),
      );
    }
    if (params.publishDays && params.publishDays > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - params.publishDays);
      conditions.push(gte(jobs.publishDate, cutoff));
    }
    if (params.onlyHiring) {
      const now = new Date();
      conditions.push(
        and(
          eq(jobs.status, 'active'),
          gte(jobs.deadline, now),
        ),
      );
    }
    if (params.excludeCategories && params.excludeCategories.length > 0) {
      const placeholders = sql.join(
        params.excludeCategories.map((c) => sql`${c}`),
        sql`, `,
      );
      conditions.push(
        sql`NOT (${jobs.categories} && ARRAY[${placeholders}]::text[])`,
      );
    }

    return conditions;
  }

  private countWithConditions(
    params: JobListRequest,
    conditions: ReturnType<typeof this.buildListConditions>,
  ): Promise<number> {
    if (params.major) {
      return this.db
        .select({ count: sql<number>`count(DISTINCT ${jobs.id})` })
        .from(jobs)
        .innerJoin(positions, eq(positions.jobId, jobs.id))
        .where(and(...conditions, like(positions.major, `%${params.major}%`)))
        .then((rows) => rows[0]?.count ?? 0);
    }
    return this.db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(and(...conditions))
      .then((rows) => rows[0]?.count ?? 0);
  }

  private buildOrderExpr(sortBy?: 'deadline' | 'recruitCount') {
    if (sortBy === 'recruitCount') {
      return desc(jobs.recruitCount);
    }
    return sql`CASE WHEN ${jobs.deadline} IS NULL THEN 1 ELSE 0 END, ${jobs.deadline} ASC`;
  }

  private mapJobToItem(job: typeof jobs.$inferSelect, eduLevels?: string[]): JobItem {
    let levels: string[] = eduLevels ?? [];
    if (levels.length === 0 && job.education) {
      levels = [job.education];
    }
    const rankMap: Record<string, number> = {
      'junior-college': 1,
      'bachelor': 2,
      'master': 3,
      'phd': 4,
      'unlimited': 0,
    };
    const sortedLevels = [...levels]
      .filter((e) => rankMap[e] !== undefined)
      .sort((a, b) => rankMap[a] - rankMap[b]) as JobItem['educationLevels'];
    return {
      id: job.id,
      title: job.title,
      organization: job.organization,
      type: job.type as JobType,
      location: job.location ?? '',
      province: job.province ?? '',
      city: job.city ?? '',
      education: (job.education as JobItem['education']) ?? 'unlimited',
      educationLevels: sortedLevels,
      recruitCount: job.recruitCount,
      publishDate: job.publishDate ? job.publishDate.toISOString() : '',
      deadline: job.deadline ? job.deadline.toISOString() : '',
      source: job.source ?? '',
      sourceUrl: job.sourceUrl,
      isLongTerm: job.isLongTerm,
      categories: job.categories ?? [],
    };
  }

  async getActivePositions(
    limit: number,
  ): Promise<{ items: Array<typeof positions.$inferSelect & {
      jobTitle: string;
      organization: string;
      source: string | null;
      sourceUrl: string;
      deadline: Date | null;
      publishDate: Date | null;
    }>; total: number }> {
    const now = new Date();
    const rows = await this.db
      .select({
        positions: positions,
        jobTitle: jobs.title,
        organization: jobs.organization,
        source: jobs.source,
        sourceUrl: jobs.sourceUrl,
        deadline: jobs.deadline,
        publishDate: jobs.publishDate,
      })
      .from(positions)
      .innerJoin(jobs, eq(jobs.id, positions.jobId))
      .where(
        and(
          eq(jobs.status, 'active'),
          gte(jobs.deadline, now),
        ),
      )
      .orderBy(asc(jobs.deadline), asc(positions.sortOrder))
      .limit(limit);

    const items = rows.map((r) => ({
      ...r.positions,
      jobTitle: r.jobTitle,
      organization: r.organization,
      source: r.source,
      sourceUrl: r.sourceUrl,
      deadline: r.deadline,
      publishDate: r.publishDate,
    }));

    const totalResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(positions)
      .innerJoin(jobs, eq(jobs.id, positions.jobId))
      .where(
        and(
          eq(jobs.status, 'active'),
          gte(jobs.deadline, now),
        ),
      );

    return { items, total: totalResult[0]?.count ?? 0 };
  }
}
