export interface RawJobItem {
  url: string;
  title: string;
  publishDate?: string;
}

export interface ParsedJobDetail {
  title: string;
  organization: string;
  publishDate: Date | null;
  deadline: Date | null;
  isLongTerm: boolean;
  recruitCount: number;
  description: string;
  applyConditions: string[];
  positions: { position: string; major: string; education: string; count: number; responsibility?: string; otherRequirements?: string }[];
  bodyLength: number;
  hasAttachment: boolean;
  generalConditions?: string;
  applyStartDate?: Date | null;
  aiParsed?: boolean;
}

export interface CrawlSourceResult {
  newCount: number;
  updatedCount: number;
  failedCount: number;
  skippedCount: number;
  total: number;
}

export interface CrawlAllResult {
  total: number;
  newCount: number;
  updatedCount: number;
  failedCount: number;
  skippedCount: number;
  logs: { source: string; newCount: number; updatedCount: number; failedCount: number; skippedCount: number }[];
}

export interface UpsertResult {
  isNew: boolean;
}
