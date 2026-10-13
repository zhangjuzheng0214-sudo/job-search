const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-800 text-white pt-20 pb-32 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-5xl mx-auto px-4 md:px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          解锁全部岗位信息，不再错过报名机会
        </h1>
        <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto">
          专业版会员帮你发现信息差，先人一步上岸
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
