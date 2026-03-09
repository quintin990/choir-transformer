import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, FolderOpen, GitCompare, List, Settings, Menu, X, Activity, Zap, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

const NAV_ITEMS = [
  { label: 'Projects',  icon: FolderOpen,  page: 'ProjectsList', activePages: ['ProjectsList', 'ProjectNew', 'ProjectDetail'] },
  { label: 'Stems',     icon: Layers,      page: 'StemsNew',     activePages: ['StemsNew'] },
  { label: 'Reference', icon: Activity,    page: 'ReferenceNew', activePages: ['ReferenceNew'] },
  { label: 'Match',     icon: GitCompare,  page: 'Match',        activePages: ['Match'], soon: true },
  { label: 'Jobs',      icon: List,        page: 'Jobs',         activePages: ['Jobs', 'JobDetail'] },
  { label: 'Settings',  icon: Settings,    page: 'Settings',     activePages: ['Settings'] },
  { label: 'Pricing',   icon: Zap,         page: 'Pricing',      activePages: ['Pricing'] },
  { label: 'Choir',    icon: Users,       page: 'Choir',        activePages: ['Choir', 'ChoirJoin', 'ChoirCreate', 'ChoirPart', 'ChoirSongs', 'ChoirSongDetail', 'ChoirAdmin', 'ChoirAdminSong', 'ChoirSetlists', 'ChoirMemberDashboard', 'ChoirAdminMembers'] },
  { label: 'Queue',    icon: List,        page: 'QueueManager',  activePages: ['QueueManager'] },
];

const LANDING_PAGES = ['Landing'];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isLanding = LANDING_PAGES.includes(currentPageName);

  if (isLanding) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0B1220' }}>
        {/* Landing minimal header */}
        <header className="border-b" style={{ borderColor: '#1C2A44', backgroundColor: '#0B122099', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 40 }}>
          <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
            <Link to={createPageUrl('Landing')} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1EA0FF' }}>
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ color: '#EAF2FF', letterSpacing: '-0.03em' }}>Auralyn</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-8">
              {[['Jobs', 'Jobs'], ['Pricing', 'Pricing'], ['Choir', 'Choir']].map(([label, page]) => (
                <Link key={page} to={createPageUrl(page)} className="text-sm font-medium transition-colors" style={{ color: '#6A8AAD' }}
                  onMouseEnter={e => e.currentTarget.style.color='#EAF2FF'} onMouseLeave={e => e.currentTarget.style.color='#6A8AAD'}>
                  {label}
                </Link>
              ))}
            </nav>
            <Link to={createPageUrl('StemsNew')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-semibold transition-all"
              style={{ backgroundColor: '#1EA0FF', color: '#fff' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor='#3BAEFF'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor='#1EA0FF'}>
              Get started
            </Link>
          </div>
        </header>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0B1220' }}>
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b" style={{ borderColor: '#1C2A44', backgroundColor: '#0B1220' }}>
        <div className="max-w-6xl mx-auto px-5 h-13 flex items-center gap-6">
          {/* Logo */}
          <Link to={createPageUrl('Landing')} className="flex items-center gap-2.5 shrink-0 mr-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#1EA0FF' }}>
              <Layers className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight" style={{ color: '#EAF2FF', letterSpacing: '-0.02em' }}>Auralyn</span>
          </Link>

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center flex-1" style={{ height: 52 }}>
            {NAV_ITEMS.map(({ label, icon: Icon, page, activePages, soon }) => {
              const active = activePages.includes(currentPageName);
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="relative flex items-center gap-1.5 px-3 h-full text-sm font-medium transition-colors"
                  style={{
                    color: active ? '#EAF2FF' : '#9CB2D6',
                    borderBottom: active ? '2px solid #1EA0FF' : '2px solid transparent',
                  }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                  {soon && (
                    <span className="text-[9px] font-bold px-1 py-px rounded uppercase" style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}>
                      Soon
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg" style={{ backgroundColor: '#0F1A2E', border: '1px solid #1C2A44' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ backgroundColor: '#1EA0FF25', color: '#1EA0FF' }}>
                  {(user.full_name || user.email || '?')[0].toUpperCase()}
                </div>
                <span className="text-xs truncate max-w-[120px]" style={{ color: '#9CB2D6' }}>
                  {user.full_name || user.email.split('@')[0]}
                </span>
              </div>
            )}
            {/* Mobile menu */}
            <button className="md:hidden p-1.5 rounded" style={{ color: '#9CB2D6' }} onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t px-5 py-3 space-y-1" style={{ borderColor: '#1C2A44', backgroundColor: '#0F1A2E' }}>
            {NAV_ITEMS.map(({ label, icon: Icon, page, activePages, soon }) => {
              const active = activePages.includes(currentPageName);
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: active ? '#EAF2FF' : '#9CB2D6',
                    backgroundColor: active ? '#1C2A44' : 'transparent',
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                  {soon && <span className="text-[9px] px-1 rounded uppercase" style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}>Soon</span>}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-5 py-8">
        {children}
      </main>
    </div>
  );
}