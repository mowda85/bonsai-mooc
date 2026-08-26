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
  const completedFoundationCount = completedFoundationCourses.length;
  const foundationPercent = foundationCourses.length
    ? Math.round((completedFoundationCount / foundationCourses.length) * 100)
    : 0;

  const currentCourse = allCourses.find((course) => course.slug === progress.currentCourse.slug);
  const completedUnits = progress.currentCourse.completedUnits.length;
  const totalUnits = progress.currentCourse.totalUnits;
  const remainingUnits = Math.max(totalUnits - completedUnits, 0);
  const currentCoursePercent = totalUnits ? Math.round((completedUnits / totalUnits) * 100) : 0;
  const certificates = progress.certificates || [];

  return (
    <main className="learner-dashboard-page">
      <section className="learner-dashboard-hero">
        <div>
          <span className="pill">Learner dashboard</span>
          <h1>Welcome back, {user.name.split(' ')[0]}</h1>
          <p>Follow your required Foundation progress, continue your current course and see when BONSAI specialization pathways become available.</p>
        </div>
        <div className="learner-dashboard-hero-actions">
          <button className="button button-outline" type="button" onClick={() => onNavigate('/')}>Homepage</button>
          <button className="button button-primary" type="button" onClick={() => onNavigate('/courses')}>Browse courses</button>
        </div>
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
          <div className="learner-foundation-list">
            {foundationCourses.map((course) => {
              const complete = completedFoundationCourses.includes(course.slug);
              return <button key={course.slug} type="button" onClick={() => onNavigate(`/courses/${course.slug}`)}><span className={complete ? 'learner-check learner-check-done' : 'learner-check'}>{complete ? '✓' : '○'}</span><strong>{course.title}</strong><small>{complete ? 'Completed' : 'To complete'}</small></button>;
            })}
          </div>
          <button className="button button-primary" type="button" onClick={() => onNavigate('/foundation')}>{foundationComplete ? 'Review Foundation' : 'Continue Foundation'} →</button>
        </article>

        <article className="learner-dashboard-card current-course-dashboard-card">
          <div className="learner-card-heading"><div><span className="section-kicker">Continue learning</span><h2>Current course</h2></div><span className="pilot-badge">Pilot course</span></div>
          <span className="learner-course-area">{currentCourse?.area || 'Foundation'}</span>
          <h3>{currentCourse?.title || 'Course'}</h3>
          <p>{currentCourse?.description}</p>
          <div className="learner-unit-progress"><div><strong>{completedUnits}/{totalUnits}</strong><span>units complete</span></div><div><strong>{remainingUnits}</strong><span>units left</span></div></div>
          <div className="learner-progress-track" aria-label={`Current course ${currentCoursePercent}% complete`}><span style={{ width: `${currentCoursePercent}%` }} /></div>
          <div className="current-course-actions">
            <button className="button button-primary" type="button" onClick={() => onNavigate(`/learn/${progress.currentCourse.slug}/unit-1`)}>Continue course →</button>
            <button className="button button-outline" type="button" onClick={() => onNavigate(`/courses/${progress.currentCourse.slug}`)}>Course information</button>
          </div>
        </article>
      </section>

      <section className="learner-dashboard-section" aria-labelledby="learner-specializations-heading">
        <div className="learner-section-heading"><div><span className="section-kicker">Step 2 · Specialize</span><h2 id="learner-specializations-heading">My specializations</h2><p>{foundationComplete ? 'Your specialization pathways are unlocked. Enrolled tracks appear here immediately.' : 'Explore what comes next. Enrollment stays locked until your Foundation progress reaches 100%.'}</p></div><span className={`unlock-status ${foundationComplete ? 'unlock-status-open' : ''}`}>{foundationComplete ? '✓ Unlocked' : '🔒 Foundation required'}</span></div>
        <div className="learner-specialization-grid">
          {specializationTracks.map((track) => {
            const enrolled = enrolledTrackSlugs.includes(track.slug);
            return (
              <button key={track.slug} className={`learner-specialization-card ${!foundationComplete ? 'learner-specialization-locked' : ''} ${enrolled ? 'learner-specialization-enrolled' : ''}`} type="button" onClick={() => onNavigate(`/tracks/${track.slug}`)}>
                <div className="learner-specialization-top"><span>{track.eyebrow}</span><b>{enrolled ? '✓ Enrolled' : foundationComplete ? 'Available' : '🔒 Locked'}</b></div>
                <strong>{track.title}</strong><p>{track.description}</p><span className="learner-specialization-link">{enrolled ? 'Open track' : foundationComplete ? 'Explore & enroll' : 'Preview track'} →</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="learner-dashboard-section learner-achievements-section" aria-labelledby="learner-achievements-heading">
        <div className="learner-section-heading"><div><span className="section-kicker">Your progress</span><h2 id="learner-achievements-heading">Achievements & certificates</h2><p>Certificates shown here come from learner progress data; the prototype does not create certificates that have not been earned.</p></div></div>
        {certificates.length ? (
          <div className="learner-certificate-grid">{certificates.map((certificate) => <article key={certificate.id} className="learner-certificate-card"><span>Certificate</span><strong>{certificate.name}</strong><p>{certificate.source}</p></article>)}</div>
        ) : (
          <div className="learner-empty-achievement"><span aria-hidden="true">◇</span><div><strong>No certificates earned yet</strong><p>Complete eligible learning milestones and future certificates will appear here.</p></div></div>
        )}
      </section>
    </main>
  );
}
