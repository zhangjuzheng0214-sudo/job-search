/* eslint-disable */
/** auto generated, do not edit */
import { sql } from 'drizzle-orm';
import { boolean, foreignKey, index, integer, pgTable, text, uniqueIndex, uuid, varchar, customType } from "drizzle-orm/pg-core"

export const customTimestamptz = customType<{
  data: Date;
  driverData: string;
  config: { precision?: number };
}>({
  dataType(config) {
    const precision = typeof config?.precision !== 'undefined'
      ? ` (${config.precision})`
      : '';
    return `timestamptz${precision}`;
  },
  toDriver(value: Date | string | number) {
    if (value == null) return value as any;
    if (typeof value === 'number') return new Date(value).toISOString();
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toISOString();
    throw new Error('Invalid timestamp value');
  },
  fromDriver(value: string | Date): Date {
    if (value instanceof Date) return value;
    return new Date(value);
  },
});

export const userProfile = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return 'user_profile';
  },
  toDriver(value: string) {
    return sql`ROW(${value})::user_profile`;
  },
  fromDriver(value: string) {
    const [userId] = value.slice(1, -1).split(',');
    return userId.trim();
  },
});

export type FileAttachment = {
  bucket_id: string;
  file_path: string;
};

export const fileAttachment = customType<{
  data: FileAttachment;
  driverData: string;
}>({
  dataType() {
    return 'file_attachment';
  },
  toDriver(value: FileAttachment) {
    return sql`ROW(${value.bucket_id},${value.file_path})::file_attachment`;
  },
  fromDriver(value: string): FileAttachment {
    const [bucketId, filePath] = value.slice(1, -1).split(',');
    return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
  },
});

export function escapeLiteral(str: string): string {
  return "'" + str.replace(/'/g, "''") + "'";
}

export const userProfileArray = customType<{
  data: string[];
  driverData: string;
}>({
  dataType() {
    return 'user_profile[]';
  },
  toDriver(value: string[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::user_profile[]`;
    }
    const elements = value.map(id => `ROW(${escapeLiteral(id)})::user_profile`).join(',');
    return sql.raw(`ARRAY[${elements}]::user_profile[]`);
  },
  fromDriver(value: string): string[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => m.slice(1, -1).split(',')[0].trim());
  },
});

export const fileAttachmentArray = customType<{
  data: FileAttachment[];
  driverData: string;
}>({
  dataType() {
    return 'file_attachment[]';
  },
  toDriver(value: FileAttachment[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::file_attachment[]`;
    }
    const elements = value.map(f =>
      `ROW(${escapeLiteral(f.bucket_id)},${escapeLiteral(f.file_path)})::file_attachment`
    ).join(',');
    return sql.raw(`ARRAY[${elements}]::file_attachment[]`);
  },
  fromDriver(value: string): FileAttachment[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => {
      const [bucketId, filePath] = m.slice(1, -1).split(',');
      return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
    });
  },
});

export const crawlLogs = pgTable("crawl_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceName: varchar("source_name", { length: 128 }).notNull(),
  startedAt: customTimestamptz("started_at", { precision: 6 }).notNull(),
  endedAt: customTimestamptz("ended_at", { precision: 6 }),
  status: varchar("status", { length: 32 }).notNull().default('running'),
  newCount: integer("new_count").notNull().default(0),
  updatedCount: integer("updated_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  totalCount: integer("total_count").notNull().default(0),
  errorMessage: text("error_message"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_crawl_logs_started_at").on(table.startedAt),
]);

export const positions = pgTable("positions", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull(),
  position: varchar("position", { length: 256 }).notNull(),
  major: text("major"),
  education: varchar("education", { length: 100 }),
  count: integer("count").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  responsibility: text("responsibility"),
  otherRequirements: text("other_requirements"),
  ageRequirement: varchar("age_requirement", { length: 100 }),
  hardMajor: text("hard_major"),
  hardRequirements: text("hard_requirements"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  index("idx_positions_job_id").on(table.jobId),
  foreignKey({
    columns: [table.jobId],
    foreignColumns: [jobs.id],
    name: "positions_job_id_fkey",
  }).onDelete("cascade"),
]);

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceUrl: varchar("source_url", { length: 2048 }).notNull().unique(),
  title: varchar("title", { length: 512 }).notNull(),
  organization: varchar("organization", { length: 256 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  location: varchar("location", { length: 256 }),
  province: varchar("province", { length: 64 }),
  city: varchar("city", { length: 64 }),
  education: varchar("education", { length: 50 }),
  recruitCount: integer("recruit_count").notNull().default(0),
  publishDate: customTimestamptz("publish_date", { precision: 6 }),
  deadline: customTimestamptz("deadline", { precision: 6 }),
  isLongTerm: boolean("is_long_term").notNull().default(false),
  source: varchar("source", { length: 128 }),
  description: text("description"),
  requirements: text("requirements").array().default([]),
  benefits: text("benefits").array().default([]),
  applicationUrl: varchar("application_url", { length: 2048 }),
  status: varchar("status", { length: 32 }).notNull().default('active'),
  crawledAt: customTimestamptz("crawled_at", { precision: 6 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  bodyLength: integer("body_length").default(0),
  hasAttachment: boolean("has_attachment").notNull().default(false),
  generalConditions: text("general_conditions"),
  applyStartDate: customTimestamptz("apply_start_date", { precision: 6 }),
  aiParsed: boolean("ai_parsed").notNull().default(false),
  categories: text("categories").array().notNull().default([]),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  uniqueIndex("jobs_source_url_key").on(table.sourceUrl),
  index("idx_jobs_type").on(table.type),
  index("idx_jobs_status").on(table.status),
  index("idx_jobs_deadline").on(table.deadline),
  index("idx_jobs_publish_date").on(table.publishDate),
  index("idx_jobs_province").on(table.province),
  index("idx_jobs_city").on(table.city),
  index("idx_jobs_education").on(table.education),
  index("idx_jobs_categories").using("gin", table.categories),
]);

// table aliases
export const crawlLogsTable = crawlLogs;
export const jobsTable = jobs;
export const positionsTable = positions;
