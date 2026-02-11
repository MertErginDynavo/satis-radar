import React from 'react';

export default function Logo({ className = "h-10" }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Radar daire */}
        <circle cx="16" cy="16" r="14" stroke="#1e40af" strokeWidth="1.5" opacity="0.3" />
        <circle cx="16" cy="16" r="10" stroke="#1e40af" strokeWidth="1.5" opacity="0.5" />
        <circle cx="16" cy="16" r="6" stroke="#1e40af" strokeWidth="1.5" opacity="0.7" />
        
        {/* Radar tarama çizgisi (animasyonlu) */}
        <line x1="16" y1="16" x2="16" y2="2" stroke="#1e40af" strokeWidth="2" strokeLinecap="round">
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 16 16"
            to="360 16 16"
            dur="3s"
            repeatCount="indefinite"
          />
        </line>
        
        {/* Hedef noktalar */}
        <circle cx="22" cy="10" r="2" fill="#10b981" />
        <circle cx="10" cy="20" r="2" fill="#f59e0b" />
        <circle cx="24" cy="22" r="2" fill="#ef4444" />
        
        {/* Merkez nokta */}
        <circle cx="16" cy="16" r="2" fill="#1e40af" />
      </svg>
      <div className="flex items-baseline space-x-1" style={{ fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <span className="text-2xl font-semibold tracking-tight text-slate-800" style={{ letterSpacing: '0.01em' }}>
          Satış
        </span>
        <span className="text-2xl font-bold tracking-tight text-blue-800" style={{ letterSpacing: '0.01em' }}>
          Radar
        </span>
      </div>
    </div>
  );
}
