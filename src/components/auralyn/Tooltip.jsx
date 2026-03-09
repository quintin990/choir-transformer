import React, { useState } from 'react';

export default function Tooltip({ text, children, position = 'top' }) {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <div
          className={`absolute ${positionClasses[position]} whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium animate-in fade-in duration-200 pointer-events-none z-50`}
          style={{ backgroundColor: '#0B1220', border: '1px solid #1EA0FF', color: '#EAF2FF', boxShadow: '0 4px 12px rgba(30, 160, 255, 0.2)' }}>
          {text}
        </div>
      )}
    </div>
  );
}