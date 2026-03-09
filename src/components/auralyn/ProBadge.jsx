import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Zap } from 'lucide-react';

export function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
      style={{ backgroundColor: '#FFB02015', color: '#FFB020', border: '1px solid #FFB02030' }}>
      <Zap className="w-2.5 h-2.5" /> Pro
    </span>
  );
}

export function UpgradeBanner({ message }) {
  return (
    <div className="mb-5 rounded-xl border px-5 py-4 flex items-center justify-between gap-4"
      style={{ backgroundColor: '#FFB02008', borderColor: '#FFB02030' }}>
      <div>
        <p className="text-sm font-semibold mb-0.5" style={{ color: '#FFB020' }}>Daily limit reached</p>
        <p className="text-xs" style={{ color: '#9CB2D6' }}>{message || 'You\'ve used all your free jobs for today. Upgrade to Pro for unlimited jobs.'}</p>
      </div>
      <Link to={createPageUrl('Pricing')}
        className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold whitespace-nowrap"
        style={{ backgroundColor: '#FFB020', color: '#0B1220' }}>
        <Zap className="w-3.5 h-3.5" /> Upgrade to Pro
      </Link>
    </div>
  );
}