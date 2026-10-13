import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TierComparisonProps {
  onSubscribe: () => void;
}

const freeFeatures = [
  { name: '浏览基础岗位列表', included: true },
  { name: '基础筛选功能', included: true },
  { name: '查看岗位摘要信息', included: true },
];

const proFeatures = [
  { name: '全部权益 + 完整职位详情', included: true },
  { name: '报名截止倒计时提醒（推送通知）', included: true },
  { name: '关键词订阅，新岗位即时提醒', included: true },
  { name: '高级筛选（多地区、多类型组合）', included: true },
  { name: '专属备考资料下载', included: true },
  { name: '无广告纯净体验', included: true },
  { name: '优先客服支持', included: true },
];

const TierComparison = ({ onSubscribe }: TierComparisonProps) => {
  return (
    <section className="grid md:grid-cols-2 gap-6" data-ai-section-type="card-list">
      {/* Free Tier */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 flex flex-col">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">免费版</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900 tabular-nums">¥0</span>
            <span className="text-gray-500 text-sm">/ 永久</span>
          </div>
        </div>
        <ul className="space-y-3 mb-8 flex-1">
          {freeFeatures.map((feature: { name: string; included: boolean }, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm">{feature.name}</span>
            </li>
          ))}
          {proFeatures.slice(0, 4).map((feature: { name: string; included: boolean }, i: number) => (
            <li key={`pro-${i}`} className="flex items-start gap-3">
              <X className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
              <span className="text-gray-400 text-sm line-through">{feature.name}</span>
            </li>
          ))}
        </ul>
        <Button variant="outline" disabled className="w-full">
          当前方案
        </Button>
      </div>

      {/* Pro Tier */}
      <div className="bg-white rounded-lg border-2 border-amber-400 shadow-md p-8 flex flex-col relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-sm">
            最受欢迎
          </span>
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">专业版</h3>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl font-bold text-amber-600 tabular-nums">¥29.9</span>
            <span className="text-gray-500 text-sm">/ 月起</span>
            <span className="text-gray-400 text-sm line-through">¥49/月</span>
          </div>
        </div>
        <ul className="space-y-3 mb-8 flex-1">
          {proFeatures.map((feature: { name: string; included: boolean }, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-gray-800 text-sm font-medium">{feature.name}</span>
            </li>
          ))}
        </ul>
        <Button
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0"
          onClick={onSubscribe}
        >
          立即开通
        </Button>
      </div>
    </section>
  );
};

export default TierComparison;
