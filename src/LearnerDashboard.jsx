import { useState } from 'react';
import LearnerUnitPage from './LearnerUnitPage.jsx';
import LearnerCompletionPage from './LearnerCompletionPage.jsx';

const pilotCourseUnits = [
  { title: 'Introduction to Data, Information and Knowledge', lessons: 3 },
  { title: 'Information Systems in BONSAI', lessons: 2 },
  { title: 'Knowledge Dissemination in BONSAI', lessons: 1 },
];

function LearnerCourseOverview({ course, progress, onBackDashboard, onPublicInfo, onOpenUnit, onOpenCompletion, certificateEarned }) {
  const units = course?.pilot ? pilotCourseUnits : [];
  const completedUnitNumbers = progress.completedUnits || [];
  const totalUnits = progress.totalUnits || units.length;
  const completedCount = completedUnitNumbers.length;
  const percent = totalUnits ? Math.round((completedCount / totalUnits) * 100) : 0;
  const nextUnitNumber = Array.from({ length: totalUnits }, (_, index) => index + 1).find((number) => !completedUnitNumbers.includes(number));
  const duration = course?.pilot ? '2–3 hours' : 'To be confirmed';

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
            <div><span>Learning area</span><strong>{course?.area || 'Foundation'}</strong></div>
            <div><span>Course type</span><strong>{course?.areaKind === 'foundation' ? 'Foundation · Required' : 'Specialization'}</strong></div>
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
            <p>{nextUnitNumber ? `Your next step is Unit ${nextUnitNumber}: ${units[nextUnitNumber - 1]?.title || 'Course unit'}.` : certificateEarned ? 'All units are complete and your course-completion certificate has been added to the learner dashboard.' : 'All available units are complete.'}</p>
          </section>

          <section className="learner-enrolled-course-section">
            <span className="section-kicker">About this course</span>
            <h2>Course description</h2>
            <p>{course?.description}</p>
            {course?.pilot && <p>This pilot course introduces data, information and knowledge, the BONSAI information-system context, and knowledge dissemination in BONSAI.</p>}
          </section>

          <section className="learner-enrolled-course-section" aria-labelledby="learner-unit-progress-heading">
            <div className="learner-unit-progress-heading"><div><span className="section-kicker">Course structure</span><h2 id="learner-unit-progress-heading">Units and progress</h2><p>Your unit status is calculated from the learner progress data used by the dashboard.</p></div><span className="course-unit-count">{totalUnits} units</span></div>
            {units.length ? (
              <div className="learner-unit-status-list">
                {units.map((unit, index) => {
                  const unitNumber = index + 1;
                  const completed = completedUnitNumbers.includes(unitNumber);
                  const current = unitNumber === nextUnitNumber;
                  const status = completed ? 'Completed' : current ? 'Current · Continue' : 'Upcoming';
                  return (
                    <article key={unit.title} className={`learner-unit-status-card ${completed ? 'learner-unit-completed' : ''} ${current ? 'learner-unit-current' : ''}`}>
                      <div className="learner-unit-status-number">{completed ? '✓' : unitNumber}</div>
                      <div className="learner-unit-status-copy"><span>Unit {unitNumber}</span><strong>{unit.title}</strong><small>{unit.lessons} lesson{unit.lessons === 1 ? '' : 's'}</small></div>
                      <div className="learner-unit-status-action"><b>{status}</b><button type="button" className={current ? 'button button-primary' : 'button button-outline'} onClick={() => onOpenUnit(unitNumber)}>{completed ? 'Review' : current ? 'Continue' : 'Preview'}</button></div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="content-pending"><strong>Course structure being prepared</strong><p>Detailed units have not yet been supplied for this enrolled course.</p></div>
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

export default function LearnerDashboard({
  user,
  foundationCourses,
  completedFoundationCourses,
  foundationComplete,
  specializationTracks,
  enrolledTrackSlugs,
  progress,
  allCourses,
  onNavigate,
}) {
  const [courseProgress, setCourseProgress] = useState(() => ({
    ...progress.currentCourse,
    completedUnits: [...(progress.currentCourse.completedUnits || [])],
  }));
  const [certificates, setCertificates] = useState(() => [...(progress.certificates || [])]);
  const [quizResult, setQuizResult] = useState(progress.currentCourse.quizResult || null);
  const [completedActivityIds, setCompletedActivityIds] = useState(progress.currentCourse.completedActivityIds || []);
  const completedFoundationCount = completedFoundationCourses.length;
  const foundationPercent = foundationCourses.length ? Math.round((completedFoundationCount / foundationCourses.length) * 100) : 0;
  const currentCourse = allCourses.find((course) => course.slug === courseProgress.slug);
  const completedUnits = courseProgress.completedUnits.length;
  const totalUnits = courseProgress.totalUnits;
  const remainingUnits = Math.max(totalUnits - completedUnits, 0);
  const currentCoursePercent = totalUnits ? Math.round((completedUnits / totalUnits) * 100) : 0;
  const courseComplete = totalUnits > 0 && completedUnits === totalUnits;
  const certificate = certificates.find((item) => item.courseSlug === courseProgress.slug) || null;
  const query = new URLSearchParams(window.location.search);
  const initialCourseOpen = query.get('course') === courseProgress.slug;
  const initialUnit = Number(query.get('unit')) || null;
  const initialCompletion = query.get('completion') === '1';
  const [workspaceView, setWorkspaceView] = useState(initialCompletion ? 'completion' : initialUnit ? 'unit' : initialCourseOpen ? 'course' : 'dashboard');
  const [activeUnit, setActiveUnit] = useState(initialUnit);

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
    setQuizResult(result);
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
        name: `Certificate of Completion — ${currentCourse?.title || 'BONSAI course'}`,
        source: currentCourse?.title || 'BONSAI-MOOC',
      };
      setCertificates((current) => current.some((item) => item.courseSlug === courseProgress.slug) ? current : [...current, earnedCertificate]);
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
      name: `Certificate of Completion — ${currentCourse?.title || 'BONSAI course'}`,
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
    <main className="learner-dashboard-page">
      <section className="learner-dashboard-hero">
        <div><span className="pill">Learner dashboard</span><h1>Welcome back, {user.name.split(' ')[0]}</h1><p>Follow your required Foundation progress, continue your current course and see when BONSAI specialization pathways become available.</p></div>
        <div className="learner-dashboard-hero-actions"><button className="button button-outline" type="button" onClick={() => onNavigate('/')}>Homepage</button><button className="button button-primary" type="button" onClick={() => onNavigate('/courses')}>Browse courses</button></div>
      </section>

      <section className="learner-overview" aria-label="Learning overview">
        <div className="learner-overview-stat"><span>Foundation</span><strong>{foundationPercent}%</strong><small>{completedFoundationCount} of {foundationCourses.length} courses complete</small></div>
        <div className="learner-overview-stat"><span>Current course</span><strong>{currentCoursePercent}%</strong><small>{completedUnits} of {totalUnits} units complete</small></div>
        <div className="learner-overview-stat"><span>Specializations</span><strong>{enrolledTrackSlugs.length}</strong><small>{foundationComplete ? 'enrolled so far' : 'locked until Foundation is complete'}</small></div>
        <div className="learner-overview-stat"><span>Certificates</span><strong>{certificates.length}</strong><small>{certificates.length ? 'earned' : 'none earned yet'}</small></div>
      </section>

      <section className="learner-primary-grid">
        <article className="learner-dashboard-card foundation-dashboard-card">
          <div className="learner-card-heading"><div><span className="section-kicker">Step 1 · Required</span><h2>Foundation progress</h2></div><strong className="learner-card-percent">{foundationPercent}%</strong></div>
          <div className="learner-progress-track" aria-label={`Foundation ${foundationPercent}% complete`}><span style={{ width: `${foundationPercent}%` }} /></div>
          <p>{completedFoundationCount} of {foundationCourses.length} Foundation courses are complete. All four are required before specialization enrollment unlocks.</p>
          <div className="learner-foundation-list">{foundationCourses.map((course) => { const complete = completedFoundationCourses.includes(course.slug); return <button key={course.slug} type="button" onClick={() => onNavigate(`/courses/${course.slug}`)}><span className={complete ? 'learner-check learner-check-done' : 'learner-check'}>{complete ? '✓' : '○'}</span><strong>{course.title}</strong><small>{complete ? 'Completed' : 'To complete'}</small></button>; })}</div>
          <button className="button button-primary" type="button" onClick={() => onNavigate('/foundation')}>{foundationComplete ? 'Review Foundation' : 'Continue Foundation'} →</button>
        </article>

        <article className="learner-dashboard-card current-course-dashboard-card">
          <div className="learner-card-heading"><div><span className="section-kicker">{courseComplete ? 'Completed course' : 'Continue learning'}</span><h2>Current course</h2></div><span className="pilot-badge">Pilot course</span></div>
          <span className="learner-course-area">{currentCourse?.area || 'Foundation'}</span><h3>{currentCourse?.title || 'Course'}</h3><p>{currentCourse?.description}</p>
          <div className="learner-unit-progress"><div><strong>{completedUnits}/{totalUnits}</strong><span>units complete</span></div><div><strong>{remainingUnits}</strong><span>units left</span></div></div>
          <div className="learner-progress-track" aria-label={`Current course ${currentCoursePercent}% complete`}><span style={{ width: `${currentCoursePercent}%` }} /></div>
          <div className="current-course-actions"><button className="button button-primary" type="button" onClick={courseComplete ? openCompletion : openCourseOverview}>{courseComplete ? 'View completion & certificate →' : 'Continue course →'}</button><button className="button button-outline" type="button" onClick={() => onNavigate(`/courses/${courseProgress.slug}`)}>Public course information</button></div>
        </article>
      </section>

      <section className="learner-dashboard-section" aria-labelledby="learner-specializations-heading">
        <div className="learner-section-heading"><div><span className="section-kicker">Step 2 · Specialize</span><h2 id="learner-specializations-heading">My specializations</h2><p>{foundationComplete ? 'Your specialization pathways are unlocked. Enrolled tracks appear here immediately.' : 'Explore what comes next. Enrollment stays locked until your Foundation progress reaches 100%.'}</p></div><span className={`unlock-status ${foundationComplete ? 'unlock-status-open' : ''}`}>{foundationComplete ? '✓ Unlocked' : '🔒 Foundation required'}</span></div>
        <div className="learner-specialization-grid">{specializationTracks.map((track) => { const enrolled = enrolledTrackSlugs.includes(track.slug); return <button key={track.slug} className={`learner-specialization-card ${!foundationComplete ? 'learner-specialization-locked' : ''} ${enrolled ? 'learner-specialization-enrolled' : ''}`} type="button" onClick={() => onNavigate(`/tracks/${track.slug}`)}><div className="learner-specialization-top"><span>{track.eyebrow}</span><b>{enrolled ? '✓ Enrolled' : foundationComplete ? 'Available' : '🔒 Locked'}</b></div><strong>{track.title}</strong><p>{track.description}</p><span className="learner-specialization-link">{enrolled ? 'Open track' : foundationComplete ? 'Explore & enroll' : 'Preview track'} →</span></button>; })}</div>
      </section>

      <section className="learner-dashboard-section learner-achievements-section" aria-labelledby="learner-achievements-heading">
        <div className="learner-section-heading"><div><span className="section-kicker">Your progress</span><h2 id="learner-achievements-heading">Achievements & certificates</h2><p>Certificates shown here come from learner progress data; the prototype does not create certificates that have not been earned.</p></div></div>
        {certificates.length ? <div className="learner-certificate-grid">{certificates.map((item) => <article key={item.id} className="learner-certificate-card"><span>Certificate</span><strong>{item.name}</strong><p>{item.source}</p>{item.courseSlug === courseProgress.slug && <button className="button button-outline" type="button" onClick={openCompletion}>View certificate →</button>}</article>)}</div> : <div className="learner-empty-achievement"><span aria-hidden="true">◇</span><div><strong>No certificates earned yet</strong><p>Complete eligible learning milestones and future certificates will appear here.</p></div></div>}
      </section>
    </main>
  );
}
