import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import RiskGauge from '../components/RiskGauge';
import {
  ShieldAlert, ShieldCheck, Download, AlertTriangle, ExternalLink,
  Info, Cpu, CheckCircle, RefreshCw, Eye, Sparkles, Filter
} from 'lucide-react';

export default function ScannerPage() {
  const [searchParams] = useSearchParams();
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [activeTab, setActiveTab] = useState('findings'); // findings, ai, recs, sources
  const [severityFilter, setSeverityFilter] = useState('all');
  const [pdfDownloading, setPdfDownloading] = useState(false);

  const samplePresets = [
    { label: 'Subdomain Phish', url: 'https://paypal.com.verify-billing-center.xyz/login' },
    { label: 'Punycode IDN', url: 'https://xn--pple-43d.com' },
    { label: 'Direct IP Host', url: 'http://185.190.140.2/auth/login' },
    { label: 'Google (Clean)', url: 'https://google.com' },
  ];

  const executeScan = async (targetUrl) => {
    if (!targetUrl.trim()) return;
    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const data = await api.scanUrl(targetUrl.trim());
      setScanResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during threat analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialUrl = searchParams.get('url');
    if (initialUrl) {
      setUrlInput(initialUrl);
      executeScan(initialUrl);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    executeScan(urlInput);
  };

  const handleDownloadPdf = async () => {
    if (!scanResult?.id) {
      alert('This scan was not saved. Please log in or re-run scan to save and generate PDF.');
      return;
    }
    setPdfDownloading(true);
    try {
      const blob = await api.getPdfReportBlob(scanResult.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Drishti_Security_Report_${scanResult.hostname}_${scanResult.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error downloading PDF: ' + err.message);
    } finally {
      setPdfDownloading(false);
    }
  };

  const filteredFindings = scanResult?.findings?.filter((f) => {
    if (severityFilter === 'all') return true;
    return f.severity?.toLowerCase() === severityFilter.toLowerCase();
  }) || [];

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem 1.25rem' }}>
      {/* Title & Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <ShieldAlert color="var(--color-cyan)" size={28} /> URL & Phishing Threat Scanner
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Inspect suspicious URLs for structural anomalies, brand impersonation, SSRF targets, and heuristic indicators.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Enter web link (e.g. https://bank-login.xyz/verify or 185.190.140.2)..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="input-field"
            style={{ flex: '1 1 350px' }}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <ShieldAlert size={18} />}
            {loading ? 'Analyzing Indicators...' : 'Analyze URL'}
          </button>
        </form>

        {/* Preset chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          <span style={{ fontWeight: 600 }}>Test Samples:</span>
          {samplePresets.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setUrlInput(p.url);
                executeScan(p.url);
              }}
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '0.78rem',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', marginBottom: '2rem' }}>
          <div className="radar-spinner" style={{ marginBottom: '1.5rem' }}></div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Deconstructing Target URL</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
            Evaluating top-level domain reputation, typosquatting vectors, Punycode encoding, Shannon character entropy, and threat signatures...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="card" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
        }}>
          <AlertTriangle color="var(--color-red)" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: '#f87171', marginBottom: '0.25rem' }}>Validation or Engine Error</h4>
            <p style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Scan Results View */}
      {scanResult && !loading && (
        <div>
          {/* Executive Summary Card */}
          <div className="card" style={{
            background: 'linear-gradient(180deg, rgba(19, 28, 49, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(180px, 220px) 1fr',
              gap: '2rem',
              alignItems: 'center',
            }} className="results-header-grid">
              {/* Left: Gauge */}
              <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }} className="gauge-col">
                <RiskGauge score={scanResult.risk_score} severity={scanResult.severity_level} size={150} />
              </div>

              {/* Right: Meta & Actions */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Target Hostname
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', wordBreak: 'break-all' }}>
                      {scanResult.hostname}
                    </div>
                    <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem', wordBreak: 'break-all' }}>
                      {scanResult.normalized_url}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {scanResult.id && (
                      <button
                        onClick={handleDownloadPdf}
                        className="btn btn-secondary btn-sm"
                        disabled={pdfDownloading}
                      >
                        <Download size={15} />
                        {pdfDownloading ? 'Generating PDF...' : 'Download PDF Report'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Summary banner */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  marginBottom: '1rem',
                  lineHeight: '1.5',
                }}>
                  {scanResult.summary}
                </div>

                {/* Key indicators tags */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                  <span style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
                    <strong>Protocol:</strong> {scanResult.scheme.toUpperCase()}
                  </span>
                  <span style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
                    <strong>Entropy:</strong> {scanResult.entropy?.toFixed(2)} bits
                  </span>
                  {scanResult.is_ip_host && (
                    <span className="badge badge-high">IP Host Address</span>
                  )}
                  {scanResult.has_punycode && (
                    <span className="badge badge-critical">Punycode / IDN Encoded</span>
                  )}
                  {scanResult.threat_intel_matched && (
                    <span className="badge badge-critical">Threat Feed Hit</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
            overflowX: 'auto',
          }}>
            <button
              onClick={() => setActiveTab('findings')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'findings' ? 'var(--color-cyan)' : 'var(--text-muted)',
                borderBottom: activeTab === 'findings' ? '2px solid var(--color-cyan)' : '2px solid transparent',
                padding: '0.75rem 1rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <ShieldAlert size={16} /> Findings ({scanResult.findings?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'ai' ? 'var(--color-cyan)' : 'var(--text-muted)',
                borderBottom: activeTab === 'ai' ? '2px solid var(--color-cyan)' : '2px solid transparent',
                padding: '0.75rem 1rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Sparkles size={16} color="var(--color-cyan)" /> AI Threat Briefing
            </button>

            <button
              onClick={() => setActiveTab('recs')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'recs' ? 'var(--color-cyan)' : 'var(--text-muted)',
                borderBottom: activeTab === 'recs' ? '2px solid var(--color-cyan)' : '2px solid transparent',
                padding: '0.75rem 1rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <CheckCircle size={16} /> Mitigations ({scanResult.recommendations?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('sources')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'sources' ? 'var(--color-cyan)' : 'var(--text-muted)',
                borderBottom: activeTab === 'sources' ? '2px solid var(--color-cyan)' : '2px solid transparent',
                padding: '0.75rem 1rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Cpu size={16} /> Intelligence Feeds ({scanResult.sources?.length || 0})
            </button>
          </div>

          {/* TAB 1: FINDINGS */}
          {activeTab === 'findings' && (
            <div>
              {/* Severity filter chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Filter size={14} /> Filter Severity:
                </span>
                {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    style={{
                      background: severityFilter === sev ? 'rgba(6, 182, 212, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                      border: `1px solid ${severityFilter === sev ? 'var(--color-cyan)' : 'var(--border-color)'}`,
                      color: severityFilter === sev ? 'var(--color-cyan)' : 'var(--text-muted)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                    }}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              {filteredFindings.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={36} color="var(--color-emerald)" style={{ margin: '0 auto 0.75rem auto' }} />
                  <p>No findings matching the selected severity filter.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredFindings.map((finding, idx) => {
                    const sev = finding.severity?.toLowerCase();
                    let badgeType = 'badge-info';
                    if (sev === 'critical') badgeType = 'badge-critical';
                    else if (sev === 'high') badgeType = 'badge-high';
                    else if (sev === 'medium') badgeType = 'badge-caution';
                    else if (sev === 'low') badgeType = 'badge-low';

                    return (
                      <div key={idx} className="card" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{finding.title}</h4>
                              <span className={`badge ${badgeType}`}>{finding.severity}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                                [{finding.category}]
                              </span>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-red)' }}>
                            +{finding.score_impact} pts
                          </div>
                        </div>

                        <div className="mono" style={{
                          background: 'rgba(8, 13, 26, 0.8)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          color: 'var(--color-cyan)',
                          marginBottom: '0.65rem',
                          wordBreak: 'break-all',
                        }}>
                          {finding.evidence}
                        </div>

                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '0.65rem' }}>
                          {finding.explanation}
                        </p>

                        {finding.recommendation && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.4rem',
                            fontSize: '0.825rem',
                            color: 'var(--text-dim)',
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            paddingTop: '0.5rem',
                          }}>
                            <CheckCircle size={14} color="var(--color-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span><strong>Defensive Action:</strong> {finding.recommendation}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI THREAT BRIEFING */}
          {activeTab === 'ai' && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Sparkles size={20} color="var(--color-cyan)" />
                <h3 style={{ fontSize: '1.2rem' }}>AI-Assisted Security Advisory</h3>
              </div>
              <div style={{
                background: 'rgba(8, 13, 26, 0.6)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                lineHeight: '1.7',
                color: 'var(--text-main)',
                whiteSpace: 'pre-wrap',
              }}>
                {scanResult.ai_analysis || 'No AI analysis generated for this scan.'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <Info size={14} />
                <span>AI briefing synthesizes observed heuristic indicators into tactical defensive guidance without inventing ungrounded telemetry.</span>
              </div>
            </div>
          )}

          {/* TAB 3: RECOMMENDATIONS */}
          {activeTab === 'recs' && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Actionable Defense Checklist</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {scanResult.recommendations?.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <CheckCircle size={14} color="var(--color-emerald)" />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: THREAT SOURCES */}
          {activeTab === 'sources' && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Threat Intelligence Correlation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {scanResult.sources?.map((s, i) => (
                  <div key={i} style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.source_name}</span>
                      <span className={`badge ${s.verdict === 'clean' ? 'badge-low' : 'badge-critical'}`}>
                        Verdict: {s.verdict}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {s.details || 'Feed queried successfully.'}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Confidence: {(s.confidence * 100).toFixed(0)}% • Last checked: {new Date(s.last_updated).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assessment Limitations Notice */}
          <div style={{
            marginTop: '2rem',
            background: 'rgba(30, 41, 59, 0.3)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--text-dim)',
            lineHeight: '1.5',
          }}>
            <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Methodology & Limitations Notice:</strong> {scanResult.limitations_disclaimer}
            </div>
          </div>
        </div>
      )}

      {/* Responsive layout styles */}
      <style>{`
        @media (max-width: 768px) {
          .results-header-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .gauge-col {
            border-right: none !important;
            border-bottom: 1px solid var(--border-color);
            padding-right: 0 !important;
            padding-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
