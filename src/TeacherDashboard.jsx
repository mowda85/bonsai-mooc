import { useEffect, useMemo, useState } from 'react';

export const mockTeacherPortfolio = [
  {
    slug: 'information-systems-knowledge-dissemination',
    title: 'Information Systems and Knowledge Dissemination',
    area: 'Foundation',
    learners: 24,
    pilot: true,
  },
  {
    slug: 'dike-stability',
    title: 'Dike Stability',
    area: 'Dike Stability and Erosion',
    learners: 14,
  },
  {
    slug: 'vegetation-management',
    title: 'Vegetation Management',
    area: 'Vegetation and Nature-based Solutions',
    learners: 11,
  },
  {
    slug: 'flood-risk-management',
    title: 'Flood Risk Management',
    area: 'Flood Risk and Emergency Management',
    learners: 18,
  },
];

function currentEditorValue() {
  const query = new URLSearchParams(window.location.search);
  return query.get('editor');
}

function CourseEditorPlaceholder({ course, isNew, onBack }) {
  return (
    <main className="teacher-editor-placeholder-page">
      <section className="teacher-editor-placeholder-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Teacher Dashboard</button>
        <div className="teacher-breadcrumb"><span>Teacher Dashboard</span><b>/</b><strong>{isNew ? 'Create Course' : 'Edit Course'}</strong></div>
        <div className="teacher-editor-placeholder-grid">
          <div>
            <div className="teacher-hero-badges"><span className="pill">Course Editor handoff</span><span className="teacher-kicker-badge">KAN-32</span></div>
            <h1>{isNew ? 'Create a new BONSAI course' : `Edit ${course?.title || 'course'}`}</h1>
            <p>This lightweight destination verifies the KAN-30 dashboard handoff. The complete course-editing workflow, fields and save behavior belong to KAN-32.</p>
          </div>
          <aside className="teacher-editor-placeholder-summary">
            <div><span>Mode</span><strong>{isNew ? 'New course' : 'Edit existing'}</strong></div>
            <div><span>Course</span><strong>{isNew ? 'Blank course' : course?.title}</strong></div>
            <div><span>Next implementation</span><strong>KAN-32 Course Editor</strong></div>
          </aside>
        </div>
      </section>
      <section className="teacher-editor-placeholder-body">
        <div className="teacher-editor-placeholder-card">
          <span className="teacher-placeholder-icon" aria-hidden="true">✎</span>
          <div><span className="section-kicker">Editor placeholder</span><h2>{isNew ? 'Blank Course Editor will open here' : 'Course Editor will open here'}</h2><p>No editor fields are invented in KAN-30. This keeps the dashboard acceptance flow functional without prematurely implementing KAN-32.</p></div>
          <button className="button button-primary" type="button" onClick={onBack}>Return to dashboard</button>
        </div>
      </section>
    </main>
  );
}

export default function TeacherDashboard({ user, onNavigate }) {
  const [editorValue, setEditorValue] = useState(currentEditorValue);
  const totalLearners = useMemo(() => mockTeacherPortfolio.reduce((sum, course) => sum + course.learners, 0), []);
  const learningAreas = useMemo(() => new Set(mockTeacherPortfolio.map((course) => course.area)).size, []);
  const selectedCourse = editorValue && editorValue !== 'new' ? mockTeacherPortfolio.find((course) => course.slug === editorValue) : null;

  useEffect(() => {
    const syncQuery = () => setEditorValue(currentEditorValue());
    window.addEventListener('popstate', syncQuery);
    return () => window.removeEventListener('popstate', syncQuery);
  }, []);

  function openEditor(value) {
    window.history.pushState({}, '', `/teacher?editor=${value}`);
    setEditorValue(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeEditor() {
    window.history.pushState({}, '', '/teacher');
    setEditorValue(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (editorValue) {
    return <CourseEditorPlaceholder course={selectedCourse} isNew={editorValue === 'new'} onBack={closeEditor} />;
  }

  return (
    <main className="teacher-dashboard-page">
      <section className="teacher-dashboard-hero">
        <div>
          <div className="teacher-hero-badges"><span className="pill">Teacher dashboard</span><span className="teacher-kicker-badge">Prototype workspace</span></div>
          <h1>Welcome, {user?.name}</h1>
          <p>Manage your BONSAI courses and see a simple overview of the learners currently attached to your prototype teaching portfolio.</p>
          <small>Course assignments and learner counts below are prototype/mock data for the teacher workflow.</small>
        </div>
        <div className="teacher-dashboard-hero-actions">
          <button className="button button-outline" type="button" onClick={() => onNavigate('/')}>Homepage</button>
          <button className="button button-primary" type="button" onClick={() => openEditor('new')}>+ Create Course</button>
        </div>
      </section>

      <section className="teacher-overview" aria-label="Teacher overview">
        <article><span>My courses</span><strong>{mockTeacherPortfolio.length}</strong><small>prototype teaching portfolio</small></article>
        <article><span>Learners</span><strong>{totalLearners}</strong><small>aggregate mock enrollments</small></article>
        <article><span>Learning areas</span><strong>{learningAreas}</strong><small>Foundation + specializations</small></article>
        <article><span>Pilot courses</span><strong>{mockTeacherPortfolio.filter((course) => course.pilot).length}</strong><small>current BONSAI pilot</small></article>
      </section>

      <section className="teacher-dashboard-content">
        <section className="teacher-courses-panel" aria-labelledby="teacher-courses-heading">
          <div className="teacher-section-heading">
            <div><span className="section-kicker">Course management</span><h2 id="teacher-courses-heading">My Courses</h2><p>Edit an existing course or start a new one. Editor actions currently hand off to the KAN-32 placeholder.</p></div>
            <button className="button button-primary" type="button" onClick={() => openEditor('new')}>+ Create Course</button>
          </div>

          <div className="teacher-course-table" role="table" aria-label="My Courses">
            <div className="teacher-course-table-head" role="row">
              <span role="columnheader">Course</span><span role="columnheader">Track / learning area</span><span role="columnheader">Learners</span><span role="columnheader">Action</span>
            </div>
            {mockTeacherPortfolio.map((course) => (
              <div className="teacher-course-row" role="row" key={course.slug}>
                <div className="teacher-course-name" role="cell"><div className="teacher-course-icon">{course.pilot ? 'P' : 'C'}</div><div><strong>{course.title}</strong>{course.pilot && <span className="pilot-badge">Pilot course</span>}</div></div>
                <div className="teacher-course-area" role="cell"><span>{course.area}</span></div>
                <div className="teacher-course-learners" role="cell"><strong>{course.learners}</strong><small>prototype learners</small></div>
                <div className="teacher-course-action" role="cell"><button className="button button-outline" type="button" onClick={() => openEditor(course.slug)}>Edit →</button></div>
              </div>
            ))}
          </div>
        </section>

        <aside className="teacher-learners-panel">
          <span className="section-kicker">Students overview</span>
          <h2>{totalLearners} learner enrollments</h2>
          <p>This KAN-30 view stays at aggregate level. Individual progress, results and feedback belong to the later teacher tasks.</p>
          <div className="teacher-learner-breakdown">
            {mockTeacherPortfolio.map((course) => (
              <div key={course.slug}><div><strong>{course.title}</strong><span>{course.learners}</span></div><div className="teacher-count-track"><span style={{ width: `${Math.round((course.learners / Math.max(...mockTeacherPortfolio.map((item) => item.learners))) * 100)}%` }} /></div></div>
            ))}
          </div>
          <button className="button button-outline" type="button" onClick={() => onNavigate('/courses')}>View public course catalogue</button>
        </aside>
      </section>
    </main>
  );
}
