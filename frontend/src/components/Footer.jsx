import React from 'react';
import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      background: 'rgba(8, 13, 26, 0.95)',
      padding: '3rem 0 2rem 0',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield size={18} color="#fff" />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>DRISHTI SCAN</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Defensive cybersecurity assessment, phishing detection, and user awareness platform.
              Built with an SSRF-safe analysis engine and privacy-first client-side password laboratory.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: 'var(--text-main)' }}>
              Platform Modules
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li><Link to="/scan" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>URL & Phishing Scanner</Link></li>
              <li><Link to="/password-lab" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Password Security Lab</Link></li>
              <li><Link to="/academy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Cyber Awareness Academy</Link></li>
              <li><Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Personal Security Dashboard</Link></li>
            </ul>
          </div>

          {/* Security & Privacy Principles */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: 'var(--text-main)' }}>
              Defensive Guarantees
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Lock size={15} color="var(--color-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Zero transmission of evaluated passwords. Computation runs 100% locally in your browser.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Eye size={15} color="var(--color-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>SSRF-isolated URL parser: Evaluates static indicators without blindly executing target web code.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <AlertTriangle size={15} color="var(--color-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Transparent scoring: Clear indicators, not black-box assumptions.</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-dim)',
        }}>
          <div>© {new Date().getFullYear()} Drishti Scan. Educational & Defensive Cybersecurity Platform.</div>
          <div>See Threats. Secure What Matters.</div>
        </div>
      </div>
    </footer>
  );
}
