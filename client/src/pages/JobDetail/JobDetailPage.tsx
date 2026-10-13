import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  MapPin,
  GraduationCap,
  Users,
  Calendar,
  Hourglass,
  Building2,
  Globe,
  ExternalLink,
  ShieldAlert,
  Briefcase,
  Database,
  BookOpen,
  UserCheck,
} from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { Card, CardContent } from '@client/src/components/ui/card';
import { Badge } from '@client/src/components/ui/badge';
import { Button } from '@client/src/components/ui/button';
import { Skeleton } from '@client/src/components/ui/skeleton';
import CountdownBanner from './CountdownBanner';

import { getJobDetail } from '@client/src/api/jobs';
import {
  JOB_TYPE_LABELS,
  JOB_TYPE_COLORS,
  EDUCATION_LABELS,
} from '@shared/api.interface';
import type { JobDetail as JobDetailType } from '@shared/api.interface';
import { UniversalLink } from '@lark-apaas/client-toolkit/components/UniversalLink';

const formatDate = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data: JobDetailType = await getJobDetail(id);
        if (!cancelled) {
          setJob(data);
        }
      } catch (err: unknown) {
        logger.error('获取职位详情失败', err);
        if (!cancelled) {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleShare = () => {
    // 仅展示
  };

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (notFound || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">岗位不存在</h1>
          <p className="text-gray-500 mb-6">该岗位可能已下架或链接有误</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  const typeColor = JOB_TYPE_COLORS[job.type];
  const typeLabel = JOB_TYPE_LABELS[job.type];
  const educationLabel = job.educationLevels && job.educationLevels.length > 0
    ? job.educationLevels.map((lvl) => EDUCATION_LABELS[lvl] || lvl).join(' / ')
    : '学历详见原文';
  const recruitCountText = job.recruitCount > 0
    ? `招聘 ${job.recruitCount} 人`
    : '人数详见原文';

  return (
    <div className="bg-[#f5f5f7] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        {/* 顶部：返回 + 分享 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0071e3] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            aria-label="分享"
            className="rounded-xl"
          >
            <Share2 className="w-5 h-5 text-gray-400" />
          </Button>
        </div>

        {/* 1. 职位标题卡 */}
        <Card className="mb-4 border-gray-100 rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start gap-2 mb-3">
              <Badge
                variant="secondary"
                className={`${typeColor.bg} ${typeColor.text} border-0 rounded-full`}
              >
                {typeLabel}
              </Badge>
              {job.isHot && (
                <Badge
                  variant="destructive"
                  className="bg-red-500 text-white border-0 rounded-full"
                >
                  🔥 热门
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 leading-tight mb-2 tracking-tight">
              {job.title}
            </h1>
            <p className="text-gray-500 text-sm mb-4">{job.organization}</p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-gray-400" />
                <span>{educationLabel}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{recruitCountText}</span>
              </div>
            </div>

            {job.salary && (
              <div className="text-lg font-semibold text-red-500">
                {job.salary}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. 报名倒计时横幅 */}
        <div className="mb-4">
          {job.deadline ? (
            <CountdownBanner deadline={job.deadline} />
          ) : (
            <div className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Hourglass className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-base font-semibold text-gray-700">截止时间不确定</div>
                  <div className="text-sm text-gray-500">请查看公告原文确认报名截止日期</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. 报名信息卡 */}
        <Card className="mb-4 border-gray-100 rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              报名信息
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <InfoRow
                icon={<Calendar className="w-4 h-4 text-gray-400" />}
                label="发布时间"
                value={formatDate(job.publishDate)}
              />
              <InfoRow
                icon={<Hourglass className="w-4 h-4 text-gray-400" />}
                label="报名截止"
                 value={formatDate(job.deadline) || '截止时间不确定'}
              />
              <InfoRow
                icon={<GraduationCap className="w-4 h-4 text-gray-400" />}
                label="学历要求"
                value={educationLabel}
              />
              <InfoRow
                icon={<Users className="w-4 h-4 text-gray-400" />}
                label="招聘人数"
                value={job.recruitCount > 0 ? `${job.recruitCount} 人` : '详见原文'}
              />
              <InfoRow
                icon={<Globe className="w-4 h-4 text-gray-400" />}
                label="岗位来源"
                value={job.source}
              />
              <InfoRow
                icon={<MapPin className="w-4 h-4 text-gray-400" />}
                label="工作地点"
                value={job.location}
              />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400">
              <Database size={12} />
              <span>数据来源：{job.source}</span>
            </div>
          </CardContent>
        </Card>

        {/* 4. 通用报考条件 */}
        {job.generalConditions && (
          <Card className="mb-4 border-gray-100 rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#0071e3]" />
                报考条件
              </h2>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {job.generalConditions}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 5. 岗位与专业要求 */}
        {job.positions && job.positions.length > 0 && (
          <Card className="mb-4 border-gray-100 rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#0071e3]" />
                岗位与专业要求
              </h2>
              <div className="space-y-3">
                {job.positions.map((pos, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-100 rounded-xl p-4 bg-gray-50/50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h3 className="text-base font-medium text-gray-900">
                        {pos.position}
                      </h3>
                      <span className="text-xs font-medium text-[#0071e3] bg-blue-50 px-2.5 py-0.5 rounded-full">
                        {pos.count > 0 ? `招聘 ${pos.count} 人` : '人数详见原文'}
                      </span>
                    </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                        {pos.education && (
                          <span className="flex items-center gap-1">
                            <GraduationCap size={12} />
                            {EDUCATION_LABELS[pos.education as keyof typeof EDUCATION_LABELS] || pos.education}
                          </span>
                        )}
                        {pos.count > 0 && (
                          <span className="flex items-center gap-1">
                            <UserCheck size={12} />
                            共 {pos.count} 个名额
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {pos.major ? (
                          <>
                            <span className="text-gray-500 font-medium">专业要求：</span>
                            {pos.major}
                          </>
                        ) : (
                          <span className="text-gray-400">专业要求详见公告原文</span>
                        )}
                      </div>
                      {pos.ageRequirement && (
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-2">
                          <span className="text-gray-500 font-medium">年龄要求：</span>
                          {pos.ageRequirement}
                        </div>
                      )}
                      {pos.hardMajor && (
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-2">
                          <span className="text-gray-500 font-medium">硬性专业要求：</span>
                          {pos.hardMajor}
                        </div>
                      )}
                      {pos.hardRequirements && (
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-2">
                          <span className="text-gray-500 font-medium">其他硬性要求：</span>
                          {pos.hardRequirements}
                        </div>
                      )}
                      {pos.responsibility && (
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-2">
                          <span className="text-gray-500 font-medium">岗位职责：</span>
                          {pos.responsibility}
                        </div>
                      )}
                      {pos.otherRequirements && (
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-2">
                          <span className="text-gray-500 font-medium">其他资格条件：</span>
                          {pos.otherRequirements}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 6. 职位描述 */}
        <Card className="mb-4 border-gray-100 rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#0071e3]" />
              职位描述
            </h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </CardContent>
        </Card>

        {/* 5. 任职要求 */}
        <Card className="mb-4 border-gray-100 rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#0071e3]" />
              任职要求
            </h2>
            <ol className="space-y-2 text-sm text-gray-700 leading-relaxed">
              {job.requirements.map((req: string, idx: number) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-[#0071e3] text-xs font-semibold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{req}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* 6. 福利待遇 */}
        {job.benefits && job.benefits.length > 0 && (
          <Card className="mb-4 border-gray-100 rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-lg">🎁</span>
                福利待遇
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit: string, idx: number) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="bg-green-50 text-green-600 border border-green-100 font-normal px-3 py-1 rounded-full"
                  >
                    {benefit}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 7. 报名入口 */}
        <Card className="mb-4 border-gray-100 rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0071e3]" />
              报名入口
            </h2>
            {job.applicationUrl || job.sourceUrl ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  {job.sourceUrl && (
                    <UniversalLink
                      to={job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0071e3] text-white rounded-xl font-medium hover:bg-[#0077ed] transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      查看公告原文
                    </UniversalLink>
                  )}
                  {job.applicationUrl && job.applicationUrl !== job.sourceUrl && (
                    <UniversalLink
                      to={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      报名系统入口
                    </UniversalLink>
                  )}
                </div>
                <p className="mt-3 text-xs text-gray-400">
                  数据来源：{job.source}
                </p>
                <div className="mt-4 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>报名请前往官方渠道，谨防诈骗</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">暂无报名链接</p>
            )}
          </CardContent>
        </Card>

        {/* 8. 相关推荐 */}
        <Card className="mb-8 border-gray-100 rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              相似岗位
            </h2>
            <div className="text-center py-8 text-sm text-gray-400">
              <p>为你推荐更多优质岗位</p>
              <Link
                to="/"
                className="inline-block mt-3 text-[#0071e3] hover:underline"
              >
                查看全部岗位 →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <div className="flex items-center gap-2">
    {icon}
    <span className="text-gray-400 flex-shrink-0 w-20">{label}</span>
    <span className="text-gray-800 font-medium truncate">{value}</span>
  </div>
);

const JobDetailSkeleton = () => (
  <div className="bg-[#f5f5f7] min-h-screen">
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>

      <Card className="mb-4 border-gray-100 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex gap-2 mb-3">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-8 w-3/4 mb-3" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="flex gap-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>

      <Skeleton className="h-24 w-full rounded-2xl mb-4" />

      <Card className="mb-4 border-gray-100 rounded-2xl">
        <CardContent className="p-6">
          <Skeleton className="h-5 w-24 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i: number) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 border-gray-100 rounded-2xl">
        <CardContent className="p-6">
          <Skeleton className="h-5 w-24 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  </div>
);

export default JobDetailPage;
