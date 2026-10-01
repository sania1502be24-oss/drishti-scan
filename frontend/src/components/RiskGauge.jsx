import React from 'react';

export default function RiskGauge({ score = 0, severity = 'Unknown', size = 150 }) {
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let color = 'var(--color-emerald)';
  let bgGlow = 'rgba(16, 185, 129, 0.15)';
  let badgeClass = 'badge-low';

  if (clampedScore >= 80) {
    color = 'var(--color-red)';
    bgGlow = 'rgba(239, 68, 68, 0.2)';
    badgeClass = 'badge-critical';
  } else if (clampedScore >= 60) {
    color = 'var(--color-orange)';
    bgGlow = 'rgba(249, 115, 22, 0.2)';
    badgeClass = 'badge-high';
  } else if (clampedScore >= 30) {
    color = 'var(--color-amber)';
    bgGlow = 'rgba(245, 158, 11, 0.2)';
    badgeClass = 'badge-caution';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <div
        className="gauge-container"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow: `0 0 35px ${bgGlow}`,
          borderRadius: '50%',
        }}
      >
        <svg className="gauge-svg" viewBox="0 0 140 140">
          <circle
            className="gauge-bg"
            cx="70"
            cy="70"
            r={radius}
          />
          <circle
            className="gauge-fill"
            cx="70"
            cy="70"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        <div className="gauge-text">
          <div style={{
            fontSize: size > 130 ? '2.1rem' : '1.5rem',
            fontWeight: 800,
            color: '#f8fafc',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1
          }}>
            {clampedScore}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Risk Index
          </div>
        </div>
      </div>

      <div className={`badge ${badgeClass}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
        {severity}
      </div>
    </div>
  );
}
