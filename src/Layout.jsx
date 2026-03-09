import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music2, LayoutDashboard, Scissors, ListMusic, Settings, LogOut, Zap, FlaskConical, Menu, X, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

const NAV = [
  { label: 'Dashboard',  icon: LayoutDashboard, page: 'Dashboard' },
  { label: 'New Job',    icon: Scissors,         page: 'NewJob' },
  { label: 'My Jobs',   icon: ListMusic,        page: 'Jobs' },
  { label: 'Reference', icon: FlaskConical,     page: 'ReferenceMixAssistant' },
  { label: 'Pricing',   icon: Zap,              page: 'Pricing' },
  { label: 'Settings',  icon: Settings,         page: 'Settings' },
];

const PUBLIC_PAGES = ['Landing', 'Pricing', 'About'];

function PublicHeader() {
  return (
    <header className="border-b border-white/[0.05] px-6 py-4 flex items-center justify-between bg-[#070d14]">
      <Link to={createPageUrl('Landing')} className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center">
          <Music2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-white tracking-tight">StemForge</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <Link to={createPageUrl('Pricing')} className="text-white/45 hover:text-white transition-colors">Pricing</Link>
        <Link to={createPageUrl('About')}   className="text-white/45 hover:text-white transition-colors">About</Link>
        <Link to={createPageUrl('Dashboard')} className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-1.5 rounded-lg transition-colors text-xs font-semibold">
          Open App
        </Link>
      </nav>
    </header>
  );
}

export default function Layout({ children, currentPageName }) {
  const [user, setUser]   = useState(null);
  const [open, setOpen]   = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isLanding = currentPageName === 'Landing';
  const isPublic  = PUBLIC_PAGES.includes(currentPageName);

  if (isLanding) {
    return (
      <div className="min-h-screen bg-[#070d14]">
        <PublicHeader />
        {children}
      </div>
    );
  }

  if (isPublic) {
    return (
      <div className="min-h-screen bg-[#070d14]">
        <PublicHeader />
        <main>{children}</main>
      </div>
    );
  }

  // Sidebar expanded state: always expanded on hover (desktop), toggle on mobile
  const expanded = hovered || open;

  return (
    <div className="min-h-screen bg-[#070d14] flex">
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-[#060c13] border-r border-white/[0.05]
          transition-all duration-200 ease-in-out
          ${open ? 'w-52 translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          ${expanded ? 'lg:w-52' : 'lg:w-[58px]'}
        `}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-white/[0.05] shrink-0">
          <Link
            to={createPageUrl('Landing')}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 min-w-0"
          >
            <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center shrink-0">
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <span className={`font-semibold text-white tracking-tight whitespace-nowrap transition-all duration-150 ${expanded ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
              StemForge
            </span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden ml-auto text-white/30 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {NAV.map(({ label, icon: Icon, page }) => {
            const active = currentPageName === page
              || (page === 'Jobs' && currentPageName === 'JobDetail');
            return (
              <Link
                key={page}
                to={createPageUrl(page)}
                onClick={() => setOpen(false)}
                title={!expanded ? label : undefined}
                className={`flex items-center gap-3 rounded-lg transition-all duration-150 group relative
                  ${expanded ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center'}
                  ${active
                    ? 'bg-sky-500/15 text-sky-300'
                    : 'text-white/35 hover:text-white/80 hover:bg-white/[0.05]'
                  }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-sky-400' : ''}`} />
                <span className={`text-sm font-medium whitespace-nowrap transition-all duration-150 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden lg:hidden'}`}>
                  {label}
                </span>
                {active && !expanded && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-sky-400 rounded-full -ml-2" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User / signout */}
        <div className="py-3 px-2 border-t border-white/[0.05] shrink-0">
          {user && expanded && (
            <div className="px-3 py-2 mb-1">
              <p className="text-xs text-white/25 truncate font-medium">{user.full_name || user.email}</p>
              {user.full_name && <p className="text-xs text-white/15 truncate">{user.email}</p>}
            </div>
          )}
          <button
            onClick={() => base44.auth.logout()}
            title={!expanded ? 'Sign out' : undefined}
            className={`flex items-center gap-3 w-full rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-150
              ${expanded ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center'}`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={`text-sm whitespace-nowrap transition-all duration-150 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden lg:hidden'}`}>
              Sign out
            </span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar (mobile only) */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#070d14]/90 backdrop-blur border-b border-white/[0.05] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-sky-500 flex items-center justify-center">
              <Music2 className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">StemForge</span>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8 max-w-4xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}