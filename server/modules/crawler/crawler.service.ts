import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CRAWL_SOURCES, type CrawlSource } from './sources';
import { JobRepository, type UpsertJobData } from '../jobs/job.repository';
import { CrawlLogService } from './crawl-log.service';
import { AiJobExtractorService } from './ai-job-extractor.service';
import type {
  CrawlAllResult,
  CrawlSourceResult,
  ParsedJobDetail,
  RawJobItem,
  UpsertResult,
} from './types';
import type { JobType } from '@shared/api.interface';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

const ARTICLE_URL_PATTERN =
  /\/col\/col\d+\/art\/\d{4}\/art_[a-f0-9]{32}\.html/;

const ARTICLE_DETAIL_INTERVAL = 500;
const LIST_RETRY_MAX = 2;
const LIST_RETRY_DELAY = 2000;

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly jobRepository: JobRepository,
    private readonly crawlLogService: CrawlLogService,
    private readonly aiJobExtractor: AiJobExtractorService,
  ) {}

  async crawlAllSources(): Promise<CrawlAllResult> {
    this.logger.log(`开始采集全部来源，共 ${CRAWL_SOURCES.length} 个`);

    const logs: CrawlAllResult['logs'] = [];
    let total = 0;
    let newCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const source of CRAWL_SOURCES) {
      try {
        const result: CrawlSourceResult = await this.crawlSource(source);
        logs.push({
          source: source.name,
          newCount: result.newCount,
          updatedCount: result.updatedCount,
          failedCount: result.failedCount,
          skippedCount: result.skippedCount,
        });
        total += result.total;
        newCount += result.newCount;
        updatedCount += result.updatedCount;
        failedCount += result.failedCount;
        skippedCount += result.skippedCount;
      } catch (err) {
        this.logger.error(`采集来源 ${source.name} 整体失败`, err as Error);
        logs.push({ source: source.name, newCount: 0, updatedCount: 0, failedCount: 0, skippedCount: 0 });
      }
    }

    this.logger.log(
      `全部采集完成：total=${total}, new=${newCount}, updated=${updatedCount}, failed=${failedCount}, skipped=${skippedCount}`,
    );
    return { total, newCount, updatedCount, failedCount, skippedCount, logs };
  }

  async crawlSource(source: CrawlSource): Promise<CrawlSourceResult> {
    this.logger.log(`[${source.name}] 开始采集`);
    const logId = await this.crawlLogService.startLog(source.name);

    let newCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    let errorMessage: string | undefined;

    try {
      const items: RawJobItem[] = await this.fetchListAllPages(source);
      this.logger.log(`[${source.name}] 列表解析到 ${items.length} 条`);

      const seenUrls = new Set<string>();
      for (let i = 0; i < items.length; i++) {
        const item: RawJobItem = items[i];
        const detailUrl: string = source.baseUrl + item.url;
        if (seenUrls.has(detailUrl)) continue;
        seenUrls.add(detailUrl);

        try {
          const html: string = await this.fetchPageWithRetry(detailUrl);
          const detail: ParsedJobDetail = await this.parseDetail(html, source);

          if (!detail.title) {
            detail.title = item.title;
          }
          if (!detail.publishDate && item.publishDate) {
            detail.publishDate = this.parseDate(item.publishDate);
          }
          if (!detail.organization) {
            detail.organization = source.defaultOrganization;
          }

          if (!this.isRecruitmentAnnouncement(detail.title, detail.description || '')) {
            skippedCount += 1;
            this.logger.log(`[${source.name}] 跳过非招聘公告: ${detail.title}`);
            continue;
          }

          const result: UpsertResult = await this.upsertJob({
            ...detail,
            sourceUrl: detailUrl,
            type: source.type,
            province: source.location.province,
            city: source.location.city,
            location: `${source.location.province}${source.location.city}`,
            source: source.sourceName,
          });
          if (result.isNew) {
            newCount += 1;
          } else {
            updatedCount += 1;
          }
        } catch (err) {
          failedCount += 1;
          this.logger.error(
            `[${source.name}] 解析/写入失败: ${detailUrl}`,
            (err as Error).stack,
          );
        }

        if (i < items.length - 1) {
          await this.sleep(ARTICLE_DETAIL_INTERVAL);
        }
      }

      this.logger.log(
        `[${source.name}] 采集完成：total=${items.length}, new=${newCount}, updated=${updatedCount}, failed=${failedCount}, skipped=${skippedCount}`,
      );

      await this.crawlLogService.endLog(logId, {
        newCount,
        updatedCount,
        failedCount,
        totalCount: items.length,
        status: 'completed',
      });

      return { newCount, updatedCount, failedCount, skippedCount, total: items.length };
    } catch (err) {
      errorMessage = (err as Error).message;
      this.logger.error(`[${source.name}] 采集整体失败`, err as Error);
      await this.crawlLogService.endLog(logId, {
        newCount,
        updatedCount,
        failedCount,
        totalCount: 0,
        status: 'failed',
        errorMessage,
      });
      throw err;
    }
  }

  // ---------- 列表页 ----------

  private async fetchListAllPages(source: CrawlSource): Promise<RawJobItem[]> {
    const maxPages = source.maxPages ?? 1;
    const allItems: RawJobItem[] = [];
    const seenUrls = new Set<string>();

    for (let page = 1; page <= maxPages; page++) {
      try {
        const items = await this.fetchListPage(source, page);
        if (items.length === 0) break;

        let newOnPage = 0;
        for (const item of items) {
          if (!seenUrls.has(item.url)) {
            seenUrls.add(item.url);
            allItems.push(item);
            newOnPage += 1;
          }
        }
        this.logger.log(
          `[${source.name}] 第${page}页获取 ${items.length} 条，新增 ${newOnPage} 条`,
        );
        if (newOnPage === 0) break;
      } catch (err) {
        this.logger.error(
          `[${source.name}] 第${page}页获取失败`,
          err instanceof Error ? err.message : String(err),
        );
        break;
      }
      if (page < maxPages) {
        await this.sleep(1000);
      }
    }
    return allItems;
  }

  private async fetchListPage(
    source: CrawlSource,
    page: number,
  ): Promise<RawJobItem[]> {
    if (source.parserType === 'static-html') {
      return this.fetchListStaticHtml(source, page);
    }
    return this.fetchListJpaas(source, page);
  }

  private async fetchListJpaas(
    source: CrawlSource,
    page: number,
  ): Promise<RawJobItem[]> {
    const params = { ...source.listParams, page: String(page) };
    let lastErr: unknown = null;

    for (let attempt = 0; attempt <= LIST_RETRY_MAX; attempt++) {
      try {
        const { data: resp } = await firstValueFrom(
          this.httpService.get(source.listApi, {
            params,
            headers: {
              'User-Agent': USER_AGENT,
              Referer: source.baseUrl,
            },
            timeout: 15000,
          }),
        );
        const html: string = resp?.data?.html ?? resp?.html ?? '';
        if (!html) {
          this.logger.warn(`[${source.name}] 列表接口返回空 HTML`);
          return [];
        }
        return this.parseList(html);
      } catch (err) {
        lastErr = err;
        if (attempt < LIST_RETRY_MAX) {
          this.logger.warn(
            `[${source.name}] 列表页第${attempt + 1}次失败，重试中...`,
            err instanceof Error ? err.message : String(err),
          );
          await this.sleep(LIST_RETRY_DELAY);
        }
      }
    }
    throw lastErr instanceof Error
      ? lastErr
      : new Error(String(lastErr ?? 'unknown error'));
  }

  private async fetchListStaticHtml(
    source: CrawlSource,
    page: number,
  ): Promise<RawJobItem[]> {
    const pattern = source.listUrlPattern || '';
    let url: string;

    if (page <= 1 || !source.listPageParam) {
      url = source.baseUrl + pattern;
    } else {
      const basePath = pattern.replace(/\.html$/, '');
      url = `${source.baseUrl}${basePath}_${page}.html`;
    }

    let lastErr: unknown = null;
    for (let attempt = 0; attempt <= LIST_RETRY_MAX; attempt++) {
      try {
        const html = await this.fetchPage(url);
        const items = this.parseList(html);
        return items;
      } catch (err) {
        lastErr = err;
        if (attempt < LIST_RETRY_MAX) {
          this.logger.warn(
            `[${source.name}] 静态列表页第${attempt + 1}次失败，重试中...`,
            err instanceof Error ? err.message : String(err),
          );
          await this.sleep(LIST_RETRY_DELAY);
        }
      }
    }
    throw lastErr instanceof Error
      ? lastErr
      : new Error(String(lastErr ?? 'unknown error'));
  }

  private parseList(html: string): RawJobItem[] {
    const items: RawJobItem[] = [];
    // 匹配所有 <a ... href="..." ... title="..." ...> 标签
    const aTagRegex = /<a\b[^>]*>/gi;
    let match: RegExpExecArray | null;

    while ((match = aTagRegex.exec(html)) !== null) {
      const tag: string = match[0];

      // 提取 href
      const hrefMatch: RegExpMatchArray | null = tag.match(
        /href\s*=\s*["']([^"']+)["']/i,
      );
      if (!hrefMatch) continue;
      const href: string = hrefMatch[1];
      if (!ARTICLE_URL_PATTERN.test(href)) continue;

      // 提取 title 属性
      const titleAttrMatch: RegExpMatchArray | null = tag.match(
        /title\s*=\s*["']([^"']+)["']/i,
      );

      // 提取 textContent（闭合标签后的文本）
      // 找到对应 </a>
      const closeIndex: number = html.indexOf('</a>', match.index + tag.length);
      let textContent = '';
      if (closeIndex !== -1) {
        textContent = html
          .slice(match.index + tag.length, closeIndex)
          .replace(/<[^>]+>/g, '')
          .trim();
      }

      const title: string = titleAttrMatch?.[1]?.trim() || textContent || '';
      if (!title) continue;

      // 在附近（a 标签前后约 200 字符内）找日期 YYYY-MM-DD
      const nearStart: number = Math.max(0, match.index - 200);
      const nearEnd: number = Math.min(
        html.length,
        (closeIndex !== -1 ? closeIndex : match.index + tag.length) + 200,
      );
      const nearText: string = html.slice(nearStart, nearEnd);
      const dateMatch: RegExpMatchArray | null = nearText.match(
        /(\d{4}-\d{2}-\d{2})/,
      );

      items.push({
        url: href,
        title,
        publishDate: dateMatch?.[1],
      });
    }

    return items;
  }

  // ---------- 详情页 ----------

  private async fetchPage(url: string): Promise<string> {
    const { data } = await firstValueFrom(
      this.httpService.get(url, {
        headers: { 'User-Agent': USER_AGENT },
        responseType: 'text',
        timeout: 15000,
      }),
    );
    return data as string;
  }

  private async fetchPageWithRetry(url: string): Promise<string> {
    let lastErr: unknown = null;
    for (let attempt = 0; attempt <= LIST_RETRY_MAX; attempt++) {
      try {
        return await this.fetchPage(url);
      } catch (err) {
        lastErr = err;
        if (attempt < LIST_RETRY_MAX) {
          await this.sleep(LIST_RETRY_DELAY);
        }
      }
    }
    throw lastErr instanceof Error
      ? lastErr
      : new Error(String(lastErr ?? 'unknown error'));
  }

  private async parseDetail(html: string, source: CrawlSource): Promise<ParsedJobDetail> {
    const result: ParsedJobDetail = {
      title: '',
      organization: source.defaultOrganization,
      publishDate: null,
      deadline: null,
      isLongTerm: false,
      recruitCount: 0,
      description: '',
      applyConditions: [],
      positions: [],
      bodyLength: 0,
      hasAttachment: false,
      generalConditions: '',
      applyStartDate: null,
      aiParsed: false,
    };

    result.title = this.extractTitle(html);
    result.publishDate = this.extractPublishDate(html);

    const bodyText: string = this.extractBodyText(html);
    result.bodyLength = bodyText.length;
    result.description = bodyText.slice(0, 1000);

    const { deadline, isLongTerm } = this.extractDeadline(bodyText, result.publishDate);
    result.deadline = deadline;
    result.isLongTerm = isLongTerm;

    result.recruitCount = this.extractRecruitCount(bodyText);

    const org: string = this.extractOrganization(html, bodyText);
    if (org) result.organization = org;

    const { conditions: applyConditions, cleanText } = this.extractApplyConditions(bodyText);
    result.applyConditions = applyConditions;
    result.description = cleanText.slice(0, 1000);

    result.positions = this.extractPositions(html, cleanText);

    if (result.recruitCount <= 0 && result.positions.length > 0) {
      const total: number = result.positions.reduce(
        (sum: number, p: { count: number }) => sum + (p.count || 0),
        0,
      );
      if (total > 0) result.recruitCount = total;
    }

    result.hasAttachment = /\.(doc|docx|xls|xlsx|pdf|rar|zip)(["'\s?]|$)/i.test(
      html,
    );

    try {
      const aiResult = await this.aiJobExtractor.extract(result.title, html);
      if (aiResult.positions.length > 0) {
        result.positions = aiResult.positions.map((p) => {
          const eduCode: string = p.education && ['phd','master','bachelor','junior-college','unlimited'].includes(p.education)
            ? p.education
            : this.inferEducationFromText(p.education);
          return {
            position: p.name,
            major: p.major,
            education: eduCode,
            count: p.count ?? 0,
            responsibility: p.responsibility,
            otherRequirements: p.otherRequirements,
          };
        });
        result.aiParsed = true;
      }
      if (aiResult.totalCount !== null && aiResult.totalCount > 0) {
        result.recruitCount = aiResult.totalCount;
        result.aiParsed = true;
      }
      if (aiResult.applyEndDate) {
        result.deadline = aiResult.applyEndDate;
        result.isLongTerm = false;
        result.aiParsed = true;
      }
      if (aiResult.applyStartDate) {
        result.applyStartDate = aiResult.applyStartDate;
        result.aiParsed = true;
      }
      if (aiResult.generalConditions) {
        result.generalConditions = aiResult.generalConditions;
        result.aiParsed = true;
      }
    } catch (aiErr) {
      this.logger.warn('AI 解析失败，使用正则解析兜底', aiErr instanceof Error ? aiErr.message : String(aiErr));
    }

    return result;
  }

  private extractTitle(html: string): string {
    // 1. <title> 标签
    const titleMatch: RegExpMatchArray | null = html.match(
      /<title[^>]*>([\s\S]*?)<\/title>/i,
    );
    let title: string = titleMatch?.[1]?.trim() || '';

    // 2. 正文 h1
    if (!title) {
      const h1Match: RegExpMatchArray | null = html.match(
        /<h1[^>]*>([\s\S]*?)<\/h1>/i,
      );
      title = h1Match?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
    }

    // 去掉前导编号（如 KT2026092903ZP0000、LT2026...）
    title = title.replace(/^[A-Z]{2}\d{10,}[A-Z]{2}\d+\s*/, '');
    title = title.replace(/^[A-Z]{2}\d{10,}\s*/, '');
    title = title.replace(/^[【\[][^】\]]+[】\]]\s*/, '');
    title = title.trim();

    // 去掉站点后缀
    title = title.replace(/[-_—]\s*宁波市[^-_—]*$/, '').trim();
    title = title.replace(/[-_—]\s*宁波市人力资源和社会保障局.*$/, '').trim();

    return title;
  }

  private extractPublishDate(html: string): Date | null {
    // 找"发布时间"、"发布日期"附近的日期
    const patterns: RegExp[] = [
      /发布时间[：:]\s*(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)/,
      /发布日期[：:]\s*(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)/,
      /信息发布[：:]\s*(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)/,
      /发布时间[^<]{0,20}?(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
    ];
    for (const re of patterns) {
      const m: RegExpMatchArray | null = html.match(re);
      if (m) {
        const d: Date | null = this.parseDate(m[1]);
        if (d) return d;
      }
    }
    return null;
  }

  private extractDeadline(
    html: string,
    publishDate: Date | null = null,
  ): {
    deadline: Date | null;
    isLongTerm: boolean;
  } {
    const longTermPatterns: RegExp[] = [
      /长期招聘/,
      /招满即止/,
      /长期有效/,
      /报名时间[：:]\s*长期/,
    ];
    const isLongTerm: boolean = longTermPatterns.some(
      (re: RegExp) => re.test(html),
    );

    const deadline = this.parseDeadlineFromText(html, publishDate);

    return { deadline, isLongTerm: isLongTerm && !deadline };
  }

  private parseDeadlineFromText(text: string, publishDate: Date | null = null): Date | null {
    // 模式1：报名时间 X 至 Y（Y 可能省略年份，可能用 —/–/- 分隔）
    const rangePatterns: RegExp[] = [
      /报名时间[：:]?\s*(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})日?\s*[至到—–\-]+\s*(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})日?/,
      /(?:报名时间|报名期限|报名起止时间|报名)[：:]?\s*(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})日?\s*[至到—–\-]+\s*(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})日?/,
      /报名时间[：:]?\s*(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})日?\s*[至到—–\-]+\s*(\d{1,2})[月\-/](\d{1,2})日?/,
      /报名时间\s+\d+\s*[：:].*?[至到—–\-]+\s*(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})日?/,
    ];
    for (const re of rangePatterns) {
      const m: RegExpMatchArray | null = text.match(re);
      if (m) {
        let year: number;
        let month: number;
        let day: number;
        if (m.length === 7) {
          // 两端都有完整年份：起年/起月/起日/止年/止月/止日
          year = parseInt(m[4], 10);
          month = parseInt(m[5], 10);
          day = parseInt(m[6], 10);
        } else if (m.length === 6) {
          // 结束日期省略了年份，用开始的年份
          year = parseInt(m[1], 10);
          month = parseInt(m[4], 10);
          day = parseInt(m[5], 10);
        } else {
          continue;
        }
        const result: Date | null = this.safeBuildDate(year, month, day);
        if (result) return result;
      }
    }

    // 模式2：明确截止日期
    const deadlinePatterns: RegExp[] = [
      /报名截止[时间日]*[：:]\s*(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)/,
      /截止时间[：:]\s*(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)/,
      /截止日期[：:]\s*(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)/,
      /报名[：:][^<]*?(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)\s*截止/,
      /(?:报名时间|报名期限|报名)[：:]?\s*[\s\S]{0,60}[至到]\s*(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})日?/,
      /(?:自|从)?(?:公告|信息)?发布(?:公告)?之日(?:起)?[至到]\s*(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})日?/,
      /网上报名时间[：:]?\s*(?:自)?(?:公告)?发布之日(?:起)?[至到]\s*(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})日?/,
      /网上报名[：:]?\s*(?:自)?(?:公告)?发布之日(?:起)?[至到]\s*(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})日?/,
    ];
    const noYearPatterns: RegExp[] = [
      /(?:自|从)?(?:公告|信息)?发布(?:公告)?之日(?:起)?[至到]\s*(\d{1,2})[月\-/](\d{1,2})日?/,
      /网上报名时间[：:]?\s*(?:自)?(?:公告)?发布之日(?:起)?[至到]\s*(\d{1,2})[月\-/](\d{1,2})日?/,
      /网上报名[：:]?\s*(?:自)?(?:公告)?发布之日(?:起)?[至到]\s*(\d{1,2})[月\-/](\d{1,2})日?/,
    ];
    for (const re of deadlinePatterns) {
      const m: RegExpMatchArray | null = text.match(re);
      if (m) {
        if (m.length === 4 && m[2] && m[3]) {
          const d: Date | null = this.safeBuildDate(
            parseInt(m[1], 10),
            parseInt(m[2], 10),
            parseInt(m[3], 10),
          );
          if (d) return d;
        } else {
          const d: Date | null = this.parseDate(m[1]);
          if (d) return d;
        }
      }
    }

    if (publishDate) {
      const year = publishDate.getFullYear();
      for (const re of noYearPatterns) {
        const m: RegExpMatchArray | null = text.match(re);
        if (m) {
          const d: Date | null = this.safeBuildDate(
            year,
            parseInt(m[1], 10),
            parseInt(m[2], 10),
          );
          if (d) return d;
        }
      }
    }

    return null;
  }

  private safeBuildDate(year: number, month: number, day: number): Date | null {
    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31 ||
      year < 2000 ||
      year > 2100
    ) {
      return null;
    }
    const date = new Date(year, month - 1, day, 16, 0, 0);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1) return null;
    return date;
  }

  private isRecruitmentAnnouncement(title: string, description: string): boolean {
    const desc = description.replace(/\s+/g, ' ');

    const TITLE_RECRUIT_PATTERNS: RegExp[] = [
      /公开招聘/, /招聘公告/, /招聘简章/, /招聘启事/, /招聘计划/,
      /招聘.*工作人员/, /招聘事业/, /招聘教师/, /招聘医师/, /招聘护士/,
      /招录/, /招用/, /选聘/, /招考/, /选调/, /遴选/,
      /人才引进/, /引进.*人才/, /校园招聘/, /毕洽会.*招聘/,
      /事业编制.*招聘/, /编外.*招聘/, /编外人员.*招聘/,
      /招聘.*编外/, /合同制.*招聘/, /劳务派遣.*招聘/,
      /招聘.*岗位/, /岗位.*招聘/,
      /招聘.*名/, /招聘.*人/,
    ];
    for (const re of TITLE_RECRUIT_PATTERNS) {
      if (re.test(title)) return true;
    }

    const PROCESS_NOTICE_PATTERNS: RegExp[] = [
      /拟聘用.*公示/, /拟聘用.*名单/, /拟录用.*名单/, /拟录用.*公示/,
      /拟聘.*名单/, /聘用.*名单/, /录用.*名单/, /公示.*拟聘用/,
      /笔试成绩/, /面试成绩/, /总成绩/, /综合成绩/, /成绩公示/,
      /面试.*名单/, /面试人员/, /面试时间/, /面试.*地点/, /面试.*通知/,
      /体检.*名单/, /体检结果/, /体检事项/, /体检时间/, /进入体检/,
      /体检.*通知/, /调整.*体检/, /体检有关事项/,
      /考察.*名单/, /考察结果/, /进入考察/, /考察.*公告/,
      /入围.*名单/, /入围考试/, /递补.*体检/, /递补.*名单/, /递补.*公示/,
      /资格复审/, /资料审核/, /资格审查/, /审核结果/, /附加分/,
      /准考证/, /笔试时间/, /笔试.*事项/, /笔试.*地点/, /笔试有关事项/,
      /面谈.*通知/, /面谈.*名单/, /考核.*通知/, /考核.*名单/,
      /面试成绩.*体检/, /面试.*体检/,
      /现场资料审核/, /现场.*审核/, /领取.*通知书/,
    ];
    for (const re of PROCESS_NOTICE_PATTERNS) {
      if (re.test(title)) return false;
    }

    const TITLE_NON_RECRUIT: RegExp[] = [
      /撤销决定/, /撤销虚假登记/, /行政处罚/, /处罚决定/, /处罚事先告知/,
      /行政处理/, /行政复议/, /询问通知书/, /限期整改/, /失信联合惩戒/,
      /严重失信主体/, /劳动保障监察/,
      /巡察/, /巡视/, /整改进展/, /整改情况通报/,
      /农民工工资专用账户销户/, /工资保证金免于存储/,
      /拟扶持项目公示/, /扶持政策奖励补助/, /扶持计划的公示/,
      /技改项目/, /科技计划项目/, /瞪羚之星/, /科技示范主体/,
      /乡村振兴共同富裕/, /基层农技推广/, /文艺精品拟扶持/,
      /油菜籽收购补贴/, /文化产业高质量发展/,
      /特种设备的公告/, /停用或注销.*特种设备/,
      /资格证书的通知/, /卫生专业技术资格证书/,
      /统一社会信用代码信息变更/, /参保单位.*变更/,
      /非法集资的风险提示/, /民间标会/,
      /许可事项公示/, /民政局许可/, /补正公告/,
      /拟废止/, /关于印发/, /关于转发/, /送达公告/,
      /风险提示/, /关于领取.*证书/,
      /交流公示/, /工作人员交流/,
      /关于开展.*自查/, /年度自查/,
    ];
    for (const re of TITLE_NON_RECRUIT) {
      if (re.test(title)) return false;
    }

    for (const re of TITLE_RECRUIT_PATTERNS) {
      if (re.test(title)) return true;
    }

    if (desc.length > 200) {
      const hasRecruitContext = /招聘|岗位|报名|专业要求|学历要求|资格条件|聘用|录用/.test(desc);
      if (hasRecruitContext && /招聘|报名|岗位/.test(title)) return true;
    }

    return false;
  }

  private extractRecruitCount(html: string): number {
    const patterns: RegExp[] = [
      /招聘人数[：:]\s*(\d+)\s*名/,
      /招聘人数[：:]\s*(\d+)\s*人/,
      /共招\s*(\d+)\s*名/,
      /共招\s*(\d+)\s*人/,
      /计划招聘\s*(\d+)\s*名/,
      /计划招聘\s*(\d+)\s*人/,
      /招聘.*?(\d+)\s*[名人员]/,
    ];
    for (const re of patterns) {
      const m: RegExpMatchArray | null = html.match(re);
      if (m) {
        const n: number = parseInt(m[1], 10);
        if (!Number.isNaN(n) && n > 0) return n;
      }
    }
    return 0;
  }

  private extractBodyText(html: string): string {
    // JPAAS 系统正文通常在 zoom / TRS_Editor / content 容器中
    // 注意：不能用 article 类匹配，因为很多站点 article 只是字体切换工具条
    const containerPatterns: RegExp[] = [
      /<div[^>]*id="zoom"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*TRS_Editor[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*id="[^"]*detail[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*detail[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    ];

    let bodyHtml = '';
    for (const re of containerPatterns) {
      let m: RegExpExecArray | null;
      const reGlobal = new RegExp(re.source, 'gi');
      while ((m = reGlobal.exec(html)) !== null) {
        if (m[1] && m[1].length > bodyHtml.length) {
          bodyHtml = m[1];
        }
      }
      if (bodyHtml.length > 500) break;
    }

    if (!bodyHtml) {
      // 兜底：取 body 内部
      const bodyMatch: RegExpMatchArray | null = html.match(
        /<body[^>]*>([\s\S]*?)<\/body>/i,
      );
      bodyHtml = bodyMatch?.[1] || html;
    }

    // 去 HTML 标签
    let text: string = bodyHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    return text;
  }

  private extractOrganization(html: string, bodyText: string): string {
    const patterns: RegExp[] = [
      /招聘单位[：:]\s*([^\n<]+)/,
      /用人单位[：:]\s*([^\n<]+)/,
      /主管单位[：:]\s*([^\n<]+)/,
      /主办单位[：:]\s*([^\n<]+)/,
      /招聘部门[：:]\s*([^\n<]+)/,
    ];
    for (const re of patterns) {
      const m: RegExpMatchArray | null = html.match(re);
      if (m) {
        const name: string = m[1].trim();
        if (name && name.length < 100) return name;
      }
    }
    return '';
  }

  private extractPositions(
    html: string,
    bodyText: string,
  ): { position: string; major: string; education: string; count: number }[] {
    // 先尝试从表格提取
    const tablePositions: {
      position: string;
      major: string;
      education: string;
      count: number;
    }[] = this.extractPositionsFromTable(html);
    if (tablePositions.length > 0) return tablePositions;

    // 文本模式
    return this.extractPositionsFromText(bodyText);
  }

  private extractPositionsFromTable(html: string): {
    position: string;
    major: string;
    education: string;
    count: number;
  }[] {
    // 找所有表格
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    let tableMatch: RegExpExecArray | null;

    while ((tableMatch = tableRegex.exec(html)) !== null) {
      const tableHtml: string = tableMatch[1];

      // 解析所有行
      const rows: string[][] = this.parseTableRows(tableHtml);
      if (rows.length < 2) continue;

      // 在表头行找各列索引
      const headerRow: string[] = rows[0];
      const colIdx = this.findTableColumnIndices(headerRow);

      if (colIdx.position === -1) continue; // 至少要有岗位名列

      const positions: {
        position: string;
        major: string;
        education: string;
        count: number;
      }[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row: string[] = rows[i];
        // 跳过空行或合计行
        if (row.every((cell: string) => !cell.trim())) continue;
        if (row.join('').includes('合计')) continue;
        if (row.join('').includes('总计')) continue;

        const position: string = row[colIdx.position]?.trim() || '';
        if (!position || position.length > 200) continue;
        if (/^\d+$/.test(position)) continue;

        let major: string =
          colIdx.major >= 0 ? row[colIdx.major]?.trim() || '' : '';
        let education: string =
          colIdx.education >= 0 ? row[colIdx.education]?.trim() || '' : '';
        const requirement: string =
          colIdx.requirement >= 0 ? row[colIdx.requirement]?.trim() || '' : '';
        const countStr: string =
          colIdx.count >= 0 ? row[colIdx.count]?.trim() || '0' : '0';
        const countNum: number = parseInt(countStr, 10);
        const count: number = Number.isNaN(countNum) ? 0 : countNum;

        const enumValues = ['phd', 'master', 'bachelor', 'junior-college', 'unlimited'];

        if (requirement) {
          const parsed = this.extractFromRequirementText(requirement);
          if (!major && parsed.major) major = parsed.major;
          if (!enumValues.includes(education) && parsed.education) {
            education = parsed.education;
          }
        }
        if (!enumValues.includes(education)) {
          const norm: string = this.inferEducationFromText(education);
          if (norm) education = norm;
        }

        positions.push({ position, major, education, count });
      }

      if (positions.length > 0) return positions;
    }

    return [];
  }

  private parseTableRows(tableHtml: string): string[][] {
    const rows: string[][] = [];
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch: RegExpExecArray | null;

    while ((trMatch = trRegex.exec(tableHtml)) !== null) {
      const rowHtml: string = trMatch[1];
      const cells: string[] = [];

      // 匹配 td/th
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let cellMatch: RegExpExecArray | null;
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        const text: string = cellMatch[1]
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim();
        cells.push(text);
      }
      if (cells.length > 0) rows.push(cells);
    }

    return rows;
  }

  private findTableColumnIndices(header: string[]): {
    position: number;
    major: number;
    education: number;
    count: number;
    requirement: number;
  } {
    let position = -1;
    let major = -1;
    let education = -1;
    let count = -1;
    let requirement = -1;

    const positionExact = ['招聘岗位', '岗位名称', '招聘岗位名称', '职位名称'];
    const positionContains = ['岗位', '职位'];
    const positionExclude = ['岗位类别', '岗位要求', '岗位条件', '岗位简介', '岗位描述'];

    const majorKeywords = ['专业要求', '专业需求', '所学专业', '专业及学历'];
    const educationKeywords = ['学历要求', '学历', '学历学位', '学位要求', '学历（学位）', '学历学位要求'];
    const countKeywords = ['招聘人数', '人数', '计划数', '名额', '招聘数量', '招录人数', '招聘名额'];
    const requirementKeywords = ['岗位要求', '资格条件', '其他资格条件', '任职要求', '岗位任职要求', '报考条件', '其他条件', '资格要求'];

    const normalized: string[] = header.map((h: string) => h.replace(/\s+/g, '').trim());

    for (let i = 0; i < normalized.length; i++) {
      const cell: string = normalized[i];
      if (!cell) continue;

      if (position === -1) {
        if (positionExact.some((k: string) => cell === k || cell.includes(k))) {
          position = i;
        } else if (
          positionContains.some((k: string) => cell === k) &&
          !positionExclude.some((k: string) => cell.includes(k))
        ) {
          position = i;
        }
      }
      if (major === -1 && majorKeywords.some((k: string) => cell.includes(k))) {
        major = i;
      }
      if (education === -1 && educationKeywords.some((k: string) => cell.includes(k))) {
        education = i;
      }
      if (count === -1 && countKeywords.some((k: string) => cell.includes(k))) {
        count = i;
      }
      if (requirement === -1 && requirementKeywords.some((k: string) => cell.includes(k))) {
        requirement = i;
      }
    }

    return { position, major, education, count, requirement };
  }

  private extractApplyConditions(text: string): {
    conditions: string[];
    cleanText: string;
  } {
    const conditions: string[] = [];
    let cleanText = text;

    const sectionHeaders = [
      '招聘条件', '报考条件', '基本条件', '应聘条件',
      '报名条件', '资格条件', '招考条件', '招录条件',
    ];

    const forbiddenPhrases = [
      '中华人民共和国宪法', '具有中华人民共和国国籍', '遵守宪法',
      '遵守纪律', '品行端正', '拥护宪法', '拥护中国共产党',
      '政治素质', '思想政治', '遵纪守法', '身体健康',
      '具有良好的品行', '无违法违纪', '无不良记录',
    ];

    const lines: string[] = text.split(/\n+/).map((l: string) => l.trim()).filter(Boolean);
    let inConditionSection = false;
    const conditionLineIndices: Set<number> = new Set();

    const isConditionHeader = (line: string): boolean => {
      if (/^[一二三四五六七八九十\d]+[、\.．]/.test(line) && /(招聘|报考|基本|应聘|报名|资格|招考|招录).*条件/.test(line)) {
        return true;
      }
      if (/^[（(][一二三四五六七八九十\d]+[）)]\s*(招聘|报考|基本|应聘|报名|资格|招考|招录).*条件/.test(line)) {
        return true;
      }
      if (sectionHeaders.some((h: string) => line === h || line === `${h}：` || line === `${h}:`)) {
        return true;
      }
      if (line.length <= 15 && /条件$/.test(line) && !line.includes('岗位') && !line.includes('资格条件.*岗位')) {
        return true;
      }
      return false;
    };

    const isConditionEndMarker = (line: string): boolean => {
      if (/^(招聘岗位|岗位列表|招聘岗位及|招聘计划|招聘职位|岗位需求|岗位明细|职位表|招聘单位|招聘程序|报名程序|报名办法|考试方式|考试办法|聘用办法|招聘办法|联系方式|有关说明|注意事项)/.test(line)) {
        return true;
      }
      if (/^[一二三四五六七八九十\d]+[、\.．]/.test(line) && /(招聘岗位|岗位表|职位表|招聘计划|招聘单位|招聘程序|报名程序|报名办法|考试|聘用|联系方式)/.test(line)) {
        return true;
      }
      return false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line: string = lines[i];

      if (isConditionHeader(line)) {
        inConditionSection = true;
        conditionLineIndices.add(i);
        continue;
      }

      if (inConditionSection) {
        if (isConditionEndMarker(line)) {
          inConditionSection = false;
          continue;
        }
        if (/^[一二三四五六七八九十]+[、\.．]/.test(line) || /^\d+[、\.．]/.test(line) || /^[（(][一二三四五六七八九十\d]+[）)]/.test(line)) {
          conditions.push(line);
          conditionLineIndices.add(i);
          continue;
        }
        if (/^[①②③④⑤⑥⑦⑧⑨⑩]/.test(line)) {
          conditions.push(line);
          conditionLineIndices.add(i);
          continue;
        }
        if (forbiddenPhrases.some((p: string) => line.includes(p))) {
          conditions.push(line);
          conditionLineIndices.add(i);
          continue;
        }
        if (line.length < 8 && /^[（(]?[一二三四五六七八九十\d]+[）)]?$/.test(line)) {
          conditionLineIndices.add(i);
          continue;
        }
      }
    }

    if (conditionLineIndices.size > 0) {
      cleanText = lines.filter((_: string, idx: number) => !conditionLineIndices.has(idx)).join('\n');
    }

    return { conditions, cleanText };
  }

  private extractPositionsFromText(text: string): {
    position: string;
    major: string;
    education: string;
    count: number;
  }[] {
    const positions: {
      position: string;
      major: string;
      education: string;
      count: number;
    }[] = [];

    // 匹配"方向一"、"岗位一"、"（一）"等分段标题
    const sectionPatterns: RegExp[] = [
      /方向[一二三四五六七八九十]+[\s、\.．]([^\n]+)/g,
      /岗位[一二三四五六七八九十\d]+[\s、\.．]([^\n]+)/g,
      /第[一二三四五六七八九十]+[岗位种][\s、\.．]?([^\n]+)/g,
      /[（(][一二三四五六七八九十\d]+[）)][\s、\.．]?([^\n]+)/g,
    ];

    for (const re of sectionPatterns) {
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const line: string = m[1].trim();
        if (!line || line.length > 100) continue;

        // 从行中提取人数
        const countMatch: RegExpMatchArray | null = line.match(/(\d+)\s*[名人员]/);
        const countNum: number = countMatch
          ? parseInt(countMatch[1], 10)
          : 0;
        const count: number = Number.isNaN(countNum) ? 0 : countNum;

        // 岗位名取行首到第一个分隔符
        const position: string = line
          .split(/[：:，,（(]/)[0]
          .trim()
          .replace(/\d+[名人员].*$/, '')
          .trim();

        if (position && position.length < 30 && position.length >= 2) {
          const badStarts = [
            '遵守', '具有', '具备', '身体', '年龄', '政治', '品行',
            '遵纪', '拥护', '认同', '热爱', '坚持', '熟悉',
            '具体招聘', '报考注意', '报名程序', '考试',
            '体检', '考核', '公示', '聘用', '联系',
            '纪律', '监督', '附件', '详见', '宁波', '浙江',
            '本公告', '本次', '时间', '地点', '方式',
            '资格审查', '政审', '考察', '复审',
          ];
          if (badStarts.some((s: string) => position.startsWith(s))) continue;
          if (/^\d+$/.test(position)) continue;
          if (/[。；！？]/.test(position)) continue;
          if (position.endsWith('：') || position.endsWith(':')) continue;
          if (position.length > 2 && position.length < 6) {
            const commonPositions = [
              '教师', '讲师', '教授', '助教', '研究员', '工程师',
              '专员', '主管', '经理', '主任', '科员', '办事员',
              '出纳', '会计', '护士', '医生', '技师', '技工',
            ];
            if (!commonPositions.some((p: string) => position.includes(p))) continue;
          }
          positions.push({
            position,
            major: '',
            education: '',
            count,
          });
        }
      }
      if (positions.length > 0) break;
    }

    // 补充学历信息
    if (positions.length > 0) {
      const edu: string = this.inferEducationFromText(text);
      if (edu) {
        for (const p of positions) {
          if (!p.education) p.education = edu;
        }
      }
    }

    return positions;
  }

  private inferEducationFromText(text: string): string {
    if (!text) return '';
    const patterns: { keyword: string; value: string }[] = [
      { keyword: '博士研究生', value: 'phd' },
      { keyword: '硕士研究生', value: 'master' },
      { keyword: '博士学位', value: 'phd' },
      { keyword: '硕士学位', value: 'master' },
      { keyword: '研究生学历', value: 'master' },
      { keyword: '博士', value: 'phd' },
      { keyword: '硕士', value: 'master' },
      { keyword: '本科及以上', value: 'bachelor' },
      { keyword: '全日制本科', value: 'bachelor' },
      { keyword: '本科学历', value: 'bachelor' },
      { keyword: '大学本科', value: 'bachelor' },
      { keyword: '本科以上', value: 'bachelor' },
      { keyword: '本科', value: 'bachelor' },
      { keyword: '大专及以上', value: 'junior-college' },
      { keyword: '专科及以上', value: 'junior-college' },
      { keyword: '大专以上', value: 'junior-college' },
      { keyword: '大专', value: 'junior-college' },
      { keyword: '专科', value: 'junior-college' },
      { keyword: '学历不限', value: 'unlimited' },
    ];
    for (const p of patterns) {
      if (text.includes(p.keyword)) return p.value;
    }
    return '';
  }

  private normalizeJobEducation(
    positions: { position: string; major: string; education: string; count: number }[],
  ): string {
    const levels = ['phd', 'master', 'bachelor', 'junior-college', 'unlimited'];
    let lowest = -1;
    for (const pos of positions) {
      const edu: string = pos.education || '';
      const normalized: string = this.inferEducationFromText(edu);
      if (!normalized) continue;
      const idx: number = levels.indexOf(normalized);
      if (idx >= 0 && (lowest === -1 || idx > lowest)) {
        lowest = idx;
      }
    }
    return lowest >= 0 ? levels[lowest] : '';
  }

  // ---------- 工具方法 ----------

  private extractFromRequirementText(text: string): {
    major: string;
    education: string;
    age: string;
  } {
    const result = { major: '', education: '', age: '' };
    if (!text) return result;

    const eduPatterns: { pattern: RegExp; value: string }[] = [
      { pattern: /博士研究生及以上/, value: 'phd' },
      { pattern: /硕士研究生及以上/, value: 'master' },
      { pattern: /博士学历/, value: 'phd' },
      { pattern: /博士学位/, value: 'phd' },
      { pattern: /博士/, value: 'phd' },
      { pattern: /硕士及以上学历/, value: 'master' },
      { pattern: /硕士研究生/, value: 'master' },
      { pattern: /硕士学位/, value: 'master' },
      { pattern: /硕士/, value: 'master' },
      { pattern: /研究生及以上/, value: 'master' },
      { pattern: /研究生学历/, value: 'master' },
      { pattern: /本科及以上学历/, value: 'bachelor' },
      { pattern: /本科及以上/, value: 'bachelor' },
      { pattern: /全日制本科/, value: 'bachelor' },
      { pattern: /本科学历/, value: 'bachelor' },
      { pattern: /大学本科/, value: 'bachelor' },
      { pattern: /本科以上/, value: 'bachelor' },
      { pattern: /本科/, value: 'bachelor' },
      { pattern: /大专及以上/, value: 'junior-college' },
      { pattern: /专科及以上/, value: 'junior-college' },
      { pattern: /大专以上/, value: 'junior-college' },
      { pattern: /大专/, value: 'junior-college' },
      { pattern: /专科/, value: 'junior-college' },
      { pattern: /学历不限/, value: 'unlimited' },
    ];
    for (const p of eduPatterns) {
      if (p.pattern.test(text)) {
        result.education = p.value;
        break;
      }
    }

    let majorText = '';
    const majorPatterns: RegExp[] = [
      /([\u4e00-\u9fa5A-Za-z0-9、，,\s、\.]+?)\s*(?:相关专业|等专业|类专业)/,
      /([\u4e00-\u9fa5A-Za-z0-9、，,\s]+?专业)/,
    ];
    for (const p of majorPatterns) {
      const m: RegExpMatchArray | null = text.match(p);
      if (m && m[1] && m[1].length < 100 && !m[1].includes('学历')) {
        majorText = m[1]
          .replace(/[，,]/g, '、')
          .replace(/\s+/g, '')
          .trim();
        if (majorText.includes('专业不限')) {
          majorText = '专业不限';
        }
        break;
      }
    }
    result.major = majorText;

    const ageMatch: RegExpMatchArray | null = text.match(
      /(\d+)\s*周岁(?:以下|（含）)?/,
    );
    if (ageMatch) {
      result.age = `${ageMatch[1]}周岁以下`;
    }

    return result;
  }

  private parseDate(str: string): Date | null {
    if (!str) return null;
    // 规范化：2026年9月5日 → 2026-09-05
    const normalized: string = str
      .replace(/年/g, '-')
      .replace(/月/g, '-')
      .replace(/日/g, '')
      .replace(/\./g, '-')
      .replace(/\//g, '-')
      .trim();

    const m: RegExpMatchArray | null = normalized.match(
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
    );
    if (!m) return null;

    const year: number = parseInt(m[1], 10);
    const month: number = parseInt(m[2], 10);
    const day: number = parseInt(m[3], 10);

    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return null;
    }

    const date: Date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve: () => void) => {
      setTimeout(resolve, ms);
    });
  }

  private readonly reparseStatus = { running: false, total: 0, done: 0 };

  getReparseStatus(): { running: boolean; total: number; done: number } {
    return { ...this.reparseStatus };
  }

  async reparseAllWithAI(): Promise<void> {
    if (this.reparseStatus.running) return;
    this.reparseStatus.running = true;
    this.reparseStatus.done = 0;
    try {
      const all = await this.jobRepository.findAllForReparse();
      this.reparseStatus.total = all.length;
      for (const job of all) {
        try {
          const html = await this.fetchPage(job.sourceUrl);
          const aiResult = await this.aiJobExtractor.extract(job.title, html);
          const positions = aiResult.positions.map((p) => {
            const eduCode: string = p.education && ['phd','master','bachelor','junior-college','unlimited'].includes(p.education)
              ? p.education
              : this.inferEducationFromText(p.education);
            return {
              position: p.name,
              major: p.major,
              education: eduCode,
              count: p.count ?? 0,
              responsibility: p.responsibility,
              otherRequirements: p.otherRequirements,
            };
          });
          const recruitCount: number = aiResult.totalCount ??
            positions.reduce((s, p) => s + (p.count || 0), 0);
          let deadline: Date | null = aiResult.applyEndDate;
          const applyStartDate: Date | null = aiResult.applyStartDate;
          if (!deadline) {
            const bodyText: string = this.extractBodyText(html);
            const fallback = this.extractDeadline(bodyText, job.publishDate);
            deadline = fallback.deadline;
          }
          const isLongTerm: boolean = deadline ? false : job.isLongTerm;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const status: string = deadline && deadline < today ? 'expired' : 'active';
          const categories = this.categorizeJob(job.title, '', positions);
          await this.jobRepository.updateAiParsedResult(job.id, {
            positions,
            recruitCount,
            deadline,
            applyStartDate,
            generalConditions: aiResult.generalConditions,
            status,
            isLongTerm,
            categories,
          });
        } catch (err) {
          this.logger.warn(`重解析失败: ${job.title}`, err instanceof Error ? err.message : String(err));
        } finally {
          this.reparseStatus.done += 1;
        }
      }
    } finally {
      this.reparseStatus.running = false;
    }
  }

  private async upsertJob(
    data: ParsedJobDetail & {
      sourceUrl: string;
      type: JobType;
      province: string;
      city: string;
      location: string;
      source: string;
    },
  ): Promise<UpsertResult> {
    const upsertData: UpsertJobData = {
      sourceUrl: data.sourceUrl,
      title: data.title,
      organization: data.organization,
      type: data.type,
      location: data.location,
      province: data.province,
      city: data.city,
      education: this.normalizeJobEducation(data.positions),
      recruitCount: data.recruitCount,
      publishDate: data.publishDate,
      deadline: data.deadline,
      isLongTerm: data.isLongTerm,
      source: data.source,
      description: data.description,
      requirements: [],
      benefits: [],
      positions: data.positions,
      bodyLength: data.bodyLength,
      hasAttachment: data.hasAttachment,
      generalConditions: data.generalConditions,
      applyStartDate: data.applyStartDate ?? null,
      aiParsed: data.aiParsed ?? false,
      categories: this.categorizeJob(data.title, data.organization, data.positions),
    };
    const { isNew } = await this.jobRepository.upsertJob(upsertData);
    return { isNew };
  }

  private categorizeJob(
    title: string,
    organization: string,
    positions: { position: string; major: string; education: string; count: number; responsibility?: string; otherRequirements?: string }[],
  ): string[] {
    const posText = positions.map((p) => p.position + p.major + (p.responsibility || '')).join(' ');
    const text = `${title} ${organization} ${posText}`;
    const cats = new Set<string>();

    if (/教师|教学|老师|教研室|专任教师|教研员|师范|教授|讲师|辅导员/i.test(text) ||
        /学校|学院|大学|教育局/.test(organization)) {
      cats.add('教师');
    }
    if (/医生|护士|医院|卫生|药|医疗|疾控|检验|药学/i.test(text) ||
        /医院|卫生|医疗|疾控|药检/.test(organization)) {
      cats.add('医疗卫生');
    }
    if (/会计|财务|审计|出纳|税务|核算/i.test(text)) {
      cats.add('财务审计');
    }
    if (/风控|投资|基金|银行|证券|保险|金融|资本|私募|创投|产投/i.test(text) ||
        /基金|投资集团|金控|资本|私募基金/.test(organization)) {
      cats.add('金融');
    }
    if (/工程师|开发|信息|运维|数据|软件|网络|计算机|IT|人工智能|算法|程序员|前端|后端/i.test(text)) {
      cats.add('信息技术');
    }
    if (/土木|建造|设计|施工|工程|技术员|技术岗|技术负责|规划|建筑|市政|水务|环境|能源|机械|设备|工艺|研发|电气|电器/i.test(text) ||
        /建设|建筑|工程|设计院|规划院|水务|能源|交通投资|城建|城投|置地|电器|发电|生物质/.test(organization)) {
      cats.add('工程技术');
    }
    if (/法务|律师|法律|合规/i.test(text)) {
      cats.add('法律法务');
    }
    if (/警察|特警|公安|警务|辅警|交警|刑警/i.test(text) ||
        /公安局|警察局|特警|公安/.test(organization)) {
      cats.add('公安警务');
    }
    if (/研究员|科研|博士后|实验室|研究所|研究院/i.test(text) ||
        /研究院|研究所|科学院|实验室|研发中心/.test(organization)) {
      cats.add('科研');
    }

    if (cats.size === 0) cats.add('综合行政');
    return [...cats];
  }
}
