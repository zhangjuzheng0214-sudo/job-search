import { Button } from '@/components/ui/button';

interface CtaBannerProps {
  onSubscribe: () => void;
}

const CtaBanner = ({ onSubscribe }: CtaBannerProps) => {
  return (
    <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
      <div className="relative bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-10 md:p-14 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-10 w-64 h-64 bg-amber-300 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            立即开通专业版，发现更多优质岗位
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            10万+岗位信息、智能提醒、备考资料，助你高效求职
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white border-0 px-10 text-base font-semibold shadow-lg"
            onClick={onSubscribe}
          >
            立即开通 ¥29.9 起
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
