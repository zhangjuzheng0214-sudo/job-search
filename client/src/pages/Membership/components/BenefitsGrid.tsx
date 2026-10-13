import {
  Search,
  Bell,
  Rss,
  BookOpen,
  SlidersHorizontal,
  Target,
} from 'lucide-react';

interface Benefit {
  icon: React.ElementType;
  title: string;
  desc: string;
}

const benefits: Benefit[] = [
  { icon: Search, title: '全量岗位库', desc: '10万+优质岗位，每日更新' },
  { icon: Bell, title: '截止倒计时提醒', desc: '报名截止前 3天/1天/1小时 多轮推送' },
  { icon: Rss, title: '关键词订阅', desc: '自定义关键词，新岗位即时通知' },
  { icon: BookOpen, title: '备考资料', desc: '历年真题、模拟题、备考指南下载' },
  { icon: SlidersHorizontal, title: '高级筛选', desc: '多维度组合筛选，精准定位目标岗位' },
  { icon: Target, title: '竞争分析', desc: '岗位报名人数预估，竞争热度分析' },
];

const BenefitsGrid = () => {
  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">专业版会员权益</h2>
        <p className="text-gray-500 text-sm">七大核心权益，助力你更快上岸</p>
      </div>
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        data-ai-section-type="card-menu"
      >
        {benefits.map((b: Benefit, i: number) => {
          const Icon = b.icon;
          return (
            <div
              key={i}
              className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {b.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BenefitsGrid;
