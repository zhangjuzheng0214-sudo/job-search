// ---- plugin:recruitment_announcement_extraction_1 ----
// ============================================================
// 插件 recruitment_announcement_extraction_1 (招聘公告结构化信息提取) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface RecruitmentAnnouncementExtractionOneInput {
  /** 招聘公告正文内容 */
  recruitment_content: string;
}

/**
 * capabilityClient.load('recruitment_announcement_extraction_1').call<RecruitmentAnnouncementExtractionOneOutput>('textToJson', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { totalCount, applyStartDate, applyDeadline, ... } = result;
 * 返回值形如：
 *   {"totalCount":0,"applyStartDate":"","applyDeadline":"","generalConditions":"","positions":[]}
 */
export interface RecruitmentAnnouncementExtractionOneOutput {
  /** 总招聘人数 */
  totalCount: number;
  /** 报名开始日期，格式为YYYY-MM-DD，未找到为空字符串 */
  applyStartDate: string;
  /** 报名截止日期，格式为YYYY-MM-DD，未找到或长期招聘为空字符串 */
  applyDeadline: string;
  /** 通用报考条件，适用于所有岗位的报考要求 */
  generalConditions: string;
  /** 岗位明细列表，items schema: {name: string(岗位名称), count: string(招聘人数), major: string(专业要求), education: string(学历要求), responsibility: string(岗位职责), otherRequirements: string(其他资格条件)} */
  positions: unknown[];
}
// ---- end:recruitment_announcement_extraction_1 ----