import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getAllFeedbackRecords } from './feedbackStore.js';
import { mockTeacherPortfolio } from './TeacherDashboard.jsx';
import './teacher-progress-results.css';

function progressSlug() {
  if (window.location.pathname !== '/teacher') return '';
  return new URLSearchParams(window.location.search).get('progress') || '';
}

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function buildMockRows(course, feedbackRecords) {
  const matchingFeedback = feedbackRecords.filter((record) => record.courseSlug === course.slug);
  const rows = matchingFeedback.map((record, index) => ({
    id: record.learnerId,
    name: record.learnerName || `Learner ${String(index + 1).padStart(2, '0')}`,
    status: 'Completed',
    progress: 100,
    score: 4,
    scoreOutOf: 5,
    unitsCompleted: Math.max(course.units?.length || 3, 1),
    unitsTotal: Math.max(course.units?.length || 3, 1),
    activity: 'Completed',
    quiz: 'Submitted',
    feedback: record,
    source: 'session',
  }));

  const targetCount = Math.max(course.learners || 0, rows.length);
  const existingIds = new Set(rows.map((row) => row.id));
  for (let index = 0; rows.length < targetCount; index += 1) {
    const ordinal = index + 1;
    const id = `mock-${course.slug}-${ordinal}`;
    if (existingIds.has(id)) continue;
    const cycle = ordinal % 6;
    const status = cycle === 0 || cycle === 1 ? 'Completed' : cycle === 2 || cycle === 3 || cycle === 4 ? 'In Progress' : 'Not Started';
    const progress = status === 'Completed' ? 100 : status === 'Not Started' ? 0 : [28, 52, 76][ordinal % 3];
    const hasScore = status === 'Completed' || (status === 'In Progress' && ordinal % 2 === 0);
    const score = hasScore ? Math.min(5, 2 + (ordinal % 4)) : null;
    const unitsTotal = Math.max(course.units?.length || 3, 1);
    const unitsCompleted = status === 'Completed' ? unitsTotal : status === 'Not Started' ? 0 : Math.min(unitsTotal - 1, Math.max(1, Math.round((progress / 100) * unitsTotal)));
    rows.push({
      id,
      name: `Learner ${String(ordinal).padStart(2, '0')}`,
      status,
      progress,
      score,
      scoreOutOf: 5,
      unitsCompleted,
      unitsTotal,
      activity: status === 'Not Started' ? 'Not started' : status === 'Completed' || ordinal % 2 === 0 ? 'Completed' : 'In progress',
      quiz: score == null ? 'Not submitted' : 'Submitted',
      feedback: null,
      source: 'mock',
    });
    existingIds.add(id);
  }
  return rows;
}

function scoreText(row) {
  return row.score == null ? '—' : `${row.score}/${row.scoreOutOf}`;
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function TeacherProgressResultsPage({ course, onBack }) {
  const feedbackRecords = getAllFeedbackRecords();
  const rows = useMemo(() => buildMockRows(course, feedbackRecords), [course, feedbackRecords.length]);
  const [selectedId, setSelectedId] = useState(rows[0]?.id || '');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rows.filter((row) => (statusFilter === 'All' || row.status === statusFilter) && (!normalized || row.name.toLowerCase().includes(normalized)));
  }, [query, rows, statusFilter]);

  const selected = rows.find((row) => row.id === selectedId) || rows[0] || null;
  const completed = rows.filter((row) => row.status === 'Completed').length;
  const averageProgress = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.progress, 0) / rows.length) : 0;
  const scored = rows.filter((row) => row.score != null);
  const averageScore = scored.length ? (scored.reduce((sum, row) => sum + row.score, 0) / scored.length).toFixed(1) : '—';

  function exportReport() {
    const header = ['Learner', 'Status', 'Progress', 'Score', 'Units completed', 'Activity', 'Quiz'];
    const lines = [header, ...filteredRows.map((row) => [row.name, row.status, `${row.progress}%`, scoreText(row), `${row.unitsCompleted}/${row.unitsTotal}`, row.activity, row.quiz])]
      .map((line) => line.map(csvCell).join(','));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.slug}-progress-results.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="teacher-progress-results-page">
      <section className="teacher-progress-results-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Assigned Course</button>
        <div className="teacher-breadcrumb"><span>Teacher Dashboard</span><b>/</b><span>{course.title}</span><b>/</b><strong>Progress & Results</strong></div>
        <div className="teacher-progress-results-heading">
          <div>
            <div className="teacher-hero-badges"><span className="pill">Progress & Results</span><span className="teacher-kicker-badge">KAN-38</span></div>
            <h1>Learner progress & results</h1>
            <p>Review per-learner prototype progress and scores for <strong>{course.title}</strong>. These rows are mock analytics for the prototype; learner activity is not recalculated here.</p>
          </div>
          <button className="button button-primary" type="button" onClick={exportReport}>Export Report</button>
        </div>
      </section>

      <section className="teacher-progress-summary" aria-label="Progress summary">
        <article><span>Learner records</span><strong>{rows.length}</strong><small>{course.learners} aggregate enrollments in course context</small></article>
        <article><span>Completed</span><strong>{completed}</strong><small>{rows.length ? Math.round((completed / rows.length) * 100) : 0}% of displayed records</small></article>
        <article><span>Average progress</span><strong>{averageProgress}%</strong><small>displayed prototype records</small></article>
        <article><span>Average score</span><strong>{averageScore === '—' ? '—' : `${averageScore}/5`}</strong><small>{scored.length} scored learner{scored.length === 1 ? '' : 's'}</small></article>
      </section>

      <section className="teacher-progress-results-body">
        <section className="teacher-progress-table-card">
          <div className="teacher-progress-table-heading">
            <div><span className="section-kicker">Learners</span><h2>Progress & score rows</h2><p>Search or filter the structured mock records. No missing score is inferred.</p></div>
            <div className="teacher-progress-filters">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search learner…" aria-label="Search learner" />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter learner status">
                <option>All</option><option>Completed</option><option>In Progress</option><option>Not Started</option>
              </select>
            </div>
          </div>

          <div className="teacher-progress-table" role="table" aria-label="Learner progress and results">
            <div className="teacher-progress-table-head" role="row"><span>Learner</span><span>Status</span><span>Progress</span><span>Score</span><span>Action</span></div>
            {filteredRows.map((row) => (
              <div className={`teacher-progress-row ${selected?.id === row.id ? 'selected' : ''}`} role="row" key={row.id}>
                <div className="teacher-progress-learner"><span>{row.name.slice(-2)}</span><div><strong>{row.name}</strong><small>{row.source === 'session' ? 'Same-session learner record' : 'Prototype mock learner'}</small></div></div>
                <div><span className={`teacher-progress-status status-${row.status.toLowerCase().replaceAll(' ', '-')}`}>{row.status}</span></div>
                <div className="teacher-progress-meter-cell"><div><strong>{row.progress}%</strong><span className="teacher-progress-meter"><i style={{ width: `${row.progress}%` }} /></span></div></div>
                <div className="teacher-progress-score"><strong>{scoreText(row)}</strong><small>{row.score == null ? 'Not available' : 'Prototype result'}</small></div>
                <div><button className="button button-outline" type="button" onClick={() => setSelectedId(row.id)}>View Learner</button></div>
              </div>
            ))}
            {!filteredRows.length && <div className="teacher-progress-empty">No learner records match the current search/filter.</div>}
          </div>
        </section>

        <aside className="teacher-progress-detail-card">
          <span className="section-kicker">Learner detail</span>
          {selected ? <>
            <div className="teacher-progress-detail-title"><span>{selected.name.slice(-2)}</span><div><h2>{selected.name}</h2><small>{selected.status}</small></div></div>
            <div className="teacher-progress-detail-grid">
              <div><span>Course progress</span><strong>{selected.progress}%</strong></div>
              <div><span>Quiz score</span><strong>{scoreText(selected)}</strong></div>
              <div><span>Units completed</span><strong>{selected.unitsCompleted}/{selected.unitsTotal}</strong></div>
              <div><span>Activity</span><strong>{selected.activity}</strong></div>
              <div><span>Quiz</span><strong>{selected.quiz}</strong></div>
            </div>
            <section className="teacher-progress-feedback-detail">
              <span className="section-kicker">Feedback</span>
              {selected.feedback ? <><strong>Submitted learner comment</strong><p>“{selected.feedback.comment}”</p><small>KAN-29 record · {new Date(selected.feedback.submittedAt).toLocaleString()}</small></> : <><strong>No feedback submitted</strong><p>No same-session KAN-29 feedback record exists for this learner and course. Teacher feedback is not invented.</p></>}
            </section>
          </> : <div className="teacher-progress-empty">No learner record is available for this course.</div>}
        </aside>
      </section>
    </main>
  );
}

export default function TeacherProgressResultsBridge() {
  const [version, setVersion] = useState(0);
  const [target, setTarget] = useState(null);
  const slug = progressSlug();
  const course = slug ? mockTeacherPortfolio.find((item) => item.slug === slug) : null;

  useEffect(() => {
    let queued = false;
    const scan = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        const nextTarget = document.querySelector('.dashboard-placeholder');
        setTarget((current) => current === nextTarget ? current : nextTarget);
        setVersion((value) => value + 1);
      });
    };
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', scan);
    scan();
    return () => { observer.disconnect(); window.removeEventListener('popstate', scan); };
  }, []);

  useEffect(() => {
    if (!target) return undefined;
    const active = Boolean(slug && course);
    target.classList.toggle('teacher-progress-results-active', active);
    return () => target?.classList.remove('teacher-progress-results-active');
  }, [course, slug, target, version]);

  if (!target || !slug || !course) return null;
  return createPortal(<TeacherProgressResultsPage course={course} onBack={() => navigate(`/teacher?course=${course.slug}`)} />, target);
}
