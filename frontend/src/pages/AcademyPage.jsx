import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, BookOpen, CheckCircle, AlertCircle, Clock,
  ArrowRight, ArrowLeft, Award, HelpCircle, Mail, Globe, Shield, RefreshCw
} from 'lucide-react';

export default function AcademyPage() {
  const { isAuthenticated } = useAuth();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleDetail, setModuleDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState('lessons'); // lessons, quiz

  const fetchModules = async () => {
    setLoading(true);
    try {
      const data = await api.getModules();
      setModules(data);
    } catch (err) {
      console.error('Failed to load modules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [isAuthenticated]);

  const handleSelectModule = async (mod) => {
    setSelectedModule(mod);
    setDetailLoading(true);
    setQuizResult(null);
    setQuizAnswers({});
    setActiveTab('lessons');

    try {
      const detail = await api.getModuleDetail(mod.id);
      setModuleDetail(detail);
    } catch (err) {
      alert('Error loading module: ' + err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBackToCatalog = () => {
    setSelectedModule(null);
    setModuleDetail(null);
    setQuizResult(null);
    fetchModules();
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!isAuthenticated) {
      alert('Please sign in or register to submit quiz attempts and record your security progress!');
      return;
    }
    const questions = moduleDetail?.questions || [];
    const unanswered = questions.filter((q) => quizAnswers[q.id] === undefined);
    if (unanswered.length > 0) {
      alert(`Please answer all questions before submitting. (${unanswered.length} unanswered)`);
      return;
    }

    setSubmittingQuiz(true);
    try {
      const result = await api.submitQuiz(selectedModule.id, quizAnswers);
      setQuizResult(result);
    } catch (err) {
      alert('Failed to submit quiz: ' + err.message);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Render Visual Scenarios (Email header, URL inspect)
  const renderVisualScenario = (question) => {
    if (!question.visual_type || question.visual_type === 'none') {
      if (question.scenario_context) {
        return (
          <div style={{
            background: 'rgba(8, 13, 26, 0.7)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
            fontFamily: 'var(--font-mono)',
          }}>
            {question.scenario_context}
          </div>
        );
      }
      return null;
    }

    if (question.visual_type === 'email_header') {
      const p = question.visual_payload || {};
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Mail size={16} /> SIMULATED INBOX MESSAGE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.35rem', color: 'var(--text-muted)' }}>
            <div><strong>From:</strong></div>
            <div className="mono" style={{ color: '#f8fafc' }}>{p.from}</div>
            <div><strong>Subject:</strong></div>
            <div style={{ color: '#f8fafc' }}>{p.subject}</div>
            <div><strong>Action:</strong></div>
            <div className="mono" style={{ color: 'var(--color-cyan)', wordBreak: 'break-all' }}>{p.action_link}</div>
          </div>
        </div>
      );
    }

    if (question.visual_type === 'url_inspect') {
      const p = question.visual_payload || {};
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-cyan)', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Globe size={16} /> INSPECTED HYPERLINK
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.35rem', color: 'var(--text-muted)' }}>
            <div>Displayed:</div>
            <div className="mono" style={{ color: 'var(--color-emerald)' }}>{p.displayed}</div>
            <div>Actual Href:</div>
            <div className="mono" style={{ color: '#f87171', wordBreak: 'break-all' }}>{p.destination}</div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem 1.25rem' }}>
      {/* View 1: Modules Catalog */}
      {!selectedModule ? (
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <GraduationCap color="var(--color-cyan)" size={28} /> Cyber Awareness Academy
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Practical cybersecurity lessons and realistic phishing simulation quizzes. Test your threat detection skills.
            </p>
          </div>

          {!isAuthenticated && (
            <div style={{
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1.25rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.85rem',
            }}>
              <Shield size={20} color="var(--color-cyan)" style={{ flexShrink: 0 }} />
              <div>
                <strong>Guest Mode:</strong> You can read lessons and view questions. Sign in or register to record quiz attempts and track completion milestones on your dashboard!
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem auto' }} />
              <p>Loading course modules...</p>
            </div>
          ) : (
            <div className="grid-3">
              {modules.map((m) => {
                const isCompleted = m.status === 'completed';
                return (
                  <div key={m.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span className="badge badge-info">{m.difficulty}</span>
                        {isCompleted ? (
                          <span className="badge badge-low" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle size={13} /> {m.best_score}%
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={13} /> {m.estimated_minutes} min
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{m.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                        {m.overview}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectModule(m)}
                      className="btn btn-secondary"
                      style={{ width: '100%', justifyContent: 'space-between' }}
                    >
                      <span>{isCompleted ? 'Review & Retake' : 'Start Module'}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* View 2: Module Detail (Lessons & Quiz) */
        <div>
          {/* Header & Back Button */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={handleBackToCatalog} className="btn btn-secondary btn-sm">
              <ArrowLeft size={16} /> Back to Academy
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-info">{selectedModule.category}</span>
              <span className="badge badge-low">{selectedModule.difficulty}</span>
            </div>
          </div>

          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>{selectedModule.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            {selectedModule.overview}
          </p>

          {/* Module Mode Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setActiveTab('lessons')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'lessons' ? 'var(--color-cyan)' : 'var(--text-muted)',
                borderBottom: activeTab === 'lessons' ? '2px solid var(--color-cyan)' : '2px solid transparent',
                padding: '0.75rem 1rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <BookOpen size={16} /> Lesson Content
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'quiz' ? 'var(--color-cyan)' : 'var(--text-muted)',
                borderBottom: activeTab === 'quiz' ? '2px solid var(--color-cyan)' : '2px solid transparent',
                padding: '0.75rem 1rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <HelpCircle size={16} /> Phishing Simulation Quiz ({moduleDetail?.questions?.length || 0})
            </button>
          </div>

          {detailLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 1rem auto' }} />
              <p>Loading course content...</p>
            </div>
          ) : (
            <div>
              {/* LESSON TAB */}
              {activeTab === 'lessons' && moduleDetail && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {JSON.parse(moduleDetail.content_json || '[]').map((sec, idx) => (
                    <div key={idx} className="card">
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--color-cyan)', marginBottom: '0.75rem' }}>
                        {sec.section}
                      </h3>
                      <div style={{
                        fontSize: '0.925rem',
                        lineHeight: '1.7',
                        color: 'var(--text-main)',
                        whiteSpace: 'pre-line',
                      }}>
                        {sec.text}
                      </div>
                    </div>
                  ))}

                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button onClick={() => setActiveTab('quiz')} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                      Ready for the Phishing Quiz? Take Assessment <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* QUIZ TAB */}
              {activeTab === 'quiz' && moduleDetail && (
                <div>
                  {/* Results Screen after submission */}
                  {quizResult ? (
                    <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
                      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                          display: 'inline-flex',
                          padding: '1rem',
                          borderRadius: '50%',
                          background: quizResult.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          marginBottom: '1rem',
                        }}>
                          {quizResult.passed ? (
                            <Award size={48} color="var(--color-emerald)" />
                          ) : (
                            <AlertCircle size={48} color="var(--color-red)" />
                          )}
                        </div>

                        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                          {quizResult.passed ? 'Assessment Passed!' : 'Need Review'}
                        </h2>
                        <div className="mono" style={{
                          fontSize: '2.5rem',
                          fontWeight: 800,
                          color: quizResult.passed ? 'var(--color-emerald)' : 'var(--color-red)',
                          lineHeight: 1,
                          marginBottom: '0.75rem',
                        }}>
                          {quizResult.score}%
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
                          {quizResult.feedback}
                        </p>
                      </div>

                      {/* Detailed Question Review */}
                      <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Detailed Question Analysis</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {quizResult.review.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'rgba(8, 13, 26, 0.6)',
                              border: `1px solid ${item.is_correct ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                              borderRadius: 'var(--radius-md)',
                              padding: '1.25rem',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Question {idx + 1}</span>
                              <span className={`badge ${item.is_correct ? 'badge-low' : 'badge-critical'}`}>
                                {item.is_correct ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.925rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                              {item.question}
                            </p>

                            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                              <span style={{ color: 'var(--text-dim)' }}>Your Selection: </span>
                              <span style={{ color: item.is_correct ? 'var(--color-emerald)' : '#f87171', fontWeight: 600 }}>
                                {item.user_choice >= 0 ? item.options[item.user_choice] : 'No answer'}
                              </span>
                            </div>

                            {!item.is_correct && (
                              <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-dim)' }}>Correct Answer: </span>
                                <span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>
                                  {item.options[item.correct_choice]}
                                </span>
                              </div>
                            )}

                            <div style={{
                              background: 'rgba(15, 23, 42, 0.7)',
                              padding: '0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.825rem',
                              color: 'var(--text-muted)',
                              lineHeight: '1.5',
                              borderLeft: '3px solid var(--color-cyan)',
                            }}>
                              <strong>Threat Explanation:</strong> {item.explanation}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                        <button onClick={() => { setQuizResult(null); setQuizAnswers({}); }} className="btn btn-secondary">
                          Retake Quiz
                        </button>
                        <button onClick={handleBackToCatalog} className="btn btn-primary">
                          Return to Catalog
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Active Quiz Question Form */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {moduleDetail.questions.map((q, qIdx) => (
                        <div key={q.id} className="card" style={{ padding: '1.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-cyan)', textTransform: 'uppercase' }}>
                              Question {qIdx + 1} of {moduleDetail.questions.length} • {q.threat_category}
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '1rem', lineHeight: '1.5' }}>
                            {q.question}
                          </h3>

                          {/* Visual scenario if applicable */}
                          {renderVisualScenario(q)}

                          {/* Options */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {q.options.map((opt, optIdx) => {
                              const isSelected = quizAnswers[q.id] === optIdx;
                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => handleAnswerSelect(q.id, optIdx)}
                                  style={{
                                    textAlign: 'left',
                                    padding: '0.85rem 1.15rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                                    border: `1px solid ${isSelected ? 'var(--color-cyan)' : 'var(--border-color)'}`,
                                    color: isSelected ? '#ffffff' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.15s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                  }}
                                >
                                  <div style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    border: `2px solid ${isSelected ? 'var(--color-cyan)' : 'var(--border-color)'}`,
                                    background: isSelected ? 'var(--color-cyan)' : 'transparent',
                                    flexShrink: 0,
                                  }} />
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Submit button */}
                      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button
                          onClick={handleSubmitQuiz}
                          disabled={submittingQuiz}
                          className="btn btn-primary"
                          style={{ padding: '0.85rem 2.25rem', fontSize: '1rem' }}
                        >
                          {submittingQuiz ? 'Evaluating Answers...' : 'Submit Assessment'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
