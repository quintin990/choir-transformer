import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music2, LayoutDashboard, Scissors, Upload, Settings, LogOut, Menu, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { label: 'Separate', icon: Scissors, page: 'NewJob' },
  { label: 'My Jobs', icon: Music2, page: 'Jobs' },
  { label: 'Batch', icon: Upload, page: 'BatchUpload' },
  { label: 'Pricing', icon: Zap, page: 'Pricing' },
  { label: 'Settings', icon: Settings, page: 'Settings' },
];

const PUBLIC_PAGES = ['Landing', 'Pricing', 'About'];

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isPublic = PUBLIC_PAGES.includes(currentPageName);
  const isLanding = currentPageName === 'Landing';

  if (isLanding) {
    return <div className="min-h-screen bg-[#0a0a0f]">{children}</div>;
  }

  if (isPublic) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Landing')} className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-violet-400" />
            <span className="font-semibold text-white text-sm">StemForge</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to={createPageUrl('Pricing')} className="text-white/60 hover:text-white transition-colors">Pricing</Link>
            <Link to={createPageUrl('Dashboard')} className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg transition-colors text-sm font-medium">
              Open App
            </Link>
          </nav>
        </header>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-56 bg-[#0f0f17] border-r border-white/5 z-50
        flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="p-5 border-b border-white/5">
          <Link to={createPageUrl('Landing')} className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">StemForge</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ label, icon: Icon, page }) => {
            const active = currentPageName === page || (page === 'Jobs' && currentPageName === 'JobDetail') || (page === 'BatchUpload' && currentPageName === 'BatchDetail');
            return (
              <Link
                key={page}
                to={createPageUrl(page)}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? 'bg-violet-600/20 text-violet-300 font-medium'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          {user && (
            <div className="px-3 py-2 mb-1">
              <p className="text-xs text-white/30 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur border-b border-white/5 px-4 lg:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm text-white/40">
            {NAV.find(n => n.page === currentPageName || (n.page === 'Jobs' && currentPageName === 'JobDetail'))?.label || currentPageName}
          </span>
        </header>
        <main className="flex-1 p-4 lg:p-6 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}