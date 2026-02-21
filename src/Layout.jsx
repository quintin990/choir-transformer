import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Music, Home, Briefcase, Upload, Sparkles, Info, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];

export default function Layout({ children, currentPageName }) {
  const [selectedLang, setSelectedLang] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') || 'en';
    setSelectedLang(savedLang);
  }, []);

  const handleLanguageChange = (langCode) => {
    setSelectedLang(langCode);
    localStorage.setItem('app_language', langCode);
  };

  const currentLanguage = languages.find(lang => lang.code === selectedLang);

  const isAuthPage = ['ForgotPassword', 'ResetPassword'].includes(currentPageName);
  
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/Landing" className="flex items-center gap-2 font-bold text-xl">
              <Music className="w-6 h-6 text-purple-600" />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Choir Transformer
              </span>
            </Link>
            
            <div className="flex items-center gap-6">
              <Link 
                to="/Landing" 
                className={`flex items-center gap-2 text-sm hover:text-purple-600 transition-colors ${
                  currentPageName === 'Landing' ? 'text-purple-600 font-medium' : 'text-gray-600'
                }`}
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              
              <Link 
                to="/Jobs" 
                className={`flex items-center gap-2 text-sm hover:text-purple-600 transition-colors ${
                  currentPageName === 'Jobs' || currentPageName === 'JobDetail' ? 'text-purple-600 font-medium' : 'text-gray-600'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                My Jobs
              </Link>
              
              <Link 
                to="/BatchUpload" 
                className={`flex items-center gap-2 text-sm hover:text-purple-600 transition-colors ${
                  currentPageName === 'BatchUpload' || currentPageName === 'BatchDetail' ? 'text-purple-600 font-medium' : 'text-gray-600'
                }`}
              >
                <Upload className="w-4 h-4" />
                Batch Upload
              </Link>
              
              <Link 
                to="/ReferenceMixAssistant" 
                className={`flex items-center gap-2 text-sm hover:text-purple-600 transition-colors ${
                  currentPageName === 'ReferenceMixAssistant' || currentPageName === 'ReferenceDetail' ? 'text-purple-600 font-medium' : 'text-gray-600'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Mix Assistant
              </Link>
              
              <Link 
                to="/About" 
                className={`flex items-center gap-2 text-sm hover:text-purple-600 transition-colors ${
                  currentPageName === 'About' ? 'text-purple-600 font-medium' : 'text-gray-600'
                }`}
              >
                <Info className="w-4 h-4" />
                About
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <span className="text-xl">{currentLanguage?.flag}</span>
                    <span className="text-sm hidden sm:inline">{currentLanguage?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className="cursor-pointer"
                    >
                      <span className="mr-2 text-xl">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
      
      <main>{children}</main>
      
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2026 Choir Transformer. AI-powered audio stem separation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}