import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Home, Briefcase, Upload, Sparkles, Info, Settings, User, Menu, X, Wand2, Users, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isAuthPage = ['ForgotPassword', 'ResetPassword'].includes(currentPageName);
  
  if (isAuthPage) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  const [user, setUser] = React.useState(null);
  React.useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/Dashboard', pages: ['Dashboard'] },
    { name: 'My Jobs', icon: Briefcase, path: '/Jobs', pages: ['Jobs', 'JobDetail'] },
    { name: 'Batch Upload', icon: Upload, path: '/BatchUpload', pages: ['BatchUpload', 'BatchDetail'] },
    { name: 'Mix Assistant', icon: Sparkles, path: '/ReferenceMixAssistant', pages: ['ReferenceMixAssistant', 'ReferenceDetail'] },
    { name: 'Pricing', icon: Info, path: '/Pricing', pages: ['Pricing'] },
    { name: 'Settings', icon: Settings, path: '/Settings', pages: ['Settings'] },
    ...(user?.role === 'admin' ? [{ name: 'Analytics', icon: User, path: '/AdminAnalytics', pages: ['AdminAnalytics'] }] : []),
  ];

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate('/Landing');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-card border-r border-border transition-all duration-300 overflow-hidden fixed h-full z-40`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <Link to="/Landing" className="flex items-center gap-3">
              <Music className="w-8 h-8 text-primary" />
              <span className="font-bold text-xl text-foreground">SoundForge</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.pages.includes(currentPageName);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3">
              <User className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        <header className="bg-card border-b border-border p-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="text-xl font-semibold text-foreground">
              {navItems.find(item => item.pages.includes(currentPageName))?.name || 'Choir Transformer'}
            </h1>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}