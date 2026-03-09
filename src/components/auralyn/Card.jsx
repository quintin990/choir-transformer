import React from 'react';

export default function Card({ children, className = '', padding = 'p-5', ...props }) {
  return (
    <div
      className={`rounded-xl border ${padding} ${className}`}
      style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>{title}</h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: '#9CB2D6' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}