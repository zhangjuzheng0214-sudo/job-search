import { Link } from 'react-router-dom';
import { MapPin, GraduationCap, Users, Clock, Target, ExternalLink } from 'lucide-react';
import { useCountdown } from '@client/src/hooks/useCountdown';
import {
  JOB_TYPE_LABELS,
  JOB_TYPE_COLORS,
  EDUCATION_LABELS,
  type JobItem,
  type JobType,
} from '@shared/api.interface';
import { UniversalLink } from '@lark-apaas/client-toolkit/components/UniversalLink';

interface JobCardProps {
  job: JobItem;
  highlightMajor?: boolean;
}

const TYPE_STRIPE_COLORS: Record<JobType, string> = {
  'civil': 'bg-blue-400',
  'public-institution': 'bg-purple-400',
  'soe': 'bg-amber-400',
  'teacher': 'bg-cyan-400',
  'labor-dispatch': 'bg-green-400',
};

const JobCard = ({ job, highlightMajor }: JobCardProps) => {
  const { days, hours, isExpired, isUrgent, isValid: isDeadlineValid } = useCountdown(job.deadline);
  const typeColors = JOB_TYPE_COLORS[job.type];
  const stripeColor = TYPE_STRIPE_COLORS[job.type];
  const hasNoDeadline = !isDeadlineValid;

  return (
    <div className="group relative block bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-px transition-all duration-300 ease-out overflow-hidden">
      {/* Left color stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${stripeColor}`} />

      <Link
        to={`/job/${job.id}`}
        className="block pl-5 pr-5 pt-4 no-underline"
      >
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#0071e3] transition-colors line-clamp-1">
            {job.title}
          </h3>
          {job.isHot && (
            <span className="shrink-0 px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-md">
              热门
            </span>
          )}
        </div>

        {/* Organization */}
        <p className="text-sm text-gray-500 mb-3 line-clamp-1">{job.organization}</p>

        {/* Type badge */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${typeColors.bg} ${typeColors.text}`}
          >
            {JOB_TYPE_LABELS[job.type]}
          </span>
          {highlightMajor && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Target size={11} />
              专业匹配
            </span>
          )}
        </div>

        {/* Meta row: location + education + count */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <GraduationCap size={12} />
            {job.educationLevels && job.educationLevels.length > 0
              ? job.educationLevels.map((lvl) => EDUCATION_LABELS[lvl] || lvl).join(' / ')
              : '学历详见原文'}
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {job.recruitCount > 0 ? `招 ${job.recruitCount} 人` : '人数详见原文'}
          </span>
        </div>

        {/* Matched positions when filtering by major */}
        {highlightMajor && job.positions && job.positions.length > 0 && (
          <div className="mb-3 space-y-1.5">
            {job.positions
              .filter((pos) => pos.matchType)
              .slice(0, 3)
              .map((pos, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="text-gray-700 truncate">{pos.position}</span>
                  {pos.matchType === 'exact' ? (
                    <span className="shrink-0 px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">
                      精确匹配
                    </span>
                  ) : (
                    <span className="shrink-0 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-medium">
                      相近专业
                    </span>
                  )}
                </div>
              ))}
          </div>
        )}
      </Link>

      {/* Bottom row: source + countdown (outside Link to avoid nested anchor issues) */}
      <div className="pl-5 pr-5 pb-4">
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {job.sourceUrl ? (
            <UniversalLink
              to={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#0071e3] hover:text-[#0077ed] transition-colors"
            >
              <ExternalLink size={12} />
              查看公告原文
            </UniversalLink>
          ) : (
            <span className="text-xs text-gray-400">来源：{job.source}</span>
          )}

          {hasNoDeadline ? (
            <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
              <Clock size={12} />
              截止时间不确定
            </span>
          ) : isExpired ? (
            <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#d70015] bg-[#fef2f2] rounded-full">
              <Clock size={12} />
              已截止
            </span>
          ) : isUrgent ? (
            <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#ff9500] bg-[#fff7e6] rounded-full tabular-nums">
              <Clock size={12} />
              还剩 {days} 天 {hours} 小时
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0071e3] bg-[#eff6ff] rounded-full tabular-nums">
              <Clock size={12} />
              还剩 {days} 天 {hours} 小时
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
