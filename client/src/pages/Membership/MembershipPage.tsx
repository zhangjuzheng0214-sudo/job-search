import { useState } from 'react';
import { toast } from 'sonner';
import HeroSection from './components/HeroSection';
import TierComparison from './components/TierComparison';
import PlanSelector from './components/PlanSelector';
import BenefitsGrid from './components/BenefitsGrid';
import FaqSection from './components/FaqSection';
import CtaBanner from './components/CtaBanner';

const MembershipPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('quarter');

  const handleSubscribe = () => {
    toast.success('即将跳转到支付页面');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-16 relative z-10">
        <TierComparison onSubscribe={handleSubscribe} />
      </div>
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-16">
        <PlanSelector
          selectedPlan={selectedPlan}
          onSelect={setSelectedPlan}
          onSubscribe={handleSubscribe}
        />
      </div>
      <div className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <BenefitsGrid />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-16">
        <FaqSection />
      </div>
      <CtaBanner onSubscribe={handleSubscribe} />
    </div>
  );
};

export default MembershipPage;
