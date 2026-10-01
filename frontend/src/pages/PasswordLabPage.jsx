import React, { useState, useMemo } from 'react';
import { KeyRound, ShieldCheck, Lock, Eye, EyeOff, AlertTriangle, Sparkles, Copy, Check, Info, Cpu, Globe } from 'lucide-react';
import { analyzePassword, generateMemorablePassphrase } from '../utils/passwordAnalyzer';

export default function PasswordLabPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPhrase, setGeneratedPhrase] = useState('');
  const [copied, setCopied] = useState(false);
  const [passphraseWordCount, setPassphraseWordCount] = useState(4);

  // Analyze password 100% client side
  const analysis = useMemo(() => analyzePassword(password), [password]);

  const handleGenerate = () => {
    const phrase = generateMemorablePassphrase(passphraseWordCount);
    setGeneratedPhrase(phrase);
    setCopied(false);
  };

  const handleCopy = () => {
    if (generatedPhrase) {
      navigator.clipboard.writeText(generatedPhrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUseGenerated = () => {
    if (generatedPhrase) {
      setPassword(generatedPhrase);
    }
  };

  // Color for strength meter
  let meterColor = 'var(--color-red)';
  if (analysis.score >= 80) meterColor = 'var(--color-emerald)';
  else if (analysis.score >= 60) meterColor = 'var(--color-cyan)';
  else if (analysis.score >= 40) meterColor = 'var(--color-amber)';
  else if (analysis.score >= 20) meterColor = 'var(--color-orange)';

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem 1.25rem' }}>
      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <KeyRound color="var(--color-cyan)" size={28} /> Password Security & Entropy Lab
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Evaluate password resilience, calculate Shannon combinatorial entropy, and simulate GPU brute-force crack resistance.
        </p>
      </div>

      {/* Strict Privacy Guarantee Banner */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '0.9rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <Lock size={20} color="var(--color-emerald)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
          <strong>Zero Network Transmission:</strong> This laboratory runs 100% locally in your browser’s JavaScript engine.
          No keystrokes, hashes, or passwords are ever transmitted to any backend API or external AI model.
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left Col: Password Input & Analysis */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Password Evaluation</h3>

          {/* Input with Show/Hide toggle */}
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Type a password to test..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field mono"
              style={{
                fontSize: '1.05rem',
                paddingRight: '3rem',
                letterSpacing: showPassword ? 'normal' : '0.1em',
              }}
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Strength Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Strength Rating: <strong style={{ color: meterColor }}>{analysis.label}</strong></span>
              <span className="mono" style={{ fontWeight: 700, color: meterColor }}>{analysis.score}/100</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${analysis.score}%`,
                background: meterColor,
                transition: 'width 0.3s ease, background 0.3s ease',
              }} />
            </div>
          </div>

          {/* Character Diversity Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{
              background: analysis.hasLower ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 59, 0.4)',
              border: `1px solid ${analysis.hasLower ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: analysis.hasLower ? '#34d399' : 'var(--text-dim)',
              fontWeight: 600,
            }}>
              a-z Lower
            </div>
            <div style={{
              background: analysis.hasUpper ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 59, 0.4)',
              border: `1px solid ${analysis.hasUpper ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: analysis.hasUpper ? '#34d399' : 'var(--text-dim)',
              fontWeight: 600,
            }}>
              A-Z Upper
            </div>
            <div style={{
              background: analysis.hasNumber ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 59, 0.4)',
              border: `1px solid ${analysis.hasNumber ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: analysis.hasNumber ? '#34d399' : 'var(--text-dim)',
              fontWeight: 600,
            }}>
              0-9 Digits
            </div>
            <div style={{
              background: analysis.hasSymbol ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 59, 0.4)',
              border: `1px solid ${analysis.hasSymbol ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: analysis.hasSymbol ? '#34d399' : 'var(--text-dim)',
              fontWeight: 600,
            }}>
              !@# Symbols
            </div>
          </div>

          {/* Crack Times Comparison */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
              Estimated Adversary Crack Time
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {/* Online */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                  <Globe size={14} color="var(--color-cyan)" /> Online Throttled (100/min)
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {analysis.crackTimeOnline}
                </div>
              </div>

              {/* Offline GPU Cluster */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                  <Cpu size={14} color="var(--color-rose)" /> Offline GPU Array (100B/s)
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: meterColor }}>
                  {analysis.crackTimeOffline}
                </div>
              </div>
            </div>
          </div>

          {/* Shannon Entropy & Length Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(8, 13, 26, 0.6)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}>
            <span>Length: <strong>{analysis.charCount} chars</strong></span>
            <span>Entropy: <strong className="mono" style={{ color: 'var(--color-cyan)' }}>{analysis.entropy} bits</strong></span>
          </div>

          {/* Warnings & Suggestions */}
          {analysis.warnings.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              {analysis.warnings.map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#f87171', marginBottom: '0.35rem' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {analysis.suggestions.length > 0 && (
            <div>
              {analysis.suggestions.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  <Info size={14} color="var(--color-cyan)" style={{ flexShrink: 0 }} />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Memorable Passphrase Generator & Guidance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Generator Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles size={20} color="var(--color-cyan)" />
              <h3 style={{ fontSize: '1.2rem' }}>Memorable Passphrase Generator</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Math shows that 4 or 5 random dictionary words create a vast search space (~75+ bits) that resists GPU arrays
              while remaining easy for humans to type and remember without tricky character substitutions.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Words:</span>
              {[3, 4, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => setPassphraseWordCount(count)}
                  style={{
                    background: passphraseWordCount === count ? 'var(--color-cyan)' : 'rgba(30, 41, 59, 0.7)',
                    color: passphraseWordCount === count ? '#080d1a' : 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  {count} Words
                </button>
              ))}
              <button onClick={handleGenerate} className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
                <Sparkles size={14} /> Generate
              </button>
            </div>

            {generatedPhrase && (
              <div style={{
                background: 'rgba(8, 13, 26, 0.9)',
                border: '1px solid var(--color-cyan)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1rem',
              }}>
                <div className="mono" style={{ fontSize: '1.1rem', color: 'var(--color-cyan)', fontWeight: 600, wordBreak: 'break-all', marginBottom: '0.75rem' }}>
                  {generatedPhrase}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleCopy} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                    {copied ? <Check size={14} color="var(--color-emerald)" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                  <button onClick={handleUseGenerated} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                    Test in Meter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Architectural Best Practices Card */}
          <div className="card">
            <h4 style={{ fontSize: '1.05rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--color-emerald)" /> Modern Authentication Principles
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>1. Use a Dedicated Password Manager:</strong>
                <p>Tools like Bitwarden or 1Password generate and store unique 20+ character passwords for every single website, eliminating credential reuse vulnerabilities.</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>2. Upgrade to Passkeys / WebAuthn:</strong>
                <p>Passkeys bind authentication cryptographically to the exact domain origin. Even if you land on a convincing phishing clone, the passkey will not release credentials.</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>3. Prefer Authenticator Apps over SMS:</strong>
                <p>SMS 2FA is susceptible to SIM-swapping. Use hardware security keys (YubiKey) or TOTP apps (Google Authenticator, Aegis).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
