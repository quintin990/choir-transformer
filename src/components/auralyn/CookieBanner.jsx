import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('auralyn_cookie_consent');
    if (!cookieConsent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('auralyn_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('auralyn_cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 animate-in slide-in-from-bottom duration-300">
      <div className="m-4 rounded-lg border p-4 max-w-md" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold mb-2" style={{ color: '#EAF2FF' }}>We use cookies</p>
            <p className="text-xs mb-3" style={{ color: '#9CB2D6' }}>
              We use essential cookies to make Auralyn work. We also use analytics to understand usage and improve your experience.{' '}
              <a href="#" className="underline" style={{ color: '#1EA0FF' }}>Learn more</a>
            </p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={handleAccept}
                className="px-4 h-8 rounded-lg text-xs font-semibold transition-all"
                style={{ backgroundColor: '#1EA0FF', color: '#fff' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor='#3BAEFF'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor='#1EA0FF'}>
                Accept all
              </button>
              <button onClick={handleDecline}
                className="px-4 h-8 rounded-lg text-xs font-semibold border transition-all"
                style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#1EA0FF'}
                onMouseLeave={e => e.currentTarget.style.borderColor='#1C2A44'}>
                Decline
              </button>
            </div>
          </div>
          <button onClick={() => setVisible(false)} className="shrink-0 text-sm mt-0.5" style={{ color: '#9CB2D6' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}