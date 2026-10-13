import { useState } from 'react';
import { X, Phone, Lock, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UniversalLink } from '@lark-apaas/client-toolkit/components/UniversalLink';

const LoginModal = () => {
  const { isLoginOpen, closeLogin, login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [agreed, setAgreed] = useState(true);

  if (!isLoginOpen) return null;

  const handleSendCode = () => {
    if (phone.length !== 11 || countdown > 0) return;
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    login(phone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-blue-600 to-blue-800" />
        <button
          onClick={closeLogin}
          className="absolute top-4 right-4 z-10 p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          aria-label="关闭"
        >
          <X size={20} />
        </button>

        <div className="relative pt-10 px-8 pb-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white shadow-lg flex items-center justify-center">
              <span className="text-blue-700 font-bold text-xl">J</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'login' ? '欢迎回来' : '注册新账号'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'login' ? '登录后解锁更多岗位信息' : '注册即可免费浏览优质岗位'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="验证码"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full pl-10 pr-24 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={phone.length !== 11 || countdown > 0}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
              </button>
            </div>

            <label className="flex items-start gap-2 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                我已阅读并同意
                <UniversalLink className="text-blue-600 hover:underline" to="#">《用户协议》</UniversalLink>
                和
                <UniversalLink className="text-blue-600 hover:underline" to="#">《隐私政策》</UniversalLink>
              </span>
            </label>

            <button
              type="submit"
              disabled={!agreed || phone.length !== 11 || code.length !== 6}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {mode === 'login' ? '登录' : '注册'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm">
            <span className="text-gray-500">
              {mode === 'login' ? '还没有账号？' : '已有账号？'}
            </span>
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-blue-600 font-medium hover:underline"
            >
              {mode === 'login' ? '立即注册' : '立即登录'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <Crown size={16} />
              <span className="text-sm font-semibold">新用户专享</span>
            </div>
            <p className="text-xs text-amber-600">
              首次注册即送 7 天专业版会员体验
              <ArrowRight size={12} className="inline ml-1" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
