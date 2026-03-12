import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Menu, X, LogOut, Settings, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import ThemeToggle from './components/auralyn/ThemeToggle';

const NAV_LINKS = [
  { label: 'Stems', page: 'StemsNew' },
  { label: 'Reference', page: 'ReferenceNew' },
  { label: 'Choir', page: 'Choir' },
  { label: 'Pricing', page: 'Pricing' },
];

const APP_NAV_LINKS = [
  { label: 'Stems', page: 'StemsNew' },
  { label: 'Reference', page: 'ReferenceNew' },
  { label: 'Projects', page: 'ProjectsList' },
  { label: 'Choir', page: 'Choir' },
  { label: 'Jobs', page: 'Jobs' },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
  }, []);

  const handleSignOut = async () => {
    await base44.auth.logout();
  };

  const isLanding = currentPageName === 'Landing';
  const navLinks = isLanding ? NAV_LINKS : APP_NAV_LINKS;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'hsl(var(--color-background))', color: 'hsl(var(--color-text))' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ borderColor: 'hsl(var(--color-border))', backgroundColor: 'hsl(var(--color-background) / 0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center gap-8">
          {/* Logo */}
          <Link to={createPageUrl('Landing')} className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--color-primary))' }}>
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight" style={{ color: 'hsl(var(--color-text))' }}>Auralyn</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map(({ label, page }) => (
              <Link
                key={page}
                to={createPageUrl(page)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'hsl(var(--color-muted))' }}
                onMouseEnter={e => e.currentTarget.style.color = 'hsl(var(--color-text))'}
                onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--color-muted))'}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />

            {user ? (
              <>
                {!isLanding && (
                  <Link to={createPageUrl('Settings')} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: 'hsl(var(--color-muted))' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'hsl(var(--color-text))'}
                    onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--color-muted))'}>
                    <Settings className="w-4 h-4" />
                  </Link>
                )}
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={{ borderColor: 'hsl(var(--color-primary) / 0.4)', color: 'hsl(var(--color-muted))' }}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: 'hsl(var(--color-primary) / 0.2)', color: 'hsl(var(--color-primary))' }}>
                      {(user.full_name || user.email || '?')[0].toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{user.full_name || user.email.split('@')[0]}</span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-xl border py-2 shadow-xl z-50"
                      style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))' }}>
                      {user.role !== 'admin' && (
                        <Link to={createPageUrl('Pricing')} onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                          style={{ color: 'hsl(var(--color-primary))' }}>
                          <Zap className="w-4 h-4" /> Upgrade to Pro
                        </Link>
                      )}
                      <Link to={createPageUrl('Settings')} onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                        style={{ color: 'hsl(var(--color-muted))' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'hsl(var(--color-text))'}
                        onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--color-muted))'}>
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <div className="border-t my-1" style={{ borderColor: 'hsl(var(--color-border))' }} />
                      <button onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                        style={{ color: 'hsl(var(--color-destructive))' }}>
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to={createPageUrl('Landing')}
                className="hidden md:inline-flex items-center px-4 h-8 rounded-lg text-sm font-semibold transition-all"
                style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}>
                Get Started
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'hsl(var(--color-muted))' }}
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t px-4 py-4 space-y-1" style={{ borderColor: 'hsl(var(--color-border))', backgroundColor: 'hsl(var(--color-card))' }}>
            {navLinks.map(({ label, page }) => (
              <Link key={page} to={createPageUrl(page)} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'hsl(var(--color-muted))' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'hsl(var(--color-input))'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                {label}
              </Link>
            ))}
            {user && (
              <>
                <div className="border-t my-2" style={{ borderColor: 'hsl(var(--color-border))' }} />
                <Link to={createPageUrl('Settings')} onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium"
                  style={{ color: 'hsl(var(--color-muted))' }}>
                  Settings
                </Link>
                <button onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium"
                  style={{ color: 'hsl(var(--color-destructive))' }}>
                  Sign Out
                </button>
              </>
            )}
            {!user && (
              <Link to={createPageUrl('Landing')} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-semibold text-center mt-2"
                style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}>
                Get Started
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        {isLanding ? children : (
          <div className="max-w-7xl mx-auto w-full px-5 py-8">
            {children}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto" style={{ borderColor: 'hsl(var(--color-border))', backgroundColor: 'hsl(var(--color-background))' }}>
        <div className="max-w-7xl mx-auto px-5 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--color-primary))' }}>
                <Layers className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold" style={{ color: 'hsl(var(--color-text))' }}>Auralyn</span>
            </div>
            <div className="flex items-center gap-6">
              {[['Stems', 'StemsNew'], ['Reference', 'ReferenceNew'], ['Choir', 'Choir'], ['Pricing', 'Pricing']].map(([label, page]) => (
                <Link key={page} to={createPageUrl(page)} className="text-xs transition-colors"
                  style={{ color: 'hsl(var(--color-muted))' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'hsl(var(--color-text))'}
                  onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--color-muted))'}>
                  {label}
                </Link>
              ))}
            </div>
            <p className="text-xs" style={{ color: 'hsl(var(--color-muted))' }}>
              © {new Date().getFullYear()} Auralyn. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}