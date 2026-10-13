import { Inject, Injectable, Logger } from '@nestjs/common';
import { CapabilityService } from '@lark-apaas/fullstack-nestjs-core';
import type {
  RecruitmentAnnouncementExtractionOneInput,
  RecruitmentAnnouncementExtractionOneOutput,
} from '@shared/plugin-types';

export interface AIParsedPosition {
  name: string;
  count: number | null;
  major: string;
  education: string;
  responsibility: string;
  otherRequirements: string;
}

export interface AIParsedJobDetail {
  totalCount: number | null;
  positions: AIParsedPosition[];
  applyStartDate: Date | null;
  applyEndDate: Date | null;
  generalConditions: string;
  hasSuspiciousCount: boolean;
}

const PLUGIN_INSTANCE_ID = 'recruitment_announcement_extraction_1';

const EDU_CN_TO_ENUM: Record<string, string> = {
  '博士': 'phd',
  '博士研究生': 'phd',
  '博士研究生及以上': 'phd',
  '硕士': 'master',
  '硕士研究生': 'master',
  '硕士研究生及以上': 'master',
  '研究生': 'master',
  '本科': 'bachelor',
  '本科及以上': 'bachelor',
  '大学本科': 'bachelor',
  '全日制本科': 'bachelor',
  '本科学历': 'bachelor',
  '大专': 'junior-college',
  '专科': 'junior-college',
  '大专及以上': 'junior-college',
  '专科及以上': 'junior-college',
  '不限': 'unlimited',
};

@Injectable()
export class AiJobExtractorService {
  private readonly logger = new Logger(AiJobExtractorService.name);

  constructor(
    @Inject(CapabilityService)
    private readonly capabilityService: CapabilityService,
  ) {}

  async extract(title: string, html: string): Promise<AIParsedJobDetail> {
    const cleanText: string = this.htmlToReadableText(html);
    const inputText: string = `标题：${title}\n\n正文：\n${cleanText.slice(0, 8000)}`;

    try {
      const result = (await this.capabilityService
        .load(PLUGIN_INSTANCE_ID)
        .call('textToJson', {
          recruitment_content: inputText,
        } as RecruitmentAnnouncementExtractionOneInput)) as RecruitmentAnnouncementExtractionOneOutput;

      return this.validateAndNormalize(result, cleanText);
    } catch (err) {
      this.logger.error('AI 解析失败', err instanceof Error ? err.stack : String(err));
      return {
        totalCount: null,
        positions: [],
        applyStartDate: null,
        applyEndDate: null,
        generalConditions: '',
        hasSuspiciousCount: false,
      };
    }
  }

  private htmlToReadableText(html: string): string {
    const containerPatterns: RegExp[] = [
      /<div[^>]*id="zoom"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*TRS_Editor[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
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
      const bodyMatch: RegExpMatchArray | null = html.match(
        /<body[^>]*>([\s\S]*?)<\/body>/i,
      );
      bodyHtml = bodyMatch?.[1] || html;
    }

    const withTables: string = this.convertTablesToMarkdown(bodyHtml);

    const text: string = withTables
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim();

    return text;
  }

  private convertTablesToMarkdown(html: string): string {
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    return html.replace(tableRegex, (_match: string, tableHtml: string) => {
      const rows: string[][] = [];
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let rowMatch: RegExpExecArray | null;
      while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
        const cells: string[] = [];
        const cellRegex = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
        let cellMatch: RegExpExecArray | null;
        while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
          const cellText: string = cellMatch[1]
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          cells.push(cellText);
        }
        if (cells.length > 0) rows.push(cells);
      }
      if (rows.length === 0) return '';
      const header: string[] = rows[0];
      const markdown: string[] = [
        '| ' + header.join(' | ') + ' |',
        '| ' + header.map(() => '---').join(' | ') + ' |',
        ...rows.slice(1).map((r: string[]) =>
          '| ' + r.map((c: string) => c.replace(/\|/g, '\\|')).join(' | ') + ' |',
        ),
      ];
      return '\n\n【招聘岗位表】\n' + markdown.join('\n') + '\n\n';
    });
  }

  private validateAndNormalize(
    result: RecruitmentAnnouncementExtractionOneOutput,
    rawText: string,
  ): AIParsedJobDetail {
    const suspiciousPatterns = [
      /满分\d+分/,
      /\d+分/,
      /\d+%/,
      /\d+\s*年/,
      /\d+\s*岁/,
      /第\d+名/,
      /\d+号/,
      /\d+月/,
      /\d+日/,
    ];
    const hasSuspiciousCount = suspiciousPatterns.some((p: RegExp) => p.test(rawText));

    const rawPositions = Array.isArray(result.positions) ? result.positions : [];

    const positions: AIParsedPosition[] = rawPositions
      .map((p: any) => {
        const name: string = (p?.name || '').toString().trim();
        const countRaw: string = (p?.count ?? '').toString().trim();
        const countNum: number = parseInt(countRaw, 10);
        const count: number | null =
          countRaw && !Number.isNaN(countNum) && countNum > 0 && countNum < 500
            ? countNum
            : null;
        return {
          name,
          count,
          major: (p?.major || '').toString().trim(),
          education: this.normalizeEducation((p?.education || '').toString().trim()),
          responsibility: (p?.responsibility || '').toString().trim(),
          otherRequirements: (p?.otherRequirements || '').toString().trim(),
        };
      })
      .filter((p: AIParsedPosition) => {
        if (!p.name || p.name.length < 2 || p.name.length > 40) return false;
        if (/^\d+$/.test(p.name)) return false;
        const badStarts = [
          '报名', '考试', '体检', '考核', '公示', '聘用',
          '联系', '纪律', '监督', '附件', '详见',
          '遵守', '具有', '具备', '身体', '年龄',
          '大学本科', '硕士研究生', '博士研究生',
        ];
        if (badStarts.some((s: string) => p.name.startsWith(s))) return false;
        if (/[。；！？，]/.test(p.name)) return false;
        return true;
      });

    const sumOfPositions: number = positions.reduce(
      (s: number, p: AIParsedPosition) => s + (p.count || 0),
      0,
    );

    let totalCount: number | null = null;
    if (result.totalCount && result.totalCount > 0 && result.totalCount < 500) {
      if (hasSuspiciousCount && positions.length > 0 && sumOfPositions > 0) {
        totalCount = sumOfPositions;
      } else if (positions.length > 0 && sumOfPositions > 0 && result.totalCount < sumOfPositions) {
        totalCount = sumOfPositions;
      } else {
        totalCount = result.totalCount;
      }
    } else if (sumOfPositions > 0) {
      totalCount = sumOfPositions;
    }

    const applyStartDate: Date | null = this.parseAiDate(result.applyStartDate);
    let applyEndDate: Date | null = this.parseAiDate(result.applyDeadline);
    if (applyEndDate) {
      applyEndDate = this.validateApplyEndDate(applyEndDate, rawText);
    }

    return {
      totalCount,
      positions,
      applyStartDate,
      applyEndDate,
      generalConditions: (result.generalConditions || '').toString().trim(),
      hasSuspiciousCount: hasSuspiciousCount && positions.length > 0,
    };
  }

  private validateApplyEndDate(deadline: Date, rawText: string): Date | null {
    const y = deadline.getFullYear();
    const m = deadline.getMonth() + 1;
    const d = deadline.getDate();
    const dateStr = `${y}年${m}月${d}日`;
    const dateShort = `${m}月${d}日`;

    const deadlineContextPattern = new RegExp(
      `[^。\n]{0,40}(?:${dateStr.replace(/[年日]/g, m => '\\' + m)}|${dateShort.replace('月', '\\月').replace('日', '\\日')})[^。\n]{0,40}`,
      'gi',
    );
    const contexts: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = deadlineContextPattern.exec(rawText)) !== null) {
      contexts.push(match[0]);
    }

    const falsePositivePatterns = [
      /取得.*学历/, /取得.*学位/, /学历.*取得/, /学位.*取得/,
      /年龄.*周岁/, /周岁.*以下/, /周岁.*以上/,
      /年龄.*计算/, /出生日期.*截止/,
      /报到.*时间/, /入职.*时间/, /到岗.*时间/,
      /工作经历.*截止/, /服务期.*截止/,
      /职称.*取得/, /资格证.*取得/, /证书.*取得/,
      /下一年度.*计划.*发布.*前/, /.*计划.*发布.*前/,
    ];

    for (const ctx of contexts) {
      for (const fp of falsePositivePatterns) {
        if (fp.test(ctx)) {
          return null;
        }
      }
    }

    return deadline;
  }

  private parseAiDate(value: unknown): Date | null {
    const str: string = (value || '').toString().trim();
    if (!str) return null;
    const m: RegExpMatchArray | null = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (!m) return null;
    const year: number = parseInt(m[1], 10);
    const month: number = parseInt(m[2], 10);
    const day: number = parseInt(m[3], 10);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const d: Date = new Date(year, month - 1, day);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private normalizeEducation(edu: string): string {
    if (!edu) return '';
    const lower: string = edu.trim();
    for (const [cn, en] of Object.entries(EDU_CN_TO_ENUM)) {
      if (lower.includes(cn)) return en;
    }
    return lower;
  }
}
