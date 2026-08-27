import { useEffect, useMemo, useState } from 'react';

export const mockTeacherPortfolio = [
  {
    slug: 'information-systems-knowledge-dissemination',
    title: 'Information Systems and Knowledge Dissemination',
    area: 'Foundation',
    learners: 24,
    status: 'Published',
    pilot: true,
  },
  {
    slug: 'dike-stability',
    title: 'Dike Stability',
    area: 'Dike Stability and Erosion',
    learners: 14,
    status: 'Under Review',
  },
  {
    slug: 'vegetation-management',
    title: 'Vegetation Management',
    area: 'Vegetation and Nature-based Solutions',
    learners: 11,
    status: 'Draft',
  },
  {
    slug: 'flood-risk-management',
    title: 'Flood Risk Management',
    area: 'Flood Risk and Emergency Management',
    learners: 18,
    status: 'Approved',
  },
];

const workflowStatuses = ['Draft', 'Under Review', 'Approved', 'Published'];

function readTeacherQuery() {
  const query = new URLSearchParams(window.location.search);
  return {
    editor: query.get('editor'),
    course: query.get('course'),
    progress: query.get('progress'),
  };
}

function CourseEditorPlaceholder({ course, isNew, onBack }) {
  return (
    <main className="teacher-editor-placeholder-page">
      <section className="teacher-editor-placeholder-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> {isNew ? 'Back to Teacher Dashboard' : 'Back to Assigned Course'}</button>
        <div className="teacher-breadcrumb"><span>Teacher Dashboard</span><b>/</b><strong>{isNew ? 'Create Course' : 'Edit Course'}</strong></div>
        <div className="teacher-editor-placeholder-grid">
          <div>
            <div className="teacher-hero-badges"><span className="pill">Course Editor handoff</span><span className="teacher-kicker-badge">KAN-32</span></div>
            <h1>{isNew ? 'Create a new BONSAI course' : `Edit ${course?.title || 'course'}`}</h1>
            <p>This lightweight destination keeps the teacher flow connected. The complete course-editing workflow, fields and save behavior belong to KAN-32.</p>
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
          <div><span className="section-kicker">Editor placeholder</span><h2>{isNew ? 'Blank Course Editor will open here' : 'Course Editor will open here'}</h2><p>No editor fields are invented here. KAN-32 will replace this handoff with the actual editing experience.</p></div>
          <button className="button button-primary" type="button" onClick={onBack}>{isNew ? 'Return to dashboard' : 'Return to course'}</button>
        </div>
      </section>
    </main>
  );
}

function ProgressPlaceholder({ course, onBack }) {
  return (
    <main className="teacher-progress-placeholder-page">
      <section className="teacher-assigned-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Assigned Course</button>
        <div className="teacher-breadcrumb"><span>Teacher Dashboard</span><b>/</b><span>{course.title}</span><b>/</b><strong>Progress & Results</strong></div>
        <div className="teacher-hero-badges"><span className="pill">Progress & Results handoff</span><span className="teacher-kicker-badge">Later teacher task</span></div>
        <h1>Progress & Results</h1>
        <p>Detailed learner progress, results and feedback for <strong>{course.title}</strong> will be implemented in the later progress/results task. KAN-31 only verifies the teacher navigation handoff.</p>
      </section>
      <section className="teacher-assigned-body">
        <div className="teacher-placeholder-wide-card">
          <span className="teacher-placeholder-icon" aria-hidden="true">↗</span>
          <div><span className="section-kicker">Course context preserved</span><h2>{course.learners} prototype learner enrollments</h2><p>The selected course, learner count and teacher context are carried into this handoff without inventing detailed analytics early.</p></div>
          <button className="button button-primary" type="button" onClick={onBack}>Return to course</button>
        </div>
      </section>
    </main>
  );
}

function AssignedCoursePage({ course, onBack, onEdit, onProgress, onPublic }) {
  const currentStatusIndex = workflowStatuses.indexOf(course.status);
  return (
    <main className="teacher-assigned-page">
      <section className="teacher-assigned-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Teacher Dashboard</button>
        <div className="teacher-breadcrumb"><span>Teacher Dashboard</span><b>/</b><strong>{course.title}</strong></div>
        <div className="teacher-assigned-hero-grid">
          <div>
            <div className="teacher-hero-badges"><span className="pill">Assigned course</span>{course.pilot && <span className="pilot-badge">Pilot course</span>}<span className={`teacher-status-chip teacher-status-${course.status.toLowerCase().replaceAll(' ', '-')}`}>{course.status}</span></div>
            <h1>{course.title}</h1>
            <p>Teacher view for this assigned BONSAI course. Learner count and workflow status are prototype/mock data for the current teacher experience.</p>
            <div className="teacher-assigned-actions">
              <button className="button button-primary" type="button" onClick={onEdit}>Edit Course</button>
              <button className="button button-outline" type="button" onClick={onProgress}>Progress & Results</button>
              <button className="button button-ghost" type="button" onClick={onPublic}>View public course</button>
            </div>
          </div>
          <aside className="teacher-assigned-summary" aria-label="Assigned course summary">
            <div><span>Learning area</span><strong>{course.area}</strong></div>
            <div><span>Enrolled learners</span><strong>{course.learners} <small>prototype</small></strong></div>
            <div><span>Course status</span><strong>{course.status}</strong></div>
            <div><span>Teacher</span><strong>Dr. Anna Kontokosta</strong></div>
          </aside>
        </div>
      </section>

      <section className="teacher-assigned-body">
        <div className="teacher-assigned-main">
          <section className="teacher-assigned-card">
            <span className="section-kicker">Course workflow</span>
            <h2>Current publication status</h2>
            <p>The prototype uses the established teacher workflow: Draft → Under Review → Approved → Published.</p>
            <div className="teacher-workflow" aria-label={`Course status: ${course.status}`}>
              {workflowStatuses.map((status, index) => (
                <div key={status} className={`teacher-workflow-step ${index <= currentStatusIndex ? 'teacher-workflow-reached' : ''} ${status === course.status ? 'teacher-workflow-current' : ''}`}>
                  <span>{index < currentStatusIndex ? '✓' : index + 1}</span><strong>{status}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="teacher-assigned-card">
            <span className="section-kicker">Quick links</span>
            <h2>Manage this course</h2>
            <div className="teacher-quick-link-grid">
              <button type="button" onClick={onEdit}><span>✎</span><div><strong>Course Editor</strong><small>Open the KAN-32 editor handoff for this course.</small></div><b>→</b></button>
              <button type="button" onClick={onProgress}><span>↗</span><div><strong>Progress & Results</strong><small>Open the later-task progress/results handoff.</small></div><b>→</b></button>
            </div>
          </section>
        </div>

        <aside className="teacher-assigned-side-card">
          <span className="section-kicker">Learner overview</span>
          <strong className="teacher-assigned-learner-count">{course.learners}</strong>
          <h2>enrolled learners</h2>
          <p>This task shows the assigned-course enrollment count only. Individual learner rows, progress and results are intentionally deferred to later teacher tasks.</p>
          <button className="button button-outline" type="button" onClick={onProgress}>Open Progress & Results</button>
        </aside>
      </section>
    </main>
  );
}

export default function TeacherDashboard({ user, onNavigate }) {
  const [teacherQuery, setTeacherQuery] = useState(readTeacherQuery);
  const totalLearners = useMemo(() => mockTeacherPortfolio.reduce((sum, course) => sum + course.learners, 0), []);
  const learningAreas = useMemo(() => new Set(mockTeacherPortfolio.map((course) => course.area)).size, []);
  const activeSlug = teacherQuery.editor && teacherQuery.editor !== 'new' ? teacherQuery.editor : teacherQuery.course || teacherQuery.progress;
  const selectedCourse = activeSlug ? mockTeacherPortfolio.find((course) => course.slug === activeSlug) : null;

  useEffect(() => {
    const syncQuery = () => setTeacherQuery(readTeacherQuery());
    window.addEventListener('popstate', syncQuery);
    return () => window.removeEventListener('popstate', syncQuery);
  }, []);

  function setWorkspaceQuery(key, value) {
    window.history.pushState({}, '', value ? `/teacher?${key}=${value}` : '/teacher');
    setTeacherQuery(readTeacherQuery());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openEditor(value) { setWorkspaceQuery('editor', value); }
  function openCourse(slug) { setWorkspaceQuery('course', slug); }
  function openProgress(slug) { setWorkspaceQuery('progress', slug); }
  function openDashboard() { setWorkspaceQuery(null, null); }

  if (teacherQuery.editor) {
    return <CourseEditorPlaceholder course={selectedCourse} isNew={teacherQuery.editor === 'new'} onBack={() => teacherQuery.editor === 'new' ? openDashboard() : openCourse(teacherQuery.editor)} />;
  }

  if (teacherQuery.progress && selectedCourse) {
    return <ProgressPlaceholder course={selectedCourse} onBack={() => openCourse(selectedCourse.slug)} />;
  }

  if (teacherQuery.course && selectedCourse) {
    return <AssignedCoursePage course={selectedCourse} onBack={openDashboard} onEdit={() => openEditor(selectedCourse.slug)} onProgress={() => openProgress(selectedCourse.slug)} onPublic={() => onNavigate(`/courses/${selectedCourse.slug}`)} />;
  }

  return (
    <main className="teacher-dashboard-page">
      <section className="teacher-dashboard-hero">
        <div>
          <div className="teacher-hero-badges"><span className="pill">Teacher dashboard</span><span className="teacher-kicker-badge">Prototype workspace</span></div>
          <h1>Welcome, {user?.name}</h1>
          <p>Manage your BONSAI courses and see a simple overview of the learners currently attached to your prototype teaching portfolio.</p>
          <small>Course assignments, workflow statuses and learner counts below are prototype/mock data for the teacher workflow.</small>
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
        <article><span>Pilot courses</span><strong>{mockTeacherPortfolio.filter((course) => course.pilot).length}</strong><small>prototype-only overview metric</small></article>
      </section>

      <section className="teacher-dashboard-content">
        <section className="teacher-courses-panel" aria-labelledby="teacher-courses-heading">
          <div className="teacher-section-heading">
            <div><span className="section-kicker">Course management</span><h2 id="teacher-courses-heading">My Courses</h2><p>Open an assigned course for its status and teacher quick links, edit it directly, or start a new course.</p></div>
            <button className="button button-primary" type="button" onClick={() => openEditor('new')}>+ Create Course</button>
          </div>

          <div className="teacher-course-table" role="table" aria-label="My Courses">
            <div className="teacher-course-table-head" role="row">
              <span role="columnheader">Course</span><span role="columnheader">Track / learning area</span><span role="columnheader">Learners</span><span role="columnheader">Actions</span>
            </div>
            {mockTeacherPortfolio.map((course) => (
              <div className="teacher-course-row" role="row" key={course.slug}>
                <div className="teacher-course-name" role="cell"><div className="teacher-course-icon">{course.pilot ? 'P' : 'C'}</div><div><button className="teacher-course-open" type="button" onClick={() => openCourse(course.slug)}>{course.title}</button>{course.pilot && <span className="pilot-badge">Pilot course</span>}<span className="teacher-row-status">{course.status}</span></div></div>
                <div className="teacher-course-area" role="cell"><span>{course.area}</span></div>
                <div className="teacher-course-learners" role="cell"><strong>{course.learners}</strong><small>prototype learners</small></div>
                <div className="teacher-course-action" role="cell"><button className="button button-primary teacher-row-view" type="button" onClick={() => openCourse(course.slug)}>View</button><button className="button button-outline" type="button" onClick={() => openEditor(course.slug)}>Edit</button></div>
              </div>
            ))}
          </div>
        </section>

        <aside className="teacher-learners-panel">
          <span className="section-kicker">Students overview</span>
          <h2>{totalLearners} learner enrollments</h2>
          <p>This dashboard stays at aggregate level. Open an assigned course for its course-level status and quick links.</p>
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
