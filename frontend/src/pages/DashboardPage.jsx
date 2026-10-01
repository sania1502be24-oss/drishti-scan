import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ShieldAlert, CheckCircle, GraduationCap,
  Download, Trash2, Search, Filter, RefreshCw, ArrowUpRight,
  TrendingUp, BarChart3, AlertTriangle, FileSpreadsheet
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [exportingCsv, setExportingCsv] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, scansData] = await Promise.all([
        api.getDashboardStats(),
        api.getScans(searchTerm, selectedSeverity),
      ]);
      setStats(statsData);
      setScans(scansData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // User not logged in
      return;
    }
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, authLoading, searchTerm, selectedSeverity]);

  const handleDeleteScan = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this scan from your history?')) return;
    try {
      await api.deleteScan(id);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to delete scan: ' + err.message);
    }
  };

  const handleDownloadPdf = async (id, hostname, e) => {
    e.stopPropagation();
    try {
      const blob = await api.getPdfReportBlob(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Drishti_Report_${hostname}_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error downloading PDF: ' + err.message);
    }
  };

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const blob = await api.getExportCsvBlob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'drishti_scan_history.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error exporting CSV: ' + err.message);
    } finally {
      setExportingCsv(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem auto' }} />
        <p>Validating authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '4.5rem 1.25rem', textAlign: 'center', maxWidth: '600px' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <LayoutDashboard size={48} color="var(--color-cyan)" style={{ margin: '0 auto 1.25rem auto' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Personal Security Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Please sign in or create an account to access your private scan telemetry, trend reports, and academy milestones.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-secondary" style={{ minWidth: '130px' }}>Sign In</Link>
            <Link to="/register" className="btn btn-primary" style={{ minWidth: '130px' }}>Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  const dist = stats?.risk_distribution || { low: 0, caution: 0, high: 0, critical: 0 };
  const totalScansCount = stats?.total_scans || 0;

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem 1.25rem' }}>
      {/* Page Title & User Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <LayoutDashboard color="var(--color-cyan)" size={28} /> Security Operations Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Telemetry and assessment records for <strong>{user?.full_name || user?.email}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCsv} className="btn btn-secondary btn-sm" disabled={exportingCsv}>
            <FileSpreadsheet size={15} /> {exportingCsv ? 'Exporting...' : 'Export CSV'}
          </button>
          <Link to="/scan" className="btn btn-primary btn-sm">
            <ShieldAlert size={15} /> New Scan
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {/* Total Scans */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Assessed URLs</span>
            <ShieldAlert size={18} color="var(--color-cyan)" />
          </div>
          <div className="mono" style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            {stats?.total_scans || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Across all sessions
          </div>
        </div>

        {/* Average Risk Score */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mean Threat Index</span>
            <TrendingUp size={18} color="var(--color-amber)" />
          </div>
          <div className="mono" style={{ fontSize: '2rem', fontWeight: 800, color: (stats?.avg_risk_score > 50 ? 'var(--color-orange)' : 'var(--color-emerald)') }}>
            {stats?.avg_risk_score || 0}<span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/100</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Weighted risk average
          </div>
        </div>

        {/* Quizzes Passed */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quizzes Passed</span>
            <CheckCircle size={18} color="var(--color-emerald)" />
          </div>
          <div className="mono" style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            {stats?.quizzes_passed || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Passing threshold: 70%
          </div>
        </div>

        {/* Academy Progress % */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Academy Mastery</span>
            <GraduationCap size={18} color="var(--color-indigo)" />
          </div>
          <div className="mono" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-cyan)' }}>
            {stats?.academy_progress_percent || 0}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {stats?.total_modules || 3} curriculum modules
          </div>
        </div>
      </div>

      {/* Analytics Visualizations Row */}
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {/* Risk Distribution Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} color="var(--color-cyan)" /> Risk Level Distribution
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Low */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>Lower Observed Risk (0-29)</span>
                <span className="mono">{dist.low} ({totalScansCount > 0 ? Math.round((dist.low / totalScansCount) * 100) : 0}%)</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalScansCount > 0 ? (dist.low / totalScansCount) * 100 : 0}%`, background: 'var(--color-emerald)' }} />
              </div>
            </div>

            {/* Caution */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>Caution (30-59)</span>
                <span className="mono">{dist.caution} ({totalScansCount > 0 ? Math.round((dist.caution / totalScansCount) * 100) : 0}%)</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalScansCount > 0 ? (dist.caution / totalScansCount) * 100 : 0}%`, background: 'var(--color-amber)' }} />
              </div>
            </div>

            {/* High */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--color-orange)', fontWeight: 600 }}>High Risk (60-79)</span>
                <span className="mono">{dist.high} ({totalScansCount > 0 ? Math.round((dist.high / totalScansCount) * 100) : 0}%)</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalScansCount > 0 ? (dist.high / totalScansCount) * 100 : 0}%`, background: 'var(--color-orange)' }} />
              </div>
            </div>

            {/* Critical */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--color-red)', fontWeight: 600 }}>Very High Risk (80-100)</span>
                <span className="mono">{dist.critical} ({totalScansCount > 0 ? Math.round((dist.critical / totalScansCount) * 100) : 0}%)</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalScansCount > 0 ? (dist.critical / totalScansCount) * 100 : 0}%`, background: 'var(--color-red)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Trend Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--color-cyan)" /> 7-Day Assessment Volume
          </h3>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', paddingTop: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            {stats?.daily_trends?.map((item, idx) => {
              const maxCount = Math.max(...(stats?.daily_trends?.map((d) => d.count) || [1]), 1);
              const barHeight = Math.max(10, (item.count / maxCount) * 100);
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                  <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--color-cyan)' }}>{item.count}</div>
                  <div style={{
                    width: '60%',
                    maxWidth: '28px',
                    height: `${barHeight}px`,
                    background: item.count > 0 ? 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)' : 'rgba(30, 41, 59, 0.4)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                  }} />
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                    {item.date.slice(5)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scan History Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem' }}>Personal Scan History ({scans.length})</h3>

          {/* Search & Severity Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.85rem', width: '180px' }}
              />
            </div>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="input-field"
              style={{ height: '36px', fontSize: '0.85rem', width: '150px' }}
            >
              <option value="">All Severities</option>
              <option value="Lower observed risk">Lower Risk</option>
              <option value="Caution">Caution</option>
              <option value="High risk">High Risk</option>
              <option value="Very high risk">Very High Risk</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 0.5rem auto' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Updating records...</p>
          </div>
        ) : scans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <ShieldAlert size={36} color="var(--text-dim)" style={{ margin: '0 auto 0.75rem auto' }} />
            <p>No scans found matching your search or filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Target Hostname</th>
                  <th>Risk Score</th>
                  <th>Severity</th>
                  <th>Findings</th>
                  <th>Scan Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((s) => {
                  let badgeClass = 'badge-low';
                  if (s.risk_score >= 80) badgeClass = 'badge-critical';
                  else if (s.risk_score >= 60) badgeClass = 'badge-high';
                  else if (s.risk_score >= 30) badgeClass = 'badge-caution';

                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{s.hostname}</div>
                        <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.url}
                        </div>
                      </td>
                      <td>
                        <span className="mono" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          {s.risk_score}/100
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${badgeClass}`}>{s.severity_level}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {s.findings_count} indicators
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        {new Date(s.created_at).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => navigate(`/scan?url=${encodeURIComponent(s.url)}`)}
                            className="btn btn-secondary btn-sm"
                            title="Re-run assessment"
                          >
                            <ArrowUpRight size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDownloadPdf(s.id, s.hostname, e)}
                            className="btn btn-secondary btn-sm"
                            title="Download PDF report"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteScan(s.id, e)}
                            className="btn btn-danger btn-sm"
                            title="Delete scan"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
