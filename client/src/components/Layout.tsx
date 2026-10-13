import { Outlet, Link, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0071e3] flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <span className="font-semibold text-base text-gray-900">JobHub</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/search"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/70 rounded-xl transition-colors"
                aria-label="搜索"
              >
                <Search size={18} />
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100/70 rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="菜单"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-gray-200/60">
              <nav className="flex flex-col gap-1">
                <Link
                  to="/"
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/70 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  全部岗位
                </Link>
                <Link
                  to="/search"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/70 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Search size={16} />
                  搜索
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#f5f5f7] border-t border-gray-200/60 mt-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 text-center">
          <p className="text-xs text-gray-400">
            © 2025 JobHub 招聘信息聚合平台 · 帮你发现信息差，不错过报名机会
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
