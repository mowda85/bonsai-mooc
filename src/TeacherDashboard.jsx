import { useEffect, useMemo, useState } from 'react';
import TeacherCourseEditor from './TeacherCourseEditor.jsx';
import TeacherUnitEditor from './TeacherUnitEditor.jsx';
import TeacherActivityEditor from './TeacherActivityEditor.jsx';
import TeacherQuizEditor from './TeacherQuizEditor.jsx';
import { getPrototypeActivity, savePrototypeActivity } from './prototypeActivityStore.js';
import { getPrototypeQuiz, savePrototypeQuiz } from './prototypeQuizStore.js';
import {
  PILOT_COURSE_SLUG,
  PILOT_COURSE_TITLE,
  PILOT_COURSE_DESCRIPTION,
  PILOT_COURSE_OBJECTIVES,
  PILOT_COURSE_UNITS,
} from './courseArchitecture.js';

const pilotUnits = PILOT_COURSE_UNITS.map((unit) => ({ ...unit, source: 'pilot' }));

export const mockTeacherPortfolio = [
  {
    slug: PILOT_COURSE_SLUG,
    title: PILOT_COURSE_TITLE,
    area: 'Crisis Management',
    areas: ['Crisis Management'],
    description: PILOT_COURSE_DESCRIPTION,
    objectives: PILOT_COURSE_OBJECTIVES,
    draftFolder: '',
    author: 'Dr. Anna Kontokosta',
    coAuthors: [],
    learners: 24,
    status: 'Published',
    pilot: true,
    units: pilotUnits,
  },
  {
    slug: 'dike-stability-lagrangian-numerical-modelling',
    title: 'Dike Stability: Lagrangian Methods and Numerical Modeling',
    area: 'Erosion',
    areas: ['Erosion'],
    description: '',
    objectives: [],
    draftFolder: '',
    author: 'Dr. Anna Kontokosta',
    coAuthors: [],
    learners: 14,
    status: 'Under Review',
    units: [],
  },
  {
    slug: 'vegetation-management',
    title: 'Vegetation and Management',
    area: 'Vegetation / Biodiversity',
    areas: ['Vegetation / Biodiversity'],
    description: '',
    objectives: [],
    draftFolder: '',
    author: 'Dr. Anna Kontokosta',
    coAuthors: [],
    learners: 11,
    status: 'Draft',
    units: [],
  },
  {
    slug: 'flood-risk-management-preparedness',
    title: 'Flood Risk Management / Preparedness',
    area: 'Crisis Management',
    areas: ['Crisis Management'],
    description: '',
    objectives: [],
    draftFolder: '',
    author: 'Dr. Anna Kontokosta',
    coAuthors: [],
    learners: 18,
    status: 'Approved',
    units: [],
  },
];

const workflowStatuses = ['Draft', 'Under Review', 'Approved', 'Published'];

function readTeacherQuery() {
  const query = new URLSearchParams(window.location.search);
  return {
    editor: query.get('editor'),
    course: query.get('course'),
    progress: query.get('progress'),
    unit: query.get('unit'),
    activity: query.get('activity'),
    quiz: query.get('quiz'),
  };
}

function categoryLabel(course) {
  const values = course.areas?.length ? course.areas : course.area ? [course.area] : [];
  if (values.length) return values.join(' · ');
  return course.draftFolder ? `Unassigned draft · ${course.draftFolder}` : 'Unassigned draft';
}

function ProgressPlaceholder({ course, onBack }) {
  return (
    <main className="teacher-progress-placeholder-page">
      <section className="teacher-assigned-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Assigned Course</button>
        <div className="teacher-breadcrumb"><span>Teacher Dashboard</span><b>/</b><span>{course.title}</span><b>/</b><strong>Progress & Results</strong></div>
        <div className="teacher-hero-badges"><span className="pill">Progress & Results handoff</span><span className="teacher-kicker-badge">Later teacher task</span></div>
        <h1>Progress & Results</h1>
        <p>Detailed learner progress, results and feedback for <strong>{course.title}</strong> will be implemented in the later progress/results task. This page only verifies the teacher navigation handoff.</p>
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

function AssignedCoursePage({ course, onBack, onEdit, onProgress, onPublic, onAddUnit, onActivity, onQuiz }) {
  const currentStatusIndex = workflowStatuses.indexOf(course.status);
  const units = course.units || [];
  return (
    <main className="teacher-assigned-page">
      <section className="teacher-assigned-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Teacher Dashboard</button>
        <div className="teacher-breadcrumb"><span>Teacher Dashboard</span><b>/</b><strong>{course.title}</strong></div>
        <div className="teacher-assigned-hero-grid">
          <div>
            <div className="teacher-hero-badges"><span className="pill">Assigned course</span>{course.pilot && <span className="pilot-badge">Pilot course</span>}<span className={`teacher-status-chip teacher-status-${course.status.toLowerCase().replaceAll(' ', '-')}`}>{course.status}</span></div>
            <h1>{course.title}</h1>
            <p>Teacher view for this assigned BONSAI course. Category assignment does not create an access lock; course access is controlled only by explicit prerequisites or dependencies.</p>
            <div className="teacher-assigned-actions">
              <button className="button button-primary" type="button" onClick={onEdit}>Edit Course</button>
              <button className="button button-outline" type="button" onClick={onAddUnit}>+ Add Unit</button>
              <button className="button button-outline" type="button" onClick={onProgress}>Progress & Results</button>
              <button className="button button-ghost" type="button" onClick={onPublic}>View public course</button>
            </div>
          </div>
          <aside className="teacher-assigned-summary" aria-label="Assigned course summary">
            <div><span>Category</span><strong>{categoryLabel(course)}</strong></div>
            {course.draftFolder && <div><span>Draft folder</span><strong>{course.draftFolder}</strong></div>}
            <div><span>Units</span><strong>{units.length}</strong></div>
            <div><span>Enrolled learners</span><strong>{course.learners} <small>prototype</small></strong></div>
            <div><span>Course status</span><strong>{course.status}</strong></div>
            <div><span>Primary author</span><strong>{course.author || 'Dr. Anna Kontokosta'}</strong></div>
            <div><span>Co-authors</span><strong>{course.coAuthors?.length ? course.coAuthors.join(', ') : 'None'}</strong></div>
          </aside>
        </div>
      </section>

      <section className="teacher-assigned-body">
        <div className="teacher-assigned-main">
          <section className="teacher-assigned-card">
            <div className="teacher-course-unit-header">
              <div><span className="section-kicker">Units & content</span><h2>Course units</h2><p>Build and organize the unit-level structure for this course.</p></div>
              <button className="button button-primary" type="button" onClick={onAddUnit}>+ Add Unit</button>
            </div>
            {units.length ? <div className="teacher-course-units">{units.map((unit, index) => {
              const activity = getPrototypeActivity(course.slug, unit.id);
              const quiz = getPrototypeQuiz(course.slug, unit.id);
              return (
                <div className="teacher-course-unit-row" key={unit.id || `${unit.title}-${index}`}>
                  <span>{index + 1}</span>
                  <div><strong>{unit.title}</strong><small>{unit.source === 'pilot' ? 'Established pilot structure' : unit.file ? `Teacher-created unit · ${unit.file.name}` : 'Teacher-created unit'}</small></div>
                  <div className="teacher-course-unit-actions">
                    <em>{unit.source === 'pilot' ? 'Existing' : 'Saved'}</em>
                    <button className="teacher-unit-activity-link" type="button" onClick={() => onActivity(unit.id)}>{activity ? 'Edit Activity' : 'Add Activity'}</button>
                    <button className="teacher-unit-quiz-link" type="button" onClick={() => onQuiz(unit.id)}>{quiz ? 'Edit Quiz' : 'Add Quiz'}</button>
                  </div>
                </div>
              );
            })}</div> : <div className="teacher-course-unit-empty">No units have been added to this course yet. Use Add Unit to create the first one.</div>}
          </section>

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
              <button type="button" onClick={onEdit}><span>✎</span><div><strong>Course Editor</strong><small>Edit metadata, authors, Category assignment and prerequisites/dependencies.</small></div><b>→</b></button>
              <button type="button" onClick={onAddUnit}><span>＋</span><div><strong>Unit / Content Editor</strong><small>Create unit content and assign it to one or more courses.</small></div><b>→</b></button>
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

function slugify(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new-course';
}

export default function TeacherDashboard({ user, onNavigate }) {
  const [teacherQuery, setTeacherQuery] = useState(readTeacherQuery);
  const [portfolio, setPortfolio] = useState(mockTeacherPortfolio);
  const totalLearners = useMemo(() => portfolio.reduce((sum, course) => sum + course.learners, 0), [portfolio]);
  const categoryCount = useMemo(() => new Set(portfolio.flatMap((course) => course.areas?.length ? course.areas : course.area ? [course.area] : []).filter(Boolean)).size, [portfolio]);
  const activeSlug = teacherQuery.editor && teacherQuery.editor !== 'new' ? teacherQuery.editor : teacherQuery.course || teacherQuery.progress;
  const selectedCourse = activeSlug ? portfolio.find((course) => course.slug === activeSlug) : null;

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
  function openUnitEditor(courseSlug) {
    window.history.pushState({}, '', `/teacher?unit=new&course=${courseSlug}`);
    setTeacherQuery(readTeacherQuery());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function openActivityEditor(courseSlug, unitId) {
    window.history.pushState({}, '', `/teacher?activity=${unitId}&course=${courseSlug}`);
    setTeacherQuery(readTeacherQuery());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function openQuizEditor(courseSlug, unitId) {
    window.history.pushState({}, '', `/teacher?quiz=${unitId}&course=${courseSlug}`);
    setTeacherQuery(readTeacherQuery());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function saveCourseDraft(data) {
    const isNew = teacherQuery.editor === 'new';
    let savedCourse;
    if (isNew) {
      const baseSlug = slugify(data.title);
      let slug = baseSlug;
      let suffix = 2;
      while (portfolio.some((course) => course.slug === slug)) { slug = `${baseSlug}-${suffix}`; suffix += 1; }
      savedCourse = { ...data, slug, area: data.areas[0] || '', learners: 0, status: 'Draft', pilot: false, units: [] };
      setPortfolio((current) => [...current, savedCourse]);
    } else {
      savedCourse = { ...selectedCourse, ...data, area: data.areas[0] || '', status: 'Draft', units: selectedCourse?.units || [] };
      setPortfolio((current) => current.map((course) => course.slug === selectedCourse.slug ? savedCourse : course));
    }
    window.history.pushState({}, '', `/teacher?course=${savedCourse.slug}`);
    setTeacherQuery(readTeacherQuery());
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return savedCourse;
  }

  function saveUnit(data) {
    const allExistingUnits = portfolio.flatMap((course) => course.units || []);
    const baseId = slugify(data.title);
    let id = baseId;
    let suffix = 2;
    while (allExistingUnits.some((unit) => unit.id === id)) { id = `${baseId}-${suffix}`; suffix += 1; }
    const savedUnit = { ...data, id, source: 'teacher' };
    setPortfolio((current) => current.map((course) => data.assignedCourseSlugs.includes(course.slug)
      ? { ...course, units: [...(course.units || []), savedUnit] }
      : course));
    const destination = data.assignedCourseSlugs[0];
    window.history.pushState({}, '', `/teacher?course=${destination}`);
    setTeacherQuery({ editor: null, course: destination, progress: null, unit: null, activity: null, quiz: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return savedUnit;
  }

  function saveActivity(data) {
    const savedActivity = savePrototypeActivity(data);
    const destination = data.courseSlug;
    window.history.pushState({}, '', `/teacher?course=${destination}`);
    setTeacherQuery({ editor: null, course: destination, progress: null, unit: null, activity: null, quiz: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return savedActivity;
  }

  function saveQuiz(data) {
    const savedQuiz = savePrototypeQuiz(data);
    const destination = data.courseSlug;
    window.history.pushState({}, '', `/teacher?course=${destination}`);
    setTeacherQuery({ editor: null, course: destination, progress: null, unit: null, activity: null, quiz: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return savedQuiz;
  }

  if (teacherQuery.quiz) {
    return <TeacherQuizEditor portfolio={portfolio} initialCourseSlug={teacherQuery.course || ''} initialUnitId={teacherQuery.quiz} onSave={saveQuiz} onBack={() => teacherQuery.course ? openCourse(teacherQuery.course) : openDashboard()} />;
  }

  if (teacherQuery.activity) {
    return <TeacherActivityEditor portfolio={portfolio} initialCourseSlug={teacherQuery.course || ''} initialUnitId={teacherQuery.activity} onSave={saveActivity} onBack={() => teacherQuery.course ? openCourse(teacherQuery.course) : openDashboard()} />;
  }

  if (teacherQuery.unit === 'new') {
    return <TeacherUnitEditor portfolio={portfolio} initialCourseSlug={teacherQuery.course || ''} onSave={saveUnit} onBack={() => teacherQuery.course ? openCourse(teacherQuery.course) : openDashboard()} />;
  }

  if (teacherQuery.editor) {
    const isNew = teacherQuery.editor === 'new';
    return <TeacherCourseEditor course={selectedCourse} isNew={isNew} authorName={user?.name || ''} onSave={saveCourseDraft} onBack={() => isNew ? openDashboard() : openCourse(teacherQuery.editor)} />;
  }

  if (teacherQuery.progress && selectedCourse) {
    return <ProgressPlaceholder course={selectedCourse} onBack={() => openCourse(selectedCourse.slug)} />;
  }

  if (teacherQuery.course && selectedCourse) {
    return <AssignedCoursePage course={selectedCourse} onBack={openDashboard} onEdit={() => openEditor(selectedCourse.slug)} onAddUnit={() => openUnitEditor(selectedCourse.slug)} onActivity={(unitId) => openActivityEditor(selectedCourse.slug, unitId)} onQuiz={(unitId) => openQuizEditor(selectedCourse.slug, unitId)} onProgress={() => openProgress(selectedCourse.slug)} onPublic={() => onNavigate(`/courses/${selectedCourse.slug}`)} />;
  }

  return (
    <main className="teacher-dashboard-page">
      <section className="teacher-dashboard-hero">
        <div>
          <div className="teacher-hero-badges"><span className="pill">Teacher dashboard</span><span className="teacher-kicker-badge">Category model</span></div>
          <h1>Welcome, {user?.name}</h1>
          <p>Manage BONSAI courses, assign them to official Categories, and configure prerequisites or dependencies only when a course genuinely requires them.</p>
          <small>Course assignments, workflow statuses and learner counts below are prototype/mock data for the teacher workflow.</small>
        </div>
        <div className="teacher-dashboard-hero-actions">
          <button className="button button-outline" type="button" onClick={() => onNavigate('/')}>Homepage</button>
          <button className="button button-primary" type="button" onClick={() => openEditor('new')}>+ Create Course</button>
        </div>
      </section>

      <section className="teacher-overview" aria-label="Teacher overview">
        <article><span>My courses</span><strong>{portfolio.length}</strong><small>prototype teaching portfolio</small></article>
        <article><span>Learners</span><strong>{totalLearners}</strong><small>aggregate mock enrollments</small></article>
        <article><span>Categories</span><strong>{categoryCount}</strong><small>official course Categories in this portfolio</small></article>
        <article><span>Pilot courses</span><strong>{portfolio.filter((course) => course.pilot).length}</strong><small>Flood Crisis Management in Estuarine Areas</small></article>
      </section>

      <section className="teacher-dashboard-content">
        <section className="teacher-courses-panel" aria-labelledby="teacher-courses-heading">
          <div className="teacher-section-heading">
            <div><span className="section-kicker">Course management</span><h2 id="teacher-courses-heading">My Courses</h2><p>Open an assigned course for its status and teacher tools, edit it directly, or start a new course.</p></div>
            <button className="button button-primary" type="button" onClick={() => openEditor('new')}>+ Create Course</button>
          </div>

          <div className="teacher-course-table" role="table" aria-label="My Courses">
            <div className="teacher-course-table-head" role="row">
              <span role="columnheader">Course</span><span role="columnheader">Category</span><span role="columnheader">Learners</span><span role="columnheader">Actions</span>
            </div>
            {portfolio.map((course) => (
              <div className="teacher-course-row" role="row" key={course.slug}>
                <div className="teacher-course-name" role="cell"><div className="teacher-course-icon">{course.pilot ? 'P' : 'C'}</div><div><button className="teacher-course-open" type="button" onClick={() => openCourse(course.slug)}>{course.title}</button>{course.pilot && <span className="pilot-badge">Pilot course</span>}<span className="teacher-row-status">{course.status}</span></div></div>
                <div className="teacher-course-area" role="cell"><span>{categoryLabel(course)}</span></div>
                <div className="teacher-course-learners" role="cell"><strong>{course.learners}</strong><small>prototype learners</small></div>
                <div className="teacher-course-action" role="cell"><button className="button button-primary teacher-row-view" type="button" onClick={() => openCourse(course.slug)}>View</button><button className="button button-outline" type="button" onClick={() => openEditor(course.slug)}>Edit</button></div>
              </div>
            ))}
          </div>
        </section>

        <aside className="teacher-learners-panel">
          <span className="section-kicker">Students overview</span>
          <h2>{totalLearners} learner enrollments</h2>
          <p>This dashboard stays at aggregate level. Open an assigned course for course-level status, Category assignment, content editing and prerequisites/dependencies.</p>
          <div className="teacher-learner-breakdown">
            {portfolio.map((course) => (
              <div key={course.slug}><div><strong>{course.title}</strong><span>{course.learners}</span></div><div className="teacher-count-track"><span style={{ width: `${Math.round((course.learners / Math.max(...portfolio.map((item) => item.learners), 1)) * 100)}%` }} /></div></div>
            ))}
          </div>
          <button className="button button-outline" type="button" onClick={() => onNavigate('/courses')}>View public course catalogue</button>
        </aside>
      </section>
    </main>
  );
}
