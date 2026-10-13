import type {
  JobDetail,
  JobItem,
  JobType,
  EducationLevel,
  JobPosition,
} from '@shared/api.interface';
 import { collectedJobs, extractOrganization } from './collected-data';

const now = new Date();
const daysFromNow = (days: number): string => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};
const daysAgo = (days: number): string => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

function getPositionEducationLevel(eduText: string): number {
  if (!eduText) return 0;
  const text = eduText.toLowerCase();
  if (text.includes('博士') || text.includes('phd') || text.includes('doctor')) return 4;
  if (text.includes('硕士') || text.includes('研究生') || text.includes('master')) {
    if (text.includes('博士')) return 4;
    return 3;
  }
  if (text.includes('本科') || text.includes('学士') || text.includes('bachelor')) return 2;
  if (text.includes('大专') || text.includes('专科') || text.includes('junior') || text.includes('college')) return 1;
  return 0;
}

const collectedJobDetails: JobDetail[] = collectedJobs.map((raw, index) => {
  const id = `nb-${String(index + 1).padStart(3, '0')}`;
  const publishIso = new Date(raw.publish_time.replace(' ', 'T') + ':00').toISOString();
   const deadlineIso = raw.deadline
     ? new Date(raw.deadline + 'T17:00:00').toISOString()
     : new Date('2099-12-31T17:00:00').toISOString();
   const hasRealDeadline = !!raw.deadline;
  const org = extractOrganization(raw.title);
  return {
    id,
    title: raw.title,
    organization: org,
    type: 'public-institution' as const,
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'bachelor',
    recruitCount: raw.position_count,
    publishDate: publishIso,
     deadline: deadlineIso,
     isLongTerm: !hasRealDeadline,
    source: '宁波市人力资源和社会保障局',
    sourceUrl: raw.url,
    description: raw.snippet,
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '遵守纪律，品行端正，具备良好的职业素质',
      '具有招聘岗位所需的学历、资历、专业技术任职资格和职业（执业）资格',
      '具有适应岗位要求的身体条件和年龄要求，年龄一般在35周岁以下',
      '具备岗位所需的其他条件，详见招聘公告原文',
    ],
    benefits: ['事业编制', '五险一金', '带薪年假', '职称晋升'],
    applicationUrl: raw.url,
    hasAttachment: raw.has_attachment,
    bodyLength: raw.body_len,
    positions: raw.positions.map((p): JobPosition => ({
      position: p.position,
      major: p.major,
      education: p.education,
      count: p.count,
    })),
  } as JobDetail & { hasAttachment: boolean; bodyLength: number };
});

const soeJobs: JobDetail[] = [
  {
    id: 'soe-001',
    title: '宁波文旅会展集团有限公司2026年第二批统筹招聘公告',
    organization: '宁波文旅会展集团有限公司',
    type: 'soe',
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'bachelor',
    recruitCount: 19,
    publishDate: '2026-09-15T00:00:00.000Z',
    deadline: '2026-10-01T17:00:00.000Z',
    isLongTerm: false,
    source: '宁波市人民政府国有资产监督管理委员会',
    sourceUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_f5e0f65392a73c42062036c03a8f62f8.html',
    description: '宁波文旅会展集团有限公司面向社会公开招聘工作人员19名。招聘岗位涵盖文旅运营、会展策划、市场营销、财务管理等方向。',
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '具有良好的品行和职业道德',
      '具有招聘岗位所需的学历、专业及技能条件',
      '具有适应岗位要求的身体条件',
      '详见招聘公告原文',
    ],
    benefits: ['国企正式编制', '五险一金', '带薪年假', '节日福利'],
    applicationUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_f5e0f65392a73c42062036c03a8f62f8.html',
    hasAttachment: true,
    bodyLength: 4200,
    positions: [
      { position: '文旅运营岗', major: '旅游管理、文化产业管理、工商管理', education: '本科及以上', count: 5 },
      { position: '会展策划岗', major: '会展经济与管理、市场营销、广告学', education: '本科及以上', count: 4 },
      { position: '财务管理岗', major: '会计学、财务管理、审计学', education: '本科及以上', count: 3 },
      { position: '人力资源岗', major: '人力资源管理、工商管理、行政管理', education: '本科及以上', count: 3 },
      { position: '工程管理岗', major: '土木工程、工程管理、建筑学', education: '本科及以上', count: 4 },
    ],
  } as JobDetail & { hasAttachment: boolean; bodyLength: number },
  {
    id: 'soe-002',
    title: '宁波开发投资集团有限公司招聘公告（博士后4人）',
    organization: '宁波开发投资集团有限公司',
    type: 'soe',
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'phd',
    recruitCount: 4,
    publishDate: '2026-09-29T00:00:00.000Z',
    deadline: '2026-11-28T17:00:00.000Z',
    isLongTerm: false,
    source: '宁波市人民政府国有资产监督管理委员会',
    sourceUrl: 'http://gzw.ningbo.gov.cn/col/col1229116730/art/2026/art_4e7e1b4ccca94c4496f6cdf80e60c5c1.html',
    description: '宁波开发投资集团有限公司面向社会公开招聘全职博士后研究人员4名。涉及高端海工装备、航天器发射、煤化工、油页岩利用等多个研究方向，报名时间至2026年11月28日。',
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '已获得博士学位或近期即将获得博士学位',
      '具有扎实的专业基础和较强的科研能力',
      '具有良好的团队协作精神',
      '详见招聘公告原文',
    ],
    benefits: ['博士后科研经费', '安家补贴', '五险一金', '职称晋升通道'],
    applicationUrl: 'http://gzw.ningbo.gov.cn/col/col1229116730/art/2026/art_4e7e1b4ccca94c4496f6cdf80e60c5c1.html',
    hasAttachment: true,
    bodyLength: 3800,
    positions: [
      { position: '博士后方向一', major: '机械工程、船舶与海洋工程、控制科学与工程、材料科学与工程、电子科学与技术、流体力学、水动力学', education: '博士研究生', count: 2 },
      { position: '博士后方向二', major: '航空航天、飞行器工程、航天运输、控制与测控', education: '博士研究生', count: 1 },
      { position: '博士后方向三', major: '化学工程与技术、煤化工、石油化工、化石能源转化', education: '博士研究生', count: 1 },
      { position: '博士后方向四', major: '化学工程与工艺、能源化学工程、应用化学、能源动力与工程', education: '博士研究生', count: 2 },
    ],
  } as JobDetail & { hasAttachment: boolean; bodyLength: number },
  {
    id: 'soe-003',
    title: '宁波物产集团有限公司招聘公告',
    organization: '宁波物产集团有限公司',
    type: 'soe',
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'bachelor',
    recruitCount: 0,
    publishDate: '2026-09-20T00:00:00.000Z',
    deadline: '2026-09-29T17:00:00.000Z',
    isLongTerm: false,
    source: '宁波市人民政府国有资产监督管理委员会',
    sourceUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_cf778b255eb01c4470077ccd4ea5c238.html',
    description: '宁波物产集团有限公司面向社会公开招聘工作人员。招聘岗位涵盖供应链运营、国际贸易、财务审计等方向，具体岗位及人数详见公告原文。',
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '具有良好的品行和职业道德',
      '具有招聘岗位所需的学历、专业及技能条件',
      '具有适应岗位要求的身体条件',
      '详见招聘公告原文',
    ],
    benefits: ['国企正式编制', '五险一金', '带薪年假', '节日福利'],
    applicationUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_cf778b255eb01c4470077ccd4ea5c238.html',
    hasAttachment: true,
    bodyLength: 3500,
    positions: [
      { position: '供应链运营岗', major: '供应链管理、物流管理、国际经济与贸易', education: '本科及以上', count: 0 },
      { position: '财务审计岗', major: '会计学、财务管理、审计学', education: '本科及以上', count: 0 },
      { position: '市场营销岗', major: '市场营销、工商管理、电子商务', education: '本科及以上', count: 0 },
    ],
  } as JobDetail & { hasAttachment: boolean; bodyLength: number },
  {
    id: 'soe-004',
    title: '宁波开投私募基金管理有限公司招聘公告',
    organization: '宁波开投私募基金管理有限公司',
    type: 'soe',
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'master',
    recruitCount: 0,
    publishDate: '2026-09-18T00:00:00.000Z',
    deadline: '2026-09-29T17:00:00.000Z',
    isLongTerm: false,
    source: '宁波市人民政府国有资产监督管理委员会',
    sourceUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_77d2a1293d5116db1049719e301ab0fb.html',
    description: '宁波开投私募基金管理有限公司面向社会公开招聘专业人才。招聘岗位涵盖投资研究、风险管理、基金运营等方向，具体人数详见公告原文。',
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '具有良好的品行和职业道德',
      '具有招聘岗位所需的学历、专业及技能条件',
      '具有相关从业资格者优先',
      '详见招聘公告原文',
    ],
    benefits: ['国企正式编制', '五险一金', '绩效奖金', '节日福利'],
    applicationUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_77d2a1293d5116db1049719e301ab0fb.html',
    hasAttachment: true,
    bodyLength: 3200,
    positions: [
      { position: '投资研究员', major: '金融学、经济学、投资学', education: '硕士研究生及以上', count: 0 },
      { position: '风险管理岗', major: '金融工程、风险管理、统计学', education: '硕士研究生及以上', count: 0 },
      { position: '基金运营岗', major: '会计学、财务管理、金融学', education: '硕士研究生及以上', count: 0 },
    ],
  } as JobDetail & { hasAttachment: boolean; bodyLength: number },
  {
    id: 'soe-005',
    title: '宁波市水务环境集团股份有限公司招聘公告',
    organization: '宁波市水务环境集团股份有限公司',
    type: 'soe',
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'bachelor',
    recruitCount: 3,
    publishDate: '2026-09-12T00:00:00.000Z',
    deadline: '2099-12-31T17:00:00.000Z',
    isLongTerm: true,
    source: '宁波市人民政府国有资产监督管理委员会',
    sourceUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_1bcbe6c165b00aa5ce06c9ee15ae4bca.html',
    description: '宁波市水务环境集团股份有限公司面向社会公开招聘专业技术人员3名。涉及给排水工程、结构工程、自动化等专业方向。招满即止。',
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '具有良好的品行和职业道德',
      '具有招聘岗位所需的学历、专业及技能条件',
      '具有相关工作经验者优先',
      '详见招聘公告原文',
    ],
    benefits: ['国企正式编制', '五险一金', '带薪年假', '技术津贴'],
    applicationUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_1bcbe6c165b00aa5ce06c9ee15ae4bca.html',
    hasAttachment: true,
    bodyLength: 2900,
    positions: [
      { position: '给排水工程师', major: '土木工程、给排水工程、市政工程', education: '本科及以上', count: 1 },
      { position: '结构工程师', major: '结构工程、土木工程', education: '本科及以上', count: 1 },
      { position: '自动化工程师', major: '自动化、电气工程及其自动化', education: '本科及以上', count: 1 },
    ],
  } as JobDetail & { hasAttachment: boolean; bodyLength: number },
  {
    id: 'soe-006',
    title: '宁波通商控股集团有限公司关于延长招聘报名时间的补充公告',
    organization: '宁波通商控股集团有限公司',
    type: 'soe',
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'bachelor',
    recruitCount: 0,
    publishDate: '2026-09-22T00:00:00.000Z',
    deadline: '2026-10-08T17:00:00.000Z',
    isLongTerm: false,
    source: '宁波市人民政府国有资产监督管理委员会',
    sourceUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_0ed1c4d71cacb11749fe8f3ecd88a337.html',
    description: '宁波通商控股集团有限公司发布补充公告，招聘报名时间延长至2026年10月8日。招聘岗位涵盖金融投资、产业运营、综合管理等方向，正在招聘中。',
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '具有良好的品行和职业道德',
      '具有招聘岗位所需的学历、专业及技能条件',
      '详见招聘公告原文',
    ],
    benefits: ['国企正式编制', '五险一金', '带薪年假', '节日福利'],
    applicationUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_0ed1c4d71cacb11749fe8f3ecd88a337.html',
    hasAttachment: true,
    bodyLength: 2500,
    positions: [
      { position: '金融投资岗', major: '金融学、经济学、投资学', education: '本科及以上', count: 0 },
      { position: '产业运营岗', major: '工商管理、产业经济学、国际经济与贸易', education: '本科及以上', count: 0 },
      { position: '综合管理岗', major: '行政管理、人力资源管理、汉语言文学', education: '本科及以上', count: 0 },
    ],
  } as JobDetail & { hasAttachment: boolean; bodyLength: number },
  {
    id: 'soe-007',
    title: '宁波城建投资集团有限公司招聘公告',
    organization: '宁波城建投资集团有限公司',
    type: 'soe',
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'bachelor',
    recruitCount: 16,
    publishDate: '2026-09-05T00:00:00.000Z',
    deadline: '2026-09-24T17:00:00.000Z',
    isLongTerm: false,
    source: '宁波市人民政府国有资产监督管理委员会',
    sourceUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_c10d74f05354eecc6cbeee71b2b89e44.html',
    description: '宁波城建投资集团有限公司面向社会公开招聘工作人员16名。招聘岗位涵盖工程管理、金融投资、信息技术、综合管理等多个方向。',
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '具有良好的品行和职业道德',
      '具有招聘岗位所需的学历、专业及技能条件',
      '具有适应岗位要求的身体条件',
      '详见招聘公告原文',
    ],
    benefits: ['国企正式编制', '五险一金', '带薪年假', '节日福利'],
    applicationUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_c10d74f05354eecc6cbeee71b2b89e44.html',
    hasAttachment: true,
    bodyLength: 5600,
    positions: [
      { position: '工程管理岗', major: '土木工程、工程管理、建筑学', education: '本科及以上', count: 4 },
      { position: '金融财务岗', major: '金融学、会计学、财务管理', education: '本科及以上', count: 3 },
      { position: '信息技术岗', major: '计算机科学与技术、电子信息工程、人工智能', education: '本科及以上', count: 2 },
      { position: '综合文秘岗', major: '中国语言文学、新闻传播学、汉语言文学', education: '本科及以上', count: 2 },
      { position: '能源动力岗', major: '能源动力类、土木类、安全科学与工程类', education: '本科及以上', count: 3 },
      { position: '法务岗', major: '法学、法律', education: '本科及以上', count: 2 },
    ],
  } as JobDetail & { hasAttachment: boolean; bodyLength: number },
  {
    id: 'soe-008',
    title: '宁麓置地（宁波）有限公司招聘公告',
    organization: '宁麓置地（宁波）有限公司',
    type: 'soe',
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'bachelor',
    recruitCount: 13,
    publishDate: '2026-09-08T00:00:00.000Z',
    deadline: '2026-09-25T17:00:00.000Z',
    isLongTerm: false,
    source: '宁波市人民政府国有资产监督管理委员会',
    sourceUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_2ccf5d88b15c6ae2058bc6d1d7a4f242.html',
    description: '宁麓置地（宁波）有限公司面向社会公开招聘工作人员13名。招聘岗位涵盖房地产开发、工程建设、市场营销、财务管理等方向。',
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '具有良好的品行和职业道德',
      '具有招聘岗位所需的学历、专业及技能条件',
      '详见招聘公告原文',
    ],
    benefits: ['国企正式编制', '五险一金', '带薪年假', '节日福利'],
    applicationUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_2ccf5d88b15c6ae2058bc6d1d7a4f242.html',
    hasAttachment: true,
    bodyLength: 4800,
    positions: [
      { position: '工程管理岗', major: '土木工程、工程管理、建筑学', education: '本科及以上', count: 3 },
      { position: '市场营销岗', major: '市场营销、工商管理、房地产经营管理', education: '本科及以上', count: 3 },
      { position: '财务管理岗', major: '会计学、财务管理、审计学', education: '本科及以上', count: 2 },
      { position: '成本造价岗', major: '工程造价、工程管理', education: '本科及以上', count: 2 },
      { position: '人力资源岗', major: '人力资源管理、工商管理、行政管理', education: '本科及以上', count: 2 },
      { position: '法务岗', major: '法学', education: '本科及以上', count: 1 },
    ],
  } as JobDetail & { hasAttachment: boolean; bodyLength: number },
  {
    id: 'soe-009',
    title: '丰城宁能生物质发电有限公司招聘公告',
    organization: '丰城宁能生物质发电有限公司',
    type: 'soe',
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'junior-college',
    recruitCount: 2,
    publishDate: '2026-09-14T00:00:00.000Z',
    deadline: '2099-12-31T17:00:00.000Z',
    isLongTerm: true,
    source: '宁波市人民政府国有资产监督管理委员会',
    sourceUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_dd224dd1be294c0cc054db17d158517e.html',
    description: '丰城宁能生物质发电有限公司面向社会公开招聘工作人员2名。涉及生产运行、行政管理等岗位，理工科及管理类相关专业均可报名。招满即止。',
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '具有良好的品行和职业道德',
      '具有招聘岗位所需的学历、专业及技能条件',
      '具有相关工作经验者优先',
      '详见招聘公告原文',
    ],
    benefits: ['国企正式编制', '五险一金', '带薪年假', '节日福利'],
    applicationUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_dd224dd1be294c0cc054db17d158517e.html',
    hasAttachment: false,
    bodyLength: 2100,
    positions: [
      { position: '生产运行岗', major: '理工科相关专业', education: '大专及以上', count: 1 },
      { position: '行政管理岗', major: '管理类相关专业', education: '大专及以上', count: 1 },
    ],
  } as JobDetail & { hasAttachment: boolean; bodyLength: number },
  {
    id: 'soe-010',
    title: '宁波农商发展集团有限公司招聘公告',
    organization: '宁波农商发展集团有限公司',
    type: 'soe',
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'bachelor',
    recruitCount: 1,
    publishDate: '2026-09-06T00:00:00.000Z',
    deadline: '2026-09-24T17:00:00.000Z',
    isLongTerm: false,
    source: '宁波市人民政府国有资产监督管理委员会',
    sourceUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_8a81d18f1b76ed2af8f2da32d7128f3c.html',
    description: '宁波农商发展集团有限公司面向社会公开招聘工作人员1名。具体岗位要求及职责详见公告原文。',
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '具有良好的品行和职业道德',
      '具有招聘岗位所需的学历、专业及技能条件',
      '详见招聘公告原文',
    ],
    benefits: ['国企正式编制', '五险一金', '带薪年假', '节日福利'],
    applicationUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_8a81d18f1b76ed2af8f2da32d7128f3c.html',
    hasAttachment: true,
    bodyLength: 2300,
    positions: [
      { position: '农业产业岗', major: '农业经济管理、农村区域发展、农林经济管理', education: '本科及以上', count: 1 },
    ],
  } as JobDetail & { hasAttachment: boolean; bodyLength: number },
  {
    id: 'soe-011',
    title: '宁波交通投资集团有限公司2026年第二批统筹招聘公告',
    organization: '宁波交通投资集团有限公司',
    type: 'soe',
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'bachelor',
    recruitCount: 8,
    publishDate: '2026-08-28T00:00:00.000Z',
    deadline: '2026-09-15T17:00:00.000Z',
    isLongTerm: false,
    source: '宁波市人民政府国有资产监督管理委员会',
    sourceUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_08e78c108821b7bf7113796f56d7766b.html',
    description: '宁波交通投资集团有限公司面向社会公开招聘工作人员8名。招聘岗位涵盖信息技术、港口工程、交通运输、土木工程等方向。',
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '具有良好的品行和职业道德',
      '具有招聘岗位所需的学历、专业及技能条件',
      '具有适应岗位要求的身体条件',
      '详见招聘公告原文',
    ],
    benefits: ['国企正式编制', '五险一金', '带薪年假', '节日福利'],
    applicationUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_08e78c108821b7bf7113796f56d7766b.html',
    hasAttachment: true,
    bodyLength: 5200,
    positions: [
      { position: '信息技术岗', major: '计算机科学与技术、大数据、人工智能、信息与通信工程', education: '本科及以上', count: 2 },
      { position: '港口航道岗', major: '港口航道与海岸工程、船舶与海洋工程、水利工程', education: '本科及以上', count: 2 },
      { position: '交通运输岗', major: '交通运输类、安全科学与工程类', education: '本科及以上', count: 2 },
      { position: '土木工程岗', major: '土木工程类', education: '本科及以上', count: 2 },
    ],
  } as JobDetail & { hasAttachment: boolean; bodyLength: number },
  {
    id: 'soe-012',
    title: '宁波通商控股集团有限公司中层管理人员招聘公告',
    organization: '宁波通商控股集团有限公司',
    type: 'soe',
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'master',
    recruitCount: 1,
    publishDate: '2026-09-01T00:00:00.000Z',
    deadline: '2026-09-22T17:00:00.000Z',
    isLongTerm: false,
    source: '宁波市人民政府国有资产监督管理委员会',
    sourceUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_cd1b0856e3f45a445697beb3e10b8cdc.html',
    description: '宁波通商控股集团有限公司面向社会公开招聘中层管理人员1名。要求具有丰富的行业管理经验和团队领导能力，具体要求详见公告原文。',
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '具有良好的品行和职业道德',
      '具有招聘岗位所需的学历、专业及丰富的管理经验',
      '详见招聘公告原文',
    ],
    benefits: ['国企中层管理岗', '五险一金', '年薪制', '节日福利'],
    applicationUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_cd1b0856e3f45a445697beb3e10b8cdc.html',
    hasAttachment: false,
    bodyLength: 2800,
    positions: [
      { position: '中层管理岗', major: '详见招聘公告原文', education: '硕士研究生及以上', count: 1 },
    ],
  } as JobDetail & { hasAttachment: boolean; bodyLength: number },
  {
    id: 'soe-013',
    title: '宁波人才投资有限公司2026年第五批人员招聘公告',
    organization: '宁波人才投资有限公司',
    type: 'soe',
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'bachelor',
    recruitCount: 4,
    publishDate: '2026-09-02T00:00:00.000Z',
    deadline: '2026-09-22T17:00:00.000Z',
    isLongTerm: false,
    source: '宁波市人民政府国有资产监督管理委员会',
    sourceUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_4bd16fac166217ad831fe905049b0949.html',
    description: '宁波人才投资有限公司2026年第五批人员招聘，面向社会公开招聘工作人员4名。招聘岗位涵盖人才服务、投资运营、综合管理等方向。',
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '具有良好的品行和职业道德',
      '具有招聘岗位所需的学历、专业及技能条件',
      '详见招聘公告原文',
    ],
    benefits: ['国企正式编制', '五险一金', '带薪年假', '节日福利'],
    applicationUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_4bd16fac166217ad831fe905049b0949.html',
    hasAttachment: true,
    bodyLength: 3600,
    positions: [
      { position: '人才服务岗', major: '人力资源管理、工商管理、公共管理', education: '本科及以上', count: 1 },
      { position: '投资运营岗', major: '金融学、投资学、经济学', education: '本科及以上', count: 1 },
      { position: '综合管理岗', major: '行政管理、汉语言文学、新闻学', education: '本科及以上', count: 1 },
      { position: '财务岗', major: '会计学、财务管理、审计学', education: '本科及以上', count: 1 },
    ],
  } as JobDetail & { hasAttachment: boolean; bodyLength: number },
  {
    id: 'soe-014',
    title: '宁波凯通物产有限公司招聘公告',
    organization: '宁波凯通物产有限公司',
    type: 'soe',
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'bachelor',
    recruitCount: 0,
    publishDate: '2026-08-25T00:00:00.000Z',
    deadline: '2026-09-08T17:00:00.000Z',
    isLongTerm: false,
    source: '宁波市人民政府国有资产监督管理委员会',
    sourceUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_ed0192e0d06736fbe788a772f6b355e8.html',
    description: '宁波凯通物产有限公司面向社会公开招聘工作人员。招聘岗位涵盖贸易业务、供应链管理、财务等方向，具体人数详见公告原文。',
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '具有良好的品行和职业道德',
      '具有招聘岗位所需的学历、专业及技能条件',
      '详见招聘公告原文',
    ],
    benefits: ['国企正式编制', '五险一金', '带薪年假', '节日福利'],
    applicationUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_ed0192e0d06736fbe788a772f6b355e8.html',
    hasAttachment: false,
    bodyLength: 2400,
    positions: [
      { position: '贸易业务岗', major: '国际经济与贸易、市场营销、工商管理', education: '本科及以上', count: 0 },
      { position: '供应链管理岗', major: '供应链管理、物流管理', education: '本科及以上', count: 0 },
      { position: '财务岗', major: '会计学、财务管理', education: '本科及以上', count: 0 },
    ],
  } as JobDetail & { hasAttachment: boolean; bodyLength: number },
  {
    id: 'soe-015',
    title: '宁波能源实业有限公司招聘公告',
    organization: '宁波能源实业有限公司',
    type: 'soe',
    location: '浙江省宁波市',
    province: '浙江',
    city: '宁波市',
    education: 'bachelor',
    recruitCount: 0,
    publishDate: '2026-08-22T00:00:00.000Z',
    deadline: '2026-09-07T17:00:00.000Z',
    isLongTerm: false,
    source: '宁波市人民政府国有资产监督管理委员会',
    sourceUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_5ba5e1918f6cf98b33701cb8cdd23801.html',
    description: '宁波能源实业有限公司面向社会公开招聘工作人员。招聘岗位涵盖能源生产、技术管理、安全环保等方向，具体人数详见公告原文。',
    requirements: [
      '具有中华人民共和国国籍，遵守中华人民共和国宪法、法律和法规',
      '具有良好的品行和职业道德',
      '具有招聘岗位所需的学历、专业及技能条件',
      '详见招聘公告原文',
    ],
    benefits: ['国企正式编制', '五险一金', '带薪年假', '节日福利'],
    applicationUrl: 'http://gzw.ningbo.gov.cn/col/col1229671219/art/2026/art_5ba5e1918f6cf98b33701cb8cdd23801.html',
    hasAttachment: false,
    bodyLength: 2600,
    positions: [
      { position: '能源生产岗', major: '能源与动力工程、电气工程及其自动化', education: '本科及以上', count: 0 },
      { position: '技术管理岗', major: '机械工程、自动化', education: '本科及以上', count: 0 },
      { position: '安全环保岗', major: '安全工程、环境工程', education: '本科及以上', count: 0 },
    ],
  } as JobDetail & { hasAttachment: boolean; bodyLength: number },
];

export const mockJobs: JobDetail[] = [
   ...collectedJobDetails,
   ...soeJobs,
 ];

export function getJobById(id: string): JobDetail | undefined {
  return mockJobs.find((job: JobDetail) => job.id === id);
}

export function getJobList(params: {
  page?: number;
  pageSize?: number;
  type?: JobType;
  province?: string;
  city?: string;
  education?: EducationLevel;
  keyword?: string;
  major?: string;
  publishDays?: number;
  sortBy?: 'deadline' | 'recruitCount';
  onlyHiring?: boolean;
}): { items: JobItem[]; total: number } {
  const {
    page = 1,
    pageSize = 10,
    type,
    province,
    city,
    education,
    keyword,
    major,
    publishDays,
     sortBy = 'deadline',
     onlyHiring,
   } = params;

  let filtered = [...mockJobs];

  if (onlyHiring) {
    const nowMs = Date.now();
    filtered = filtered.filter((job: JobDetail) => new Date(job.deadline).getTime() >= nowMs);
  }
  if (type) {
    filtered = filtered.filter((job: JobDetail) => job.type === type);
  }
  if (province) {
    filtered = filtered.filter((job: JobDetail) => job.province === province);
  }
  if (city) {
    filtered = filtered.filter((job: JobDetail) => job.city === city);
  }
  if (education) {
    const userEduOrder: Record<EducationLevel, number> = {
      'unlimited': 0,
      'junior-college': 1,
      'bachelor': 2,
      'master': 3,
      'phd': 4,
    };
    const userLevel = userEduOrder[education];
    filtered = filtered.filter((job: JobDetail) => {
      if (!job.positions || job.positions.length === 0) {
        const reqLevel = userEduOrder[job.education] ?? 0;
        return reqLevel <= userLevel;
      }
      return job.positions.some((pos: JobPosition) => {
        const reqLevel = getPositionEducationLevel(pos.education);
        return reqLevel <= userLevel;
      });
    });
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    filtered = filtered.filter(
      (job: JobDetail) =>
        job.title.toLowerCase().includes(kw) ||
        job.organization.toLowerCase().includes(kw),
    );
  }
  let majorKeywords: string[] = [];
  if (major && major.trim()) {
    majorKeywords = major
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((k: string) => k.toLowerCase());
    filtered = filtered.filter((job: JobDetail) => {
      if (!job.positions || job.positions.length === 0) return false;
      return job.positions.some((pos: JobPosition) =>
        majorKeywords.some((kw: string) => pos.major.toLowerCase().includes(kw)),
      );
    });
  }
  if (publishDays) {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - publishDays);
    filtered = filtered.filter((job: JobDetail) => new Date(job.publishDate) >= cutoff);
  }

  filtered.sort((a: JobDetail, b: JobDetail) => {
    if (sortBy === 'recruitCount') {
      const aCount = a.recruitCount ?? 0;
      const bCount = b.recruitCount ?? 0;
      return bCount - aCount;
    }
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map((job: JobDetail) => {
    const { description, requirements, benefits, applicationUrl, contactInfo, ...item } = job;
    const enrichedPositions = item.positions?.map((pos: JobPosition) => {
      let matchType: 'exact' | 'similar' | undefined;
      if (majorKeywords.length > 0) {
        const majorLower = pos.major.toLowerCase();
        const hasExact = majorKeywords.some((kw: string) => {
          if (majorLower === kw) return true;
          const pattern = new RegExp(`(^|[（(、,，\s])${kw}(\s*$|[）)、,，/\s])`, 'i');
          return pattern.test(majorLower);
        });
        const hasFuzzy = majorKeywords.some((kw: string) =>
          majorLower.includes(kw),
        );
        if (hasExact) matchType = 'exact';
        else if (hasFuzzy) matchType = 'similar';
      }
      return { ...pos, matchType };
    });
    return { ...item, positions: enrichedPositions } as JobItem;
  });

  return { items, total };
}

export const provinces = ['浙江'];

export const cityMap: Record<string, string[]> = {
  '浙江': ['宁波市'],
};
