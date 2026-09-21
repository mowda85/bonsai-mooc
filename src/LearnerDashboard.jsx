import { useEffect, useState } from 'react';
import LearnerUnitPage from './LearnerUnitPage.jsx';
import LearnerCompletionPage from './LearnerCompletionPage.jsx';
import { BONSAI_CATEGORIES, BONSAI_COURSES, getCourseBySlug, PILOT_COURSE_UNITS } from './courseArchitecture.js';

const ACHIEVEMENT_KEY = 'bonsai-mooc.prototype.category-achievements.v1';

const pilotCourseUnits = PILOT_COURSE_UNITS.map((unit) => ({
  title: unit.title,
  lessons: unit.lessons.length,
}));

function readAchievements() {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(ACHIEVEMENT_KEY) || '{}');
    return { completedCourseSlugs: Array.isArray(parsed.completedCourseSlugs) ? parsed.completedCourseSlugs : [] };
  } catch {
    return { completedCourseSlugs: [] };
  }
}

function writeAchievements(completedCourseSlugs) {
  const next = { completedCourseSlugs: [...new Set(completedCourseSlugs)] };
  try {
    window.sessionStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(next));
  } catch {
    // Keep the learner experience usable when browser storage is restricted.
  }
  window.dispatchEvent(new CustomEvent('bonsai:category-achievements-changed', { detail: next }));
  return next;
}

function categoryProgress(category, completedCourseSlugs) {
  const completedCount = category.courses.filter((course) => completedCourseSlugs.includes(course.slug)).length;
  const totalCount = category.courses.length;
  return {
    completedCount,
    totalCount,
    percent: totalCount ? Math.round((completedCount / totalCount) * 100) : 0,
    specialistEarned: totalCount > 0 && completedCount === totalCount,
  };
}

function LearnerCourseOverview({ course, progress, onBackDashboard, onPublicInfo, onOpenUnit, onOpenCompletion, certificateEarned }) {
  const units = course?.pilot ? pilotCourseUnits : [];
  const completedUnitNumbers = progress.completedUnits || [];
  const totalUnits = progress.totalUnits || units.length;
  const completedCount = completedUnitNumbers.length;
  const percent = totalUnits ? Math.round((completedCount / totalUnits) * 100) : 0;
  const nextUnitNumber = Array.from({ length: totalUnits }, (_, index) => index + 1).find((number) => !completedUnitNumbers.includes(number));
  const duration = course?.duration || 'To be confirmed';

  return (
    <main className="learner-course-overview-page">
      <section className="learner-course-overview-hero">
        <button className="back-link" type="button" onClick={onBackDashboard}><span aria-hidden="true">←</span> Back to learner dashboard</button>
        <div className="learner-course-breadcrumb"><span>Learner dashboard</span><b>/</b><strong>{course?.title}</strong></div>
        <div className="learner-course-overview-hero-grid">
          <div>
            <div className="learner-course-overview-badges"><span className="pill">Enrolled course</span>{course?.pilot && <span className="pilot-badge pilot-badge-large">Pilot course</span>}</div>
            <h1>{course?.title}</h1>
            <p>{course?.description}</p>
            <div className="learner-course-overview-actions">
              {percent >= 100 ? <button className="button button-primary" type="button" onClick={onOpenCompletion}>View completion & certificate →</button> : <button className="button button-primary" type="button" disabled={!nextUnitNumber} onClick={() => nextUnitNumber && onOpenUnit(nextUnitNumber)}>{completedCount ? 'Continue Course →' : 'Start Course →'}</button>}
              <button className="button button-outline" type="button" onClick={onPublicInfo}>Public course information</button>
            </div>
          </div>
          <aside className="learner-course-overview-summary" aria-label={`${course?.title} learner progress summary`}>
            <div><span>Category</span><strong>{course?.category || 'BONSAI course'}</strong></div>
            <div><span>Course type</span><strong>{course?.pilot ? 'Functional pilot course' : 'Independent BONSAI course'}</strong></div>
            <div><span>Duration</span><strong>{duration}</strong></div>
            <div><span>Progress</span><strong>{completedCount} of {totalUnits} units · {percent}%</strong></div>
          </aside>
        </div>
      </section>

      <section className="learner-course-overview-body">
        <div className="learner-course-overview-main">
          <section className="learner-course-progress-banner" aria-label={`Course ${percent}% complete`}>
            <div className="learner-course-progress-heading"><div><span className="section-kicker">Your progress</span><h2>{completedCount} of {totalUnits} units complete</h2></div><strong>{percent}%</strong></div>
            <div className="learner-progress-track"><span style={{ width: `${percent}%` }} /></div>
            <p>{nextUnitNumber ? `Your next step is Unit ${nextUnitNumber}: ${units[nextUnitNumber - 1]?.title || 'Course unit'}.` : certificateEarned ? 'All units are complete and your course certificate has been added to the learner dashboard.' : 'All available units are complete.'}</p>
          </section>

          <section className="learner-enrolled-course-section">
            <span className="section-kicker">About this course</span>
            <h2>Course description</h2>
            <p>{course?.description}</p>
            {course?.pilot && <p>This pilot develops practical understanding of flood-crisis preparedness and response by connecting crisis management, situational awareness, forecasting, flood-defence information, coordination and scenario-based decision-making.</p>}
          </section>

          <section className="learner-enrolled-course-section" aria-labelledby="learner-unit-progress-heading">
            <div className="learner-unit-progress-heading"><div><span className="section-kicker">Course structure</span><h2 id="learner-unit-progress-heading">Units and progress</h2><p>Complete the available course content at your own pace. Course access is controlled only by explicit prerequisites or dependencies when configured.</p></div><span className="course-unit-count">{totalUnits} units</span></div>
            {units.length ? (
              <div className="learner-unit-status-list">
                {units.map((unit, index) => {
                  const unitNumber = index + 1;
                  const completed = completedUnitNumbers.includes(unitNumber);
                  const current = unitNumber === nextUnitNumber;
                  const status = completed ? 'Completed' : current ? 'Current · Continue' : 'Available';
                  return (
                    <article key={unit.title} className={`learner-unit-status-card ${completed ? 'learner-unit-completed' : ''} ${current ? 'learner-unit-current' : ''}`}>
                      <div className="learner-unit-status-number">{completed ? '✓' : unitNumber}</div>
                      <div className="learner-unit-status-copy"><span>Unit {unitNumber}</span><strong>{unit.title}</strong><small>{unit.lessons} lesson{unit.lessons === 1 ? '' : 's'}</small></div>
                      <div className="learner-unit-status-action"><b>{status}</b><button type="button" className={current ? 'button button-primary' : 'button button-outline'} onClick={() => onOpenUnit(unitNumber)}>{completed ? 'Review' : current ? 'Continue' : 'Open'}</button></div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="content-pending"><strong>Course structure being prepared</strong><p>Detailed units have not yet been supplied for this course.</p></div>
            )}
          </section>
        </div>

        <aside className="learner-course-side-panel">
          <span className="section-kicker">Continue learning</span>
          <h2>{nextUnitNumber ? `Unit ${nextUnitNumber} is next` : 'Course complete'}</h2>
          <p>{nextUnitNumber ? units[nextUnitNumber - 1]?.title : 'You have completed all currently available units.'}</p>
          <div className="learner-course-side-percent"><strong>{percent}%</strong><span>course complete</span></div>
          <div className="learner-progress-track"><span style={{ width: `${percent}%` }} /></div>
          {nextUnitNumber ? <button className="button button-primary" type="button" onClick={() => onOpenUnit(nextUnitNumber)}>Continue Course →</button> : <button className="button button-primary" type="button" onClick={onOpenCompletion}>View completion →</button>}
          <button className="button button-outline" type="button" onClick={onBackDashboard}>Back to dashboard</button>
        </aside>
      </section>
    </main>
  );
}

export default function LearnerDashboard({ user, progress, onNavigate }) {
  const [courseProgress, setCourseProgress] = useState(() => ({
    ...progress.currentCourse,
    completedUnits: [...(progress.currentCourse.completedUnits || [])],
  }));
  const [certificates, setCertificates] = useState(() => [...(progress.certificates || [])]);
  const [quizResult, setQuizResult] = useState(progress.currentCourse.quizResult || null);
  const [completedActivityIds, setCompletedActivityIds] = useState(progress.currentCourse.completedActivityIds || []);
  const [achievements, setAchievements] = useState(readAchievements);
  const currentCourse = getCourseBySlug(courseProgress.slug) || BONSAI_COURSES.find((course) => course.pilot) || null;
  const completedUnits = courseProgress.completedUnits.length;
  const totalUnits = courseProgress.totalUnits;
  const remainingUnits = Math.max(totalUnits - completedUnits, 0);
  const currentCoursePercent = totalUnits ? Math.round((completedUnits / totalUnits) * 100) : 0;
  const courseComplete = totalUnits > 0 && completedUnits === totalUnits;
  const certificate = certificates.find((item) => item.courseSlug === courseProgress.slug) || null;
  const completedCourseSlugs = achievements.completedCourseSlugs;
  const completedCourses = BONSAI_COURSES.filter((course) => completedCourseSlugs.includes(course.slug));
  const specialistAwards = BONSAI_CATEGORIES.filter((category) => categoryProgress(category, completedCourseSlugs).specialistEarned);
  const categoriesInProgress = BONSAI_CATEGORIES.filter((category) => {
    const item = categoryProgress(category, completedCourseSlugs);
    return item.completedCount > 0 && !item.specialistEarned;
  });
  const query = new URLSearchParams(window.location.search);
  const initialCourseOpen = query.get('course') === courseProgress.slug;
  const initialUnit = Number(query.get('unit')) || null;
  const initialCompletion = query.get('completion') === '1';
  const [workspaceView, setWorkspaceView] = useState(initialCompletion ? 'completion' : initialUnit ? 'unit' : initialCourseOpen ? 'course' : 'dashboard');
  const [activeUnit, setActiveUnit] = useState(initialUnit);

  useEffect(() => {
    const sync = () => setAchievements(readAchievements());
    window.addEventListener('bonsai:category-achievements-changed', sync);
    return () => window.removeEventListener('bonsai:category-achievements-changed', sync);
  }, []);

  function setLearnerUrl(params = '') {
    window.history.pushState({}, '', `/learner${params}`);
  }

  function openCourseOverview() {
    setLearnerUrl(`?course=${courseProgress.slug}`);
    setActiveUnit(null);
    setWorkspaceView('course');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openUnit(unitNumber) {
    setLearnerUrl(`?course=${courseProgress.slug}&unit=${unitNumber}`);
    setActiveUnit(unitNumber);
    setWorkspaceView('unit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openCompletion() {
    if (!courseComplete) return;
    setLearnerUrl(`?course=${courseProgress.slug}&completion=1`);
    setActiveUnit(null);
    setWorkspaceView('completion');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function completeActivity(activityId) {
    setCompletedActivityIds((current) => current.includes(activityId) ? current : [...current, activityId]);
  }

  function recordQuizResult(result) {
    if (!result?.unitNumber || result.unitNumber === 1) setQuizResult(result);
  }

  function completeUnit(unitNumber) {
    if (courseProgress.completedUnits.includes(unitNumber)) return;
    const nextCompletedUnits = [...courseProgress.completedUnits, unitNumber].sort((a, b) => a - b);
    const nextProgress = { ...courseProgress, completedUnits: nextCompletedUnits };
    setCourseProgress(nextProgress);

    if (nextCompletedUnits.length === courseProgress.totalUnits) {
      const earnedCertificate = {
        id: `certificate-${courseProgress.slug}`,
        courseSlug: courseProgress.slug,
        name: `BONSAI Course Certificate — ${currentCourse?.title || 'BONSAI course'}`,
        source: currentCourse?.title || 'BONSAI-MOOC',
      };
      setCertificates((current) => current.some((item) => item.courseSlug === courseProgress.slug) ? current : [...current, earnedCertificate]);
      const nextAchievements = writeAchievements([...readAchievements().completedCourseSlugs, courseProgress.slug]);
      setAchievements(nextAchievements);
      setLearnerUrl(`?course=${courseProgress.slug}&completion=1`);
      setActiveUnit(null);
      setWorkspaceView('completion');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function backToDashboard() {
    setLearnerUrl('');
    setActiveUnit(null);
    setWorkspaceView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (workspaceView === 'completion' && courseComplete) {
    const completionCertificate = certificate || {
      id: `certificate-${courseProgress.slug}`,
      courseSlug: courseProgress.slug,
      name: `BONSAI Course Certificate — ${currentCourse?.title || 'BONSAI course'}`,
      source: currentCourse?.title || 'BONSAI-MOOC',
    };
    return <LearnerCompletionPage user={user} course={currentCourse} progress={courseProgress} quizResult={quizResult} certificate={completionCertificate} onCourseOverview={openCourseOverview} onDashboard={backToDashboard} />;
  }

  if (workspaceView === 'unit') {
    return <LearnerUnitPage course={currentCourse} unitNumber={activeUnit || 1} completedUnits={courseProgress.completedUnits} completedActivityIds={completedActivityIds} onCompleteActivity={completeActivity} onCompleteUnit={completeUnit} onQuizSubmitted={recordQuizResult} onBack={openCourseOverview} onOpenUnit={openUnit} />;
  }

  if (workspaceView === 'course') {
    return <LearnerCourseOverview course={currentCourse} progress={courseProgress} onBackDashboard={backToDashboard} onPublicInfo={() => onNavigate(`/courses/${courseProgress.slug}`)} onOpenUnit={openUnit} onOpenCompletion={openCompletion} certificateEarned={Boolean(certificate)} />;
  }

  return (
    <main className="learner-dashboard-page learner-dashboard-category-model">
      <section className="learner-dashboard-hero">
        <div><span className="pill">Learner dashboard</span><h1>Welcome back, {user.name.split(' ')[0]}</h1><p>Take any BONSAI course directly and build progress toward Specialist Certificates across the five Categories.</p></div>
        <div className="learner-dashboard-hero-actions"><button className="button button-outline" type="button" onClick={() => onNavigate('/')}>View Categories</button><button className="button button-primary" type="button" onClick={() => onNavigate('/courses')}>Browse courses</button></div>
      </section>

      <section className="learner-overview" aria-label="Learning overview">
        <div className="learner-overview-stat"><span>Current course</span><strong>{currentCoursePercent}%</strong><small>{completedUnits} of {totalUnits} units complete</small></div>
        <div className="learner-overview-stat"><span>Course certificates</span><strong>{completedCourses.length}</strong><small>one per completed course</small></div>
        <div className="learner-overview-stat"><span>Specialist Certificates</span><strong>{specialistAwards.length}</strong><small>one per completed Category</small></div>
        <div className="learner-overview-stat"><span>Categories in progress</span><strong>{categoriesInProgress.length}</strong><small>based on completed courses</small></div>
      </section>

      <section className="learner-primary-grid learner-primary-grid-open-access">
        <article className="learner-dashboard-card current-course-dashboard-card">
          <div className="learner-card-heading"><div><span className="section-kicker">{courseComplete ? 'Completed course' : 'Continue learning'}</span><h2>Current course</h2></div>{currentCourse?.pilot && <span className="pilot-badge">Pilot course</span>}</div>
          <span className="learner-course-area">{currentCourse?.category || 'BONSAI course'}</span><h3>{currentCourse?.title || 'Course'}</h3><p>{currentCourse?.description}</p>
          <div className="learner-unit-progress"><div><strong>{completedUnits}/{totalUnits}</strong><span>units complete</span></div><div><strong>{remainingUnits}</strong><span>units left</span></div></div>
          <div className="learner-progress-track" aria-label={`Current course ${currentCoursePercent}% complete`}><span style={{ width: `${currentCoursePercent}%` }} /></div>
          <div className="current-course-actions"><button className="button button-primary" type="button" onClick={courseComplete ? openCompletion : openCourseOverview}>{courseComplete ? 'View completion & certificate →' : 'Continue course →'}</button><button className="button button-outline" type="button" onClick={() => onNavigate(`/courses/${courseProgress.slug}`)}>Course information</button></div>
        </article>

        <article className="learner-dashboard-card current-course-dashboard-card">
          <div className="learner-card-heading"><div><span className="section-kicker">Open access</span><h2>Choose your next course</h2></div><span className="pilot-badge">5 Categories</span></div>
          <p>You are not required to finish one Category before studying another. Browse any course and enroll directly unless that specific course later receives a required prerequisite or dependency.</p>
          <div className="current-course-actions"><button className="button button-primary" type="button" onClick={() => onNavigate('/courses')}>Browse all courses →</button><button className="button button-outline" type="button" onClick={() => onNavigate('/')}>Explore Categories</button></div>
        </article>
      </section>

      <section className="learner-dashboard-section" aria-labelledby="learner-categories-heading">
        <div className="learner-section-heading"><div><span className="section-kicker">Specialist pathways</span><h2 id="learner-categories-heading">Progress by Category</h2><p>Each completed course contributes to its Category. Complete every course in a Category to earn its Specialist Certificate.</p></div><span className="unlock-status unlock-status-open">Open course access</span></div>
        <div className="category-v2-dashboard-category-grid">{BONSAI_CATEGORIES.map((category) => {
          const item = categoryProgress(category, completedCourseSlugs);
          return <button type="button" key={category.slug} onClick={() => onNavigate(`/categories/${category.slug}`)}><div><strong>{category.name}</strong><span>{item.completedCount}/{item.totalCount} courses</span></div><div className="category-v2-progress"><span style={{ width: `${item.percent}%` }} /></div><small>{item.specialistEarned ? '✓ Specialist Certificate earned' : `${item.percent}% toward Specialist Certificate`}</small></button>;
        })}</div>
      </section>

      <section className="learner-dashboard-section learner-achievements-section" aria-labelledby="learner-achievements-heading">
        <div className="learner-section-heading"><div><span className="section-kicker">Your progress</span><h2 id="learner-achievements-heading">Achievements & certificates</h2><p>Each completed course earns a course badge/certificate. Completing every course in one Category earns a Specialist Certificate.</p></div></div>
        {completedCourses.length || specialistAwards.length ? <div className="learner-certificate-grid">{completedCourses.map((course) => <article key={course.slug} className="learner-certificate-card"><span>Course certificate</span><strong>BONSAI Course Certificate — {course.title}</strong><p>{course.category}</p>{course.slug === courseProgress.slug && courseComplete && <button className="button button-outline" type="button" onClick={openCompletion}>View certificate →</button>}</article>)}{specialistAwards.map((category) => <article key={category.slug} className="learner-certificate-card"><span>Specialist Certificate</span><strong>{category.specialistCertificate}</strong><p>All courses completed in {category.name}</p></article>)}</div> : <div className="learner-empty-achievement"><span aria-hidden="true">◇</span><div><strong>No certificates earned yet</strong><p>Complete any BONSAI course to earn your first course badge/certificate.</p></div></div>}
      </section>
    </main>
  );
}
