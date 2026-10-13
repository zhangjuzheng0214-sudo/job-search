export type JobType =
  | 'civil'
  | 'public-institution'
  | 'soe'
  | 'teacher'
  | 'labor-dispatch';

export type EducationLevel =
  | 'junior-college'
  | 'bachelor'
  | 'master'
  | 'phd'
  | 'unlimited';

export interface JobPosition {
  position: string;
  major: string;
  education: string;
  count: number;
  responsibility?: string;
  otherRequirements?: string;
  matchType?: 'exact' | 'similar';
  ageRequirement?: string | null;
  hardMajor?: string | null;
  hardRequirements?: string | null;
}

export interface PositionItem {
  id: string;
  positionName: string;
  count: number;
  education: string;
  major: string;
  ageRequirement: string | null;
  hardRequirements: string | null;
  jobId: string;
  jobTitle: string;
  organization: string;
  source: string;
  sourceUrl: string;
  deadline: string;
  publishDate: string;
}

export interface JobItem {
  id: string;
  title: string;
  organization: string;
  type: JobType;
  location: string;
  province: string;
  city: string;
  education: EducationLevel;
  educationLevels: EducationLevel[];
  recruitCount: number;
  publishDate: string;
  deadline: string;
  source: string;
  sourceUrl?: string;
  salary?: string;
  isHot?: boolean;
  isLongTerm?: boolean;
  categories: string[];
  positions?: JobPosition[];
}

export interface JobDetail extends JobItem {
  description: string;
  requirements: string[];
  benefits?: string[];
  applicationUrl?: string;
  contactInfo?: string;
  generalConditions?: string;
  applyStartTime?: string;
}

export interface JobListRequest {
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
  excludeCategories?: string[];
}

export interface JobListResponse {
  items: JobItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PositionListResponse {
  items: PositionItem[];
  total: number;
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  'civil': '公务员',
  'public-institution': '事业单位',
  'soe': '央企国企',
  'teacher': '教师',
  'labor-dispatch': '劳务派遣/外包',
};

export const EDUCATION_LABELS: Record<EducationLevel, string> = {
  'junior-college': '大专及以上',
  'bachelor': '本科及以上',
  'master': '硕士及以上',
  'phd': '博士及以上',
  'unlimited': '不限',
};

export const JOB_CATEGORIES = [
  '教师',
  '医疗卫生',
  '财务审计',
  '金融',
  '信息技术',
  '工程技术',
  '法律法务',
  '综合行政',
  '公安警务',
  '科研',
] as const;

export type JobCategory = typeof JOB_CATEGORIES[number];

export const MY_EDUCATION_OPTIONS: { value: EducationLevel | 'all'; label: string }[] = [
  { value: 'all', label: '全部（不筛选）' },
  { value: 'junior-college', label: '大专（可报：大专及以上 / 学历不限）' },
  { value: 'bachelor', label: '本科（可报：本科及以上 / 大专及以上 / 学历不限）' },
  { value: 'master', label: '硕士（可报：硕士及以上 / 本科及以上 / 大专及以上 / 学历不限）' },
  { value: 'phd', label: '博士（可报：全部岗位）' },
];

export const JOB_TYPE_COLORS: Record<JobType, { bg: string; text: string }> = {
  'civil': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'public-institution': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'soe': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'teacher': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'labor-dispatch': { bg: 'bg-green-100', text: 'text-green-700' },
};

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  duration: string;
  durationUnit: 'month' | 'quarter' | 'year';
  features: string[];
  popular?: boolean;
}

export interface MembershipTier {
  id: 'free' | 'pro';
  name: string;
  description: string;
  features: { name: string; included: boolean }[];
}
