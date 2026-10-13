import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  saveAmount?: number;
  perMonth: string;
  badge?: string;
  features: string[];
}

const plans: Plan[] = [
  {
    id: 'month',
    name: '月度套餐',
    price: 29.9,
    perMonth: '¥29.9/月',
    features: ['按月付费', '随时取消', '全部专业版权益'],
  },
  {
    id: 'quarter',
    name: '季度套餐',
    price: 79.9,
    originalPrice: 89.7,
    saveAmount: 10,
    perMonth: '约 ¥26.6/月',
    badge: '热门推荐',
    features: ['3个月会员', '立省 ¥10', '全部专业版权益', '专属备考资料'],
  },
  {
    id: 'year',
    name: '年度套餐',
    price: 269,
    originalPrice: 358.8,
    saveAmount: 89.8,
    perMonth: '约 ¥22.4/月',
    badge: '最划算',
    features: ['12个月会员', '立省 ¥89.8', '全部专业版权益', '专属备考资料', '年度专属福利'],
  },
];

interface PlanSelectorProps {
  selectedPlan: string;
  onSelect: (id: string) => void;
  onSubscribe: () => void;
}

const PlanSelector = ({ selectedPlan, onSelect, onSubscribe }: PlanSelectorProps) => {
  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">选择适合你的套餐</h2>
        <p className="text-gray-500 text-sm">不同周期，同样的专业服务</p>
      </div>
      <div
        className="grid md:grid-cols-3 gap-6"
        data-ai-section-type="card-list"
      >
        {plans.map((plan: Plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => onSelect(plan.id)}
              className={`relative bg-white rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-2 border-blue-700 shadow-lg scale-[1.02]'
                  : 'border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={`text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
                      plan.id === 'year'
                        ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500'
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-2">
                {plan.name}
              </h3>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900 tabular-nums">
                  ¥{plan.price}
                </span>
                <span className="text-gray-500 text-sm"> / {plan.id === 'month' ? '月' : plan.id === 'quarter' ? '季' : '年'}</span>
              </div>
              {plan.originalPrice && (
                <div className="mb-2">
                  <span className="text-gray-400 text-sm line-through">
                    原价 ¥{plan.originalPrice}
                  </span>
                  {plan.saveAmount !== undefined && (
                    <span className="ml-2 text-rose-500 text-xs font-medium">
                      省 ¥{plan.saveAmount}
                    </span>
                  )}
                </div>
              )}
              <p className="text-blue-700 text-sm font-medium mb-4">{plan.perMonth}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isSelected ? 'text-blue-700' : 'text-gray-400'
                      }`}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={isSelected ? 'default' : 'outline'}
                className="w-full"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onSelect(plan.id);
                  onSubscribe();
                }}
              >
                {isSelected ? '立即开通' : '选择此套餐'}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PlanSelector;
