import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Menu, X, LogOut, Settings, Zap, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [stemsOpen, setStemsOpen] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleSignOut = async () => {
    await base44.auth.logout();
  };

  const isLanding = currentPageName === 'Landing';

  if (isLanding) {
    return (
      <div style={{ backgroundColor: '#0B1220', color: '#EAF2FF', minHeight: '100vh' }}>
        <header className="border-b sticky top-0 z-50" style={{ borderColor: '#1C2A44', backgroundColor: '#0B122099', backdropFilter: 'blur(12px)' }}>
          <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
            <Link to={createPageUrl('Landing')} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1EA0FF' }}>
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ letterSpacing: '-0.03em' }}>Auralyn</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-8">
              {[['Stems', 'StemsNew'], ['Reference', 'ReferenceNew'], ['Choir', 'Choir'], ['Pricing', 'Pricing']].map(([label, page]) => (
                <Link key={page} to={createPageUrl(page)} className="text-sm font-medium transition-colors" style={{ color: '#6A8AAD' }}
                  onMouseEnter={e => e.currentTarget.style.color='#EAF2FF'} onMouseLeave={e => e.currentTarget.style.color='#6A8AAD'}>
                  {label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              {user ? (
                <Link to={createPageUrl('StemsNew')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-semibold transition-all"
                  style={{ backgroundColor: '#1EA0FF', color: '#fff' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor='#3BAEFF'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor='#1EA0FF'}>
                  Get Started
                </Link>
              ) : (
                <>
                  <Link to={createPageUrl('Landing')} className="text-sm font-medium" style={{ color: '#6A8AAD' }}>Sign In</Link>
                  <Link to={createPageUrl('Landing')} className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0B1220' }}>
      <header className="sticky top-0 z-40 border-b" style={{ borderColor: '#1C2A44', backgroundColor: '#0B1220' }}>
        <div className="max-w-7xl mx-auto px-5 h-13 flex items-center gap-6">
          <Link to={createPageUrl('Landing')} className="flex items-center gap-2.5 shrink-0">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#1EA0FF' }}>
              <Layers className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight" style={{ letterSpacing: '-0.02em' }}>Auralyn</span>
          </Link>

          <nav className="hidden md:flex items-center flex-1 gap-1" style={{ height: 52 }}>
            {[
              { label: 'Stems', page: 'StemsNew', submenu: [{ label: 'New Separation', page: 'StemsNew' }, { label: 'My Stems', page: 'Jobs' }] },
              { label: 'Reference', page: 'ReferenceNew', submenu: [{ label: 'New Analysis', page: 'ReferenceNew' }, { label: 'My References', page: 'Jobs' }] },
              { label: 'Projects', page: 'ProjectsList' },
              { label: 'Choir', page: 'Choir' },
              { label: 'Jobs', page: 'Jobs' },
              { label: 'Settings', page: 'Settings' },
            ].map(({ label, page, submenu }) => (
              <div key={page} className="relative group">
                <Link to={createPageUrl(page)}
                  className="relative flex items-center gap-1 px-3 h-full text-sm font-medium transition-colors"
                  style={{ color: '#9CB2D6' }}
                  onMouseEnter={e => e.currentTarget.style.color='#EAF2FF'} onMouseLeave={e => e.currentTarget.style.color='#9CB2D6'}>
                  {label}
                  {submenu && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>
                {submenu && (
                  <div className="absolute left-0 mt-0 w-48 rounded-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2"
                    style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
                    {submenu.map(item => (
                      <Link key={item.page} to={createPageUrl(item.page)}
                        className="block px-4 py-2 text-sm transition-colors" style={{ color: '#9CB2D6' }}
                        onMouseEnter={e => e.currentTarget.style.color='#EAF2FF'} onMouseLeave={e => e.currentTarget.style.color='#9CB2D6'}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {user && (
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)}
                  className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg transition-all"
                  style={{ backgroundColor: profileOpen ? '#1C2A44' : '#0F1A2E', border: '1px solid #1C2A44' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ backgroundColor: '#1EA0FF25', color: '#1EA0FF' }}>
                    {(user.full_name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <span className="text-xs truncate max-w-[120px]" style={{ color: '#9CB2D6' }}>
                    {user.full_name || user.email.split('@')[0]}
                  </span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border py-2"
                    style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
                    <Link to={createPageUrl('Settings')} className="block px-4 py-2 text-sm flex items-center gap-2" style={{ color: '#9CB2D6' }}>
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    {user.role !== 'admin' && (
                      <Link to={createPageUrl('Pricing')} className="block px-4 py-2 text-sm flex items-center gap-2" style={{ color: '#9CB2D6' }}>
                        <Zap className="w-4 h-4" /> Upgrade to Pro
                      </Link>
                    )}
                    <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm flex items-center gap-2" style={{ color: '#FF4D6D' }}>
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
            <button className="md:hidden p-1.5 rounded" style={{ color: '#9CB2D6' }} onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t px-5 py-3 space-y-1" style={{ borderColor: '#1C2A44', backgroundColor: '#0F1A2E' }}>
            {[
              { label: 'New Separation', page: 'StemsNew' },
              { label: 'New Analysis', page: 'ReferenceNew' },
              { label: 'Projects', page: 'ProjectsList' },
              { label: 'Choir', page: 'Choir' },
              { label: 'Jobs', page: 'Jobs' },
              { label: 'Settings', page: 'Settings' },
              { label: 'Pricing', page: 'Pricing' },
            ].map(({ label, page }) => (
              <Link key={page} to={createPageUrl(page)} onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium" style={{ color: '#9CB2D6' }}>
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-5 py-8">
        {children}
      </main>
    </div>
  );
}