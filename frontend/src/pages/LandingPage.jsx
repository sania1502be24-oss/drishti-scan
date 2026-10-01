import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, KeyRound, GraduationCap, LayoutDashboard, FileText, ArrowRight, CheckCircle2, Lock, Zap, Eye, AlertTriangle } from 'lucide-react';

export default function LandingPage() {
  const [inputUrl, setInputUrl] = useState('');
  const navigate = useNavigate();

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      navigate(`/scan?url=${encodeURIComponent(inputUrl.trim())}`);
    }
  };

  const sampleUrls = [
    { label: 'Subdomain Phishing', url: 'https://paypal.com.verify-billing-center.xyz/login' },
    { label: 'Punycode Homograph', url: 'https://xn--pple-43d.com' },
    { label: 'Direct IP Host', url: 'http://185.190.140.2/auth/login' },
    { label: 'Legitimate Domain', url: 'https://google.com' },
  ];

  return (
    <div className="cyber-bg" style={{ minHeight: 'calc(100vh - 70px)' }}>
      {/* Hero Section */}
      <section style={{ padding: '4.5rem 0 3.5rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: 'var(--color-cyan)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}>
            <Shield size={16} /> Drishti Scan Platform v1.0 • Placement-Ready Cybersecurity Suite
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            lineHeight: 1.15,
          }}>
            See Threats. <span style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Secure What Matters.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
          }}>
            A responsive, explainable cybersecurity platform where you can assess suspicious links,
            test password resilience with 100% browser privacy, practice phishing awareness,
            and track your personal security metrics.
          </p>

          {/* Quick Scanner Box */}
          <div className="card" style={{
            background: 'rgba(19, 28, 49, 0.9)',
            border: '1px solid rgba(14, 165, 233, 0.4)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(2, 132, 199, 0.2)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <form onSubmit={handleScanSubmit} style={{
              display: 'flex',
              gap: '0.75rem',
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}>
              <input
                type="text"
                placeholder="Enter suspicious link (e.g. paypal.com.verify-billing.xyz or 185.190.140.2)..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="input-field"
                style={{ flex: '1 1 300px', fontSize: '1rem', padding: '0.85rem 1.15rem' }}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                <ShieldAlert size={18} /> Run Threat Scan
              </button>
            </form>

            {/* Quick Sample Chips */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              fontSize: '0.8rem',
              color: 'var(--text-dim)',
            }}>
              <span style={{ fontWeight: 600 }}>Test Samples:</span>
              {sampleUrls.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputUrl(s.url)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-cyan)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="var(--color-emerald)" /> SSRF-Safe Static Engine
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="var(--color-emerald)" /> Zero Password Network Transmission
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="var(--color-emerald)" /> Downloadable PDF Reports
            </span>
          </div>
        </div>
      </section>

      {/* The 4 Core Pillars */}
      <section style={{ padding: '3.5rem 0', borderTop: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.75rem' }}>Four Pillars of Threat Awareness</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Drishti combines deep structural analysis with practical education, actionable dashboards, and verifiable privacy.
            </p>
          </div>

          <div className="grid-4">
            <div className="card">
              <div style={{
                background: 'rgba(6, 182, 212, 0.12)',
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <ShieldAlert size={24} color="var(--color-cyan)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Assess</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Deconstruct URLs to expose brand misdirection, raw IP hosts, Punycode homographs, Shannon entropy anomalies, and deceptive subdomains.
              </p>
            </div>

            <div className="card">
              <div style={{
                background: 'rgba(99, 102, 241, 0.12)',
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <Eye size={24} color="var(--color-indigo)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Understand</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Receive clear, calibrated evidence explaining <em>why</em> an address is risky, accompanied by synthesized attack vector briefings and mitigations.
              </p>
            </div>

            <div className="card">
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <GraduationCap size={24} color="var(--color-emerald)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Learn</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Explore the Cyber Awareness Academy with realistic phishing simulations, scenario headers, and interactive tests with immediate feedback.
              </p>
            </div>

            <div className="card">
              <div style={{
                background: 'rgba(245, 158, 11, 0.12)',
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <LayoutDashboard size={24} color="var(--color-amber)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Improve</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Track personal scan logs, risk distribution graphs, and academy milestones on a private dashboard with strict row-level authorization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Module Highlight Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <div className="badge badge-info" style={{ marginBottom: '1rem' }}>Module 2 Spotlight</div>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Local Password Security Lab</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                Most users hesitate to test passwords on online websites for fear of credential theft.
                Drishti Scan solves this with a strict <strong>zero-network privacy model</strong>:
                analysis runs entirely inside client-side JavaScript.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle2 size={16} color="var(--color-emerald)" />
                  <span>Real-time Shannon entropy & combinatorial search space</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle2 size={16} color="var(--color-emerald)" />
                  <span>Offline GPU cluster crack time simulation (100 Billion hashes/sec)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle2 size={16} color="var(--color-emerald)" />
                  <span>Memorable Diceware passphrase generator for resilient authentication</span>
                </li>
              </ul>
              <button onClick={() => navigate('/password-lab')} className="btn btn-primary">
                Open Password Lab <ArrowRight size={16} />
              </button>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>CLIENT-SIDE TELEMETRY</span>
                <span className="badge badge-low">Zero Data Transmitted</span>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>SAMPLE EVALUATION</div>
                <div className="mono" style={{ fontSize: '1.1rem', color: 'var(--color-cyan)', fontWeight: 600 }}>falcon-granite-breeze-beacon-74!</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>ENTROPY</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-emerald)' }}>86.4 Bits</div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>GPU CRACK RESISTANCE</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-emerald)' }}>Centuries+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
