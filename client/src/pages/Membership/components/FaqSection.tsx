import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: '会员可以退款吗？',
    answer:
      '会员开通后 7 天内，如未使用任何会员专属功能，可申请全额退款。超过 7 天或已使用会员功能的，暂不支持退款。如有疑问可联系客服处理。',
  },
  {
    question: '会员到期后数据会保留吗？',
    answer:
      '会保留。你的收藏、订阅关键词、浏览记录等个人数据会永久保留，只是会员专属功能将无法使用。重新开通后可继续使用。',
  },
  {
    question: '支持哪些支付方式？',
    answer:
      '目前支持微信支付、支付宝两种主流支付方式。支付均由第三方支付平台托管，安全可靠。',
  },
  {
    question: '如何取消自动续费？',
    answer:
      '你可以在「我的 - 会员中心 - 管理续费」中随时关闭自动续费。关闭后当前会员周期内仍可正常使用，到期后不再自动扣费。',
  },
];

const FaqSection = () => {
  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">常见问题</h2>
        <p className="text-gray-500 text-sm">关于会员订阅，你可能想了解的</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-6">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq: { question: string; answer: string }, i: number) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-gray-900 font-medium hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-500 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
