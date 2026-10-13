import { Clock, AlertTriangle } from 'lucide-react';
import { useCountdown } from '@client/src/hooks/useCountdown';

interface CountdownBannerProps {
  deadline: string;
}

const CountdownBanner = ({ deadline }: CountdownBannerProps) => {
  const { days, hours, minutes, isExpired, isUrgent } = useCountdown(deadline);

  // 已截止
  if (isExpired) {
    return (
      <div className="w-full rounded-2xl bg-[#fef2f2] border border-[#fecaca] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#fee2e2] flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#d70015]" />
          </div>
          <div>
            <div className="text-base font-semibold text-[#d70015]">已截止</div>
            <div className="text-sm text-[#dc2626]">该岗位报名通道已关闭</div>
          </div>
        </div>
      </div>
    );
  }

  // 临期（1～3天）：橙色背景 + 橙色文字
  if (isUrgent) {
    return (
      <div className="w-full rounded-2xl bg-[#fff7e6] border border-[#ffe0b2] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#ffe0b2] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[#ff9500]" />
          </div>
          <div>
            <div className="text-base font-semibold text-[#ff9500]">报名即将截止</div>
            <div className="text-sm text-[#f59e0b] font-medium tabular-nums">
              还剩 <span className="font-semibold">{days}</span> 天{' '}
              <span className="font-semibold">{hours}</span> 小时{' '}
              <span className="font-semibold">{minutes}</span> 分
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 正常进行中：浅色背景 + Apple 蓝文字
  return (
    <div className="w-full rounded-2xl bg-blue-50 border border-blue-100 px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100/80 flex items-center justify-center">
          <Clock className="w-5 h-5 text-[#0071e3]" />
        </div>
        <div>
          <div className="text-base font-semibold text-[#0071e3]">报名进行中</div>
          <div className="text-sm text-blue-600 font-medium tabular-nums">
            还剩 <span className="font-semibold">{days}</span> 天{' '}
            <span className="font-semibold">{hours}</span> 小时{' '}
            <span className="font-semibold">{minutes}</span> 分
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownBanner;
