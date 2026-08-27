import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getAllFeedbackRecords } from './feedbackStore.js';
import { mockTeacherPortfolio } from './TeacherDashboard.jsx';

function locationKey() {
  return `${window.location.pathname}${window.location.search}`;
}

function isFeedbackOverviewRoute() {
  if (window.location.pathname !== '/teacher') return false;
  return new URLSearchParams(window.location.search).get('feedback') === 'overview';
}

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatSubmittedAt(value) {
  if (!value) return 'Submission time unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Submission time unavailable' : date.toLocaleString();
}

function TeacherFeedbackOverviewPage({ onBack }) {
  const records = getAllFeedbackRecords();
  const [query, setQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  const portfolioBySlug = useMemo(() => new Map(mockTeacherPortfolio.map((course) => [course.slug, course])), []);
  const teacherRecords = useMemo(() => records.filter((record) => portfolioBySlug.has(record.courseSlug)), [portfolioBySlug, records]);

  const latestSubmission = useMemo(() => {
    if (!teacherRecords.length) return null;
    return teacherRecords.reduce((latest, record) => {
      const time = new Date(record.submittedAt || 0).getTime();
      return time > latest ? time : latest;
    }, 0);
  }, [teacherRecords]);

  const coursesWithFeedback = useMemo(() => new Set(teacherRecords.map((record) => record.courseSlug)).size, [teacherRecords]);

  const filteredRecords = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return teacherRecords.filter((record) => {
      if (courseFilter !== 'all' && record.courseSlug !== courseFilter) return false;
      if (!needle) return true;
      const course = portfolioBySlug.get(record.courseSlug);
      return [record.learnerName, record.learnerId, record.comment, record.courseTitle, course?.title]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [courseFilter, portfolioBySlug, query, teacherRecords]);

  const grouped = useMemo(() => mockTeacherPortfolio
    .map((course) => ({ course, records: filteredRecords.filter((record) => record.courseSlug === course.slug) }))
    .filter((group) => group.records.length), [filteredRecords]);

  return (
    <main className="teacher-feedback-overview-page">
      <section className="teacher-feedback-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Teacher Dashboard</button>
        <div className="teacher-breadcrumb"><span>Teacher Dashboard</span><b>/</b><strong>Feedback Overview</strong></div>
        <div className="teacher-feedback-heading">
          <div>
            <div className="teacher-hero-badges"><span className="pill">Feedback overview</span><span className="teacher-kicker-badge">KAN-39</span></div>
            <h1>Learner feedback by course</h1>
            <p>Read comments submitted through the learner completion flow, grouped by the courses in your teaching portfolio. No feedback is generated or inferred on this page.</p>
          </div>
        </div>
      </section>

      <section className="teacher-feedback-summary" aria-label="Feedback summary">
        <article><span>Submitted comments</span><strong>{teacherRecords.length}</strong><small>KAN-29 feedback records</small></article>
        <article><span>Courses with feedback</span><strong>{coursesWithFeedback}</strong><small>of {mockTeacherPortfolio.length} assigned courses</small></article>
        <article><span>Latest submission</span><strong>{latestSubmission ? new Date(latestSubmission).toLocaleDateString() : '—'}</strong><small>{latestSubmission ? new Date(latestSubmission).toLocaleTimeString() : 'No feedback yet'}</small></article>
      </section>

      <section className="teacher-feedback-body">
        <section className="teacher-feedback-toolbar" aria-label="Feedback filters">
          <div>
            <span className="section-kicker">Filter comments</span>
            <h2>Find learner feedback</h2>
          </div>
          <div className="teacher-feedback-filters">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search learner, course or comment…" aria-label="Search learner feedback" />
            <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} aria-label="Filter feedback by course">
              <option value="all">All courses</option>
              {mockTeacherPortfolio.map((course) => <option value={course.slug} key={course.slug}>{course.title}</option>)}
            </select>
          </div>
        </section>

        {!teacherRecords.length ? (
          <section className="teacher-feedback-empty">
            <span aria-hidden="true">💬</span>
            <h2>No learner feedback submitted yet</h2>
            <p>When a learner submits the KAN-29 completion feedback form in this same prototype session, the comment will appear here under its course. No mock feedback has been added.</p>
          </section>
        ) : !grouped.length ? (
          <section className="teacher-feedback-empty">
            <span aria-hidden="true">⌕</span>
            <h2>No feedback matches these filters</h2>
            <p>Clear the search or choose another course to see the existing learner comments.</p>
          </section>
        ) : (
          <div className="teacher-feedback-groups">
            {grouped.map(({ course, records: courseRecords }) => (
              <section className="teacher-feedback-course" key={course.slug}>
                <header>
                  <div>
                    <span className="section-kicker">Course feedback</span>
                    <h2>{course.title}</h2>
                    <p>{course.area || course.areas?.join(' · ') || 'Assigned course'} · {courseRecords.length} comment{courseRecords.length === 1 ? '' : 's'}</p>
                  </div>
                  <button className="button button-outline" type="button" onClick={() => navigate(`/teacher?progress=${course.slug}`)}>Open Progress & Results</button>
                </header>

                <div className="teacher-feedback-list">
                  {courseRecords
                    .slice()
                    .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0))
                    .map((record) => (
                      <article className="teacher-feedback-comment" key={record.id}>
                        <div className="teacher-feedback-comment-head">
                          <div className="teacher-feedback-avatar">{(record.learnerName || 'L').trim().charAt(0).toUpperCase()}</div>
                          <div><strong>{record.learnerName || record.learnerId || 'Learner'}</strong><small>{formatSubmittedAt(record.submittedAt)}</small></div>
                          <span>Submitted</span>
                        </div>
                        <p>{record.comment}</p>
                      </article>
                    ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function TeacherFeedbackOverviewBridge() {
  const [routeKey, setRouteKey] = useState(locationKey);
  const [target, setTarget] = useState(null);
  const [buttonTarget, setButtonTarget] = useState(null);
  const active = isFeedbackOverviewRoute();

  useEffect(() => {
    const syncRoute = () => setRouteKey(locationKey());
    const scan = () => {
      const nextTarget = document.querySelector('.dashboard-placeholder');
      const nextButtonTarget = document.querySelector('.teacher-dashboard-hero-actions');
      setTarget((current) => current === nextTarget ? current : nextTarget);
      setButtonTarget((current) => current === nextButtonTarget ? current : nextButtonTarget);
    };

    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('popstate', scan);
    scan();
    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('popstate', scan);
    };
  }, []);

  useEffect(() => {
    if (!target) return undefined;
    target.classList.toggle('teacher-feedback-overview-active', active);
    return () => target?.classList.remove('teacher-feedback-overview-active');
  }, [active, routeKey, target]);

  return (
    <>
      {!active && buttonTarget ? createPortal(
        <button className="button button-outline teacher-feedback-overview-entry" type="button" onClick={() => navigate('/teacher?feedback=overview')}>Feedback Overview</button>,
        buttonTarget,
      ) : null}
      {active && target ? createPortal(<TeacherFeedbackOverviewPage onBack={() => navigate('/teacher')} />, target) : null}
    </>
  );
}
