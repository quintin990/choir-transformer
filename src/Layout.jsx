import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Music2, LayoutDashboard, Scissors, ListMusic, Settings, LogOut, Menu, Zap, FlaskConical, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { label: 'New Job', icon: Scissors, page: 'NewJob' },
  { label: 'My Jobs', icon: ListMusic, page: 'Jobs' },
  { label: 'Reference', icon: FlaskConical, page: 'ReferenceMixAssistant' },
  { label: 'Pricing', icon: Zap, page: 'Pricing' },
  { label: 'Settings', icon: Settings, page: 'Settings' },
];

const PUBLIC_PAGES = ['Landing', 'Pricing', 'About'];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isLanding = currentPageName === 'Landing';
  const isPublic = PUBLIC_PAGES.includes(currentPageName);

  if (isLanding) {
    return (
      <div className="min-h-screen bg-[#070d14]">
        <header className="border-b border-white/[0.04] px-6 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Landing')} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center">
              <Music2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-white text-sm">StemForge</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link to={createPageUrl('Pricing')} className="text-white/50 hover:text-white transition-colors">Pricing</Link>
            <Link to={createPageUrl('About')} className="text-white/50 hover:text-white transition-colors">About</Link>
            <Link to={createPageUrl('Dashboard')} className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-1.5 rounded-lg transition-colors text-xs font-semibold">
              Open App
            </Link>
          </nav>
        </header>
        {children}
      </div>
    );
  }

  if (isPublic) {
    return (
      <div className="min-h-screen bg-[#070d14]">
        <header className="border-b border-white/[0.04] px-6 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Landing')} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center">
              <Music2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-white text-sm">StemForge</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link to={createPageUrl('Pricing')} className="text-white/50 hover:text-white transition-colors">Pricing</Link>
            <Link to={createPageUrl('About')} className="text-white/50 hover:text-white transition-colors">About</Link>
            <Link to={createPageUrl('Dashboard')} className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-1.5 rounded-lg transition-colors text-xs font-semibold">
              Open App
            </Link>
          </nav>
        </header>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d14] flex">
      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-52 bg-[#060c13] border-r border-sky-900/30 z-50
        flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
          <Link to={createPageUrl('Landing')} className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center shrink-0">
              <Music2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-white text-sm">StemForge</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden text-white/30 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {NAV.map(({ label, icon: Icon, page }) => {
            const active = currentPageName === page
              || (page === 'Jobs' && currentPageName === 'JobDetail');
            return (
              <Link
                key={page}
                to={createPageUrl(page)}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? 'bg-sky-500/20 text-sky-300 font-medium'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-2.5 border-t border-white/[0.04] space-y-0.5">
          {user && (
            <div className="px-3 py-2">
              <p className="text-xs text-white/25 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-[#070d14]/90 backdrop-blur border-b border-sky-900/20 px-4 lg:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs text-white/30">
            {NAV.find(n => n.page === currentPageName || (n.page === 'Jobs' && currentPageName === 'JobDetail'))?.label || currentPageName}
          </span>
        </header>
        <main className="flex-1 p-5 lg:p-8 max-w-4xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}