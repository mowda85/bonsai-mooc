import { useEffect, useMemo, useState } from 'react';

const mockUsers = [
  { id: 'BNS-1001', username: 'alex', name: 'Alex Johnson', role: 'learner' },
  { id: 'BNS-2001', username: 'anna', name: 'Dr. Anna Kontokosta', role: 'teacher' },
  { id: 'BNS-9001', username: 'admin', name: 'BONSAI Administrator', role: 'admin' },
];

const learningAreas = {
  foundation: {
    slug: 'foundation', kind: 'foundation', eyebrow: 'Required common core', title: 'Foundation',
    description: 'The shared starting point for every BONSAI learner. Complete all four Foundation courses before starting a specialization.',
    prerequisite: 'Required first step — all four Foundation courses must be completed to unlock specialization enrollment.', duration: 'To be confirmed',
    courses: [
      { slug: 'introduction-flood-defences-dike-systems', title: 'Introduction to Flood Defences and Dike Systems', description: 'An introduction to flood defences and dike systems.' },
      { slug: 'information-systems-knowledge-dissemination', title: 'Information Systems and Knowledge Dissemination', description: 'Data, information, knowledge and knowledge dissemination in the BONSAI context.', pilot: true },
      { slug: 'numerical-modelling-fundamentals', title: 'Numerical Modelling Fundamentals', description: 'Foundational concepts in numerical modelling.' },
      { slug: 'risk-assessment-decision-making', title: 'Risk Assessment and Decision Making', description: 'Foundational concepts in risk assessment and decision making.' },
    ],
  },
  'dike-stability-erosion': {
    slug: 'dike-stability-erosion', kind: 'track', eyebrow: 'Specialization 01', title: 'Dike Stability and Erosion',
    description: 'Explore dike stability, erosion assessment, erosion properties and numerical modelling for flood and erosion.',
    prerequisite: 'Complete the Foundation to unlock enrollment in this specialization.', duration: 'To be confirmed',
    courses: [
      { slug: 'dike-stability', title: 'Dike Stability', description: 'Core concepts in dike stability.' },
      { slug: 'soil-erosion-assessment', title: 'Soil Erosion Assessment', description: 'Methods and concepts for assessing soil erosion.' },
      { slug: 'predicting-erosion-properties', title: 'Predicting Erosion Properties', description: 'Approaches to predicting erosion properties.' },
      { slug: 'numerical-modelling-flood-erosion', title: 'Numerical Modelling for Flood and Erosion', description: 'Numerical modelling applied to flood and erosion problems.' },
    ],
  },
  'animal-activities-burrows': {
    slug: 'animal-activities-burrows', kind: 'track', eyebrow: 'Specialization 02', title: 'Animal Activities and Burrows',
    description: 'Study burrow management, levee safety, non-destructive geophysical methods and animal risk assessment.',
    prerequisite: 'Complete the Foundation to unlock enrollment in this specialization.', duration: 'To be confirmed',
    courses: [
      { slug: 'burrows-levee-management', title: 'Burrows and Levee Management', description: 'Management of burrows in levee systems.' },
      { slug: 'burrows-levee-safety', title: 'Burrows and Levee Safety', description: 'How burrows relate to levee safety.' },
      { slug: 'non-destructive-geophysical-methods', title: 'Non-destructive Geophysical Methods', description: 'Introduction to non-destructive geophysical methods.' },
      { slug: 'animal-risk-assessment', title: 'Animal Risk Assessment', description: 'Assessing risk associated with animal activity.' },
    ],
  },
  'vegetation-nature-based-solutions': {
    slug: 'vegetation-nature-based-solutions', kind: 'track', eyebrow: 'Specialization 03', title: 'Vegetation and Nature-based Solutions',
    description: 'Explore vegetation for dike safety, biodiversity, vegetation management and climate change.',
    prerequisite: 'Complete the Foundation to unlock enrollment in this specialization.', duration: 'To be confirmed',
    courses: [
      { slug: 'vegetation-dike-safety', title: 'Vegetation for Dike Safety', description: 'The role of vegetation in dike safety.' },
      { slug: 'biodiversity-dike-vegetation', title: 'Biodiversity of Dike Vegetation', description: 'Biodiversity in dike vegetation.' },
      { slug: 'vegetation-management', title: 'Vegetation Management', description: 'Approaches to vegetation management.' },
      { slug: 'climate-change-dike-vegetation', title: 'Climate Change and Dike Vegetation', description: 'Climate change and its relationship with dike vegetation.' },
    ],
  },
  'flood-risk-emergency-management': {
    slug: 'flood-risk-emergency-management', kind: 'track', eyebrow: 'Specialization 04', title: 'Flood Risk and Emergency Management',
    description: 'Build knowledge in flood risk management, emergency response, crisis management and AI for flood forecasting.',
    prerequisite: 'Complete the Foundation to unlock enrollment in this specialization.', duration: 'To be confirmed',
    courses: [
      { slug: 'flood-risk-management', title: 'Flood Risk Management', description: 'Foundations of flood risk management.' },
      { slug: 'emergency-response', title: 'Emergency Response', description: 'Principles and practice of emergency response.' },
      { slug: 'crisis-management', title: 'Crisis Management', description: 'Foundations of crisis management in flood contexts.' },
      { slug: 'ai-flood-forecasting', title: 'AI for Flood Forecasting', description: 'Use of AI for flood forecasting.' },
    ],
  },
};

const specializationTracks = Object.values(learningAreas).filter((area) => area.kind === 'track');
const allCourses = Object.values(learningAreas).flatMap((area) => area.courses.map((course) => ({ ...course, area: area.title, areaSlug: area.slug, areaKind: area.kind })));
const foundationCourses = learningAreas.foundation.courses;

function navigate(path) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function Header({ path, user, onLogout }) {
  const isPublic = !user;
  return (
    <header className="site-header">
      <button className="brand brand-button" type="button" onClick={() => navigate('/')} aria-label="Go to BONSAI-MOOC homepage">
        <img src="/bonsai-logo.webp" alt="BONSAI project tree logo" />
        <span><strong>BONSAI-MOOC</strong><small>Flood resilience learning</small></span>
      </button>
      <nav aria-label="Primary navigation">
        <button type="button" onClick={() => navigate('/')}>Home</button>
        <button type="button" onClick={() => navigate('/courses')}>Courses</button>
        <a href="#about">About BONSAI</a>
      </nav>
      <div className="header-actions">
        {isPublic ? <>{path !== '/login' && <button type="button" className="button button-ghost" onClick={() => navigate('/login')}>Login</button>}<button type="button" className="button button-outline">Register</button></> : <button type="button" className="button button-outline" onClick={onLogout}>Log out</button>}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand"><img src="/bonsai-logo.webp" alt="" aria-hidden="true" /><div><strong>BONSAI-MOOC</strong><span>Learning and knowledge transfer for flood resilience in North-West Europe.</span></div></div>
      <div className="footer-links"><a href="#about">About</a><button type="button" onClick={() => navigate('/courses')}>Courses</button><a href="#contact">Contact</a><a href="#privacy">Privacy Policy</a></div>
      <div className="funding-credit"><div className="interreg-text"><strong>Interreg</strong><span>North-West Europe</span><b>BONSAI</b></div><div className="eu-credit"><img src="/eu-flag.svg" alt="European Union flag" /><span>Co-funded by<br /><strong>the European Union</strong></span></div></div>
    </footer>
  );
}

function Homepage({ foundationComplete }) {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const results = useMemo(() => {
    const normalized = submittedQuery.trim().toLowerCase();
    return normalized ? allCourses.filter((course) => `${course.title} ${course.area} ${course.description}`.toLowerCase().includes(normalized)) : [];
  }, [submittedQuery]);

  return (
    <main className="homepage">
      <section className="home-hero">
        <div className="home-hero-copy"><span className="pill">BONSAI learning platform</span><h1>Build the knowledge to strengthen flood resilience.</h1><p>Complete the shared Foundation first. Once it reaches 100%, the BONSAI specialization tracks unlock and you can continue in the area that best matches your interests.</p><div className="hero-actions"><button className="button button-primary" type="button" onClick={() => navigate('/foundation')}>{foundationComplete ? 'Review the Foundation' : 'Start with the Foundation'} <span aria-hidden="true">→</span></button><button className="button button-outline" type="button" onClick={() => navigate('/courses')}>Browse all courses</button></div></div>
        <div className="home-hero-panel" aria-label="BONSAI learning pathway"><div className={`path-step path-foundation ${foundationComplete ? 'path-complete' : ''}`}><span>{foundationComplete ? '✓' : '1'}</span><div><strong>Foundation</strong><small>{foundationComplete ? 'Completed — specializations unlocked' : 'Required common core'}</small></div></div><div className="path-line" /><div className={`path-step ${foundationComplete ? '' : 'path-locked'}`}><span>{foundationComplete ? '2' : '🔒'}</span><div><strong>Choose a specialization</strong><small>{foundationComplete ? 'Continue based on your area of interest' : 'Unlocks after Foundation completion'}</small></div></div><div className={`path-tags ${foundationComplete ? '' : 'path-tags-locked'}`}><span>Dikes</span><span>Animals</span><span>Vegetation</span><span>Emergency</span></div></div>
      </section>
      <section className="search-section" aria-labelledby="course-search-heading">
        <div><span className="section-kicker">Course discovery</span><h2 id="course-search-heading">What would you like to learn?</h2></div>
        <form className="course-search" onSubmit={(event) => { event.preventDefault(); setSubmittedQuery(query); }}><label className="sr-only" htmlFor="course-search">Search courses</label><input id="course-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by topic, course or specialization" /><button className="button button-primary" type="submit">Search</button></form>
        {submittedQuery && <div className="search-results" aria-live="polite"><div className="search-results-head"><strong>{results.length} result{results.length === 1 ? '' : 's'}</strong><button type="button" className="text-link" onClick={() => { setQuery(''); setSubmittedQuery(''); }}>Clear search</button></div>{results.length ? results.map((course) => <button className="search-result-card" type="button" key={course.slug} onClick={() => navigate(`/courses/${course.slug}`)}><span>{course.area}</span><strong>{course.title}</strong><p>{course.description}</p></button>) : <div className="empty-result">No prototype courses match “{submittedQuery}”. Try a broader keyword.</div>}</div>}
      </section>
      <section className="foundation-section" aria-labelledby="foundation-heading"><div className="foundation-copy"><span className="section-kicker">Step 1 · Required</span><h2 id="foundation-heading">Foundation</h2><p>The Foundation is the mandatory common core of BONSAI-MOOC. Complete all four courses to unlock specialization enrollment.</p><div className="foundation-meta"><span>Required common core</span><span>Complete first</span><span>4 courses</span></div><button className="button button-primary" type="button" onClick={() => navigate('/foundation')}>{foundationComplete ? 'Foundation complete ✓' : 'Start Foundation'}</button></div><div className="foundation-visual" aria-hidden="true"><div className="foundation-tree">{foundationComplete ? '100%' : 'STEP 1'}</div><div className="foundation-branches"><span>Understand</span><span>Connect</span><span>Apply</span></div></div></section>
      <section className="tracks-section" aria-labelledby="tracks-heading"><div className="section-heading-row"><div><span className="section-kicker">Step 2 · Specialize</span><h2 id="tracks-heading">Choose your specialization</h2><p>{foundationComplete ? 'Foundation complete. Your specialization tracks are now unlocked.' : 'You can explore the specialization options now, but enrollment stays locked until the Foundation is complete.'}</p></div><span className={`unlock-status ${foundationComplete ? 'unlock-status-open' : ''}`}>{foundationComplete ? '✓ Unlocked' : '🔒 Foundation required'}</span></div><div className="track-grid">{specializationTracks.map((track, index) => <button className={`track-card ${foundationComplete ? '' : 'track-card-locked'}`} type="button" key={track.slug} onClick={() => navigate(`/tracks/${track.slug}`)}><span className="track-number">0{index + 1}</span><span className="track-eyebrow">{track.eyebrow}</span>{!foundationComplete && <span className="track-lock-badge">🔒 Complete Foundation to unlock</span>}<strong>{track.title}</strong><p>{track.description}</p><span className="track-link">{foundationComplete ? 'Explore track' : 'View track details'} <b aria-hidden="true">→</b></span></button>)}</div></section>
      <section className="home-cta"><div><span className="section-kicker">Your BONSAI pathway</span><h2>Foundation first. Specialize second.</h2><p>The learning pathway keeps the common BONSAI knowledge consistent for everyone before learners branch into specialist subjects.</p></div><div className="hero-actions"><button className="button button-primary" type="button" onClick={() => navigate('/foundation')}>{foundationComplete ? 'View Foundation' : 'Start Foundation'}</button></div></section>
    </main>
  );
}

function CourseCatalogue() {
  const [query, setQuery] = useState('');
  const [activeArea, setActiveArea] = useState('all');
  const filters = [{ slug: 'all', title: 'All courses' }, ...Object.values(learningAreas).map((area) => ({ slug: area.slug, title: area.title }))];
  const visibleCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return allCourses.filter((course) => {
      const areaMatch = activeArea === 'all' || course.areaSlug === activeArea;
      const searchMatch = !normalized || `${course.title} ${course.description} ${course.area}`.toLowerCase().includes(normalized);
      return areaMatch && searchMatch;
    });
  }, [query, activeArea]);

  return (
    <main className="catalogue-page">
      <section className="catalogue-hero">
        <button className="back-link" type="button" onClick={() => navigate('/')}><span aria-hidden="true">←</span> Back to homepage</button>
        <div className="catalogue-hero-grid"><div><span className="pill">Course catalogue</span><h1>Explore all BONSAI courses</h1><p>Browse the required Foundation and all four specialization areas. You can explore every course before choosing your learning pathway.</p></div><aside className="catalogue-summary"><div><strong>20</strong><span>Courses</span></div><div><strong>4</strong><span>Foundation</span></div><div><strong>16</strong><span>Specialization</span></div></aside></div>
      </section>
      <section className="catalogue-body">
        <div className="catalogue-discovery"><div><span className="section-kicker">Find a course</span><h2>Search or filter the catalogue</h2><p>Specialization courses remain visible for discovery even when Foundation completion is still required before enrollment.</p></div><label className="catalogue-search"><span className="sr-only">Search all courses</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses, topics or learning areas" /><span aria-hidden="true">⌕</span></label></div>
        <div className="catalogue-filters" aria-label="Filter courses by learning area">{filters.map((filter) => <button key={filter.slug} className={`catalogue-filter ${activeArea === filter.slug ? 'catalogue-filter-active' : ''}`} type="button" onClick={() => setActiveArea(filter.slug)}>{filter.title}</button>)}</div>
        <div className="catalogue-results-head"><div><strong>{visibleCourses.length}</strong><span>course{visibleCourses.length === 1 ? '' : 's'} shown</span></div>{(query || activeArea !== 'all') && <button className="text-link" type="button" onClick={() => { setQuery(''); setActiveArea('all'); }}>Clear filters</button>}</div>
        {visibleCourses.length ? <div className="catalogue-grid">{visibleCourses.map((course) => <button key={course.slug} className={`catalogue-course-card ${course.areaKind === 'foundation' ? 'catalogue-foundation-card' : ''} ${course.pilot ? 'catalogue-pilot-card' : ''}`} type="button" onClick={() => navigate(`/courses/${course.slug}`)}><div className="catalogue-card-top"><span className={`catalogue-area-tag ${course.areaKind === 'foundation' ? 'catalogue-area-foundation' : ''}`}>{course.areaKind === 'foundation' ? 'Foundation · Required' : course.area}</span>{course.pilot && <span className="pilot-badge">Pilot course</span>}</div><strong>{course.title}</strong><p>{course.description}</p><span className="catalogue-card-link">View course information <b aria-hidden="true">→</b></span></button>)}</div> : <div className="catalogue-empty"><strong>No courses found</strong><p>Try another keyword or choose a different learning-area filter.</p><button className="button button-outline" type="button" onClick={() => { setQuery(''); setActiveArea('all'); }}>Show all 20 courses</button></div>}
      </section>
    </main>
  );
}

function FoundationCourseCard({ course, index, completed, onToggle }) {
  return <article className={`area-course-card foundation-progress-card ${course.pilot ? 'pilot-course-card' : ''} ${completed ? 'course-completed' : ''}`}><div className="course-card-topline"><span className="course-sequence">{completed ? '✓' : String(index + 1).padStart(2, '0')}</span>{course.pilot && <span className="pilot-badge">Pilot course</span>}</div><strong>{course.title}</strong><p>{course.description}</p><div className="foundation-course-actions"><button className="course-card-link-button" type="button" onClick={() => navigate(`/courses/${course.slug}`)}>View course information →</button><button className={`completion-toggle ${completed ? 'completion-toggle-done' : ''}`} type="button" onClick={() => onToggle(course.slug)}>{completed ? 'Completed ✓' : 'Mark complete'}</button></div></article>;
}

function LearningAreaPage({ area, foundationComplete, completedFoundationCourses, onToggleFoundationCourse }) {
  const [active, setActive] = useState(false);
  const isFoundation = area.kind === 'foundation';
  const locked = !isFoundation && !foundationComplete;
  const completedCount = completedFoundationCourses.length;
  const progress = Math.round((completedCount / foundationCourses.length) * 100);
  return (
    <main className={`learning-area-page ${isFoundation ? 'learning-area-foundation' : 'learning-area-track'} ${locked ? 'learning-area-locked' : ''}`}>
      <section className="learning-area-hero"><button className="back-link" type="button" onClick={() => navigate('/')}><span aria-hidden="true">←</span> Back to homepage</button><div className="learning-area-hero-grid"><div><span className={isFoundation ? 'pill' : 'track-page-pill'}>{area.eyebrow}</span><h1>{area.title}</h1><p>{area.description}</p><div className="learning-area-actions">{isFoundation ? <button className="button button-primary" type="button" onClick={() => document.getElementById('foundation-courses')?.scrollIntoView({ behavior: 'smooth' })}>{foundationComplete ? 'Foundation complete ✓' : 'Continue Foundation'}</button> : <button className="button button-primary" type="button" onClick={() => setActive(true)} disabled={locked || active}>{locked ? '🔒 Complete Foundation first' : active ? 'Track enrolled ✓' : 'Enroll in Track'}</button>}{!isFoundation && <button className="button button-outline" type="button" onClick={() => navigate('/foundation')}>{foundationComplete ? 'Review Foundation' : 'Complete Foundation'}</button>}</div>{locked && <div className="track-prerequisite-lock"><strong>Specialization locked</strong><span>Finish all four Foundation courses to enable enrollment.</span></div>}</div><aside className="learning-area-summary" aria-label={`${area.title} summary`}><div><span>Courses</span><strong>4</strong></div><div><span>Duration</span><strong>{area.duration}</strong></div><div><span>{isFoundation ? 'Progress' : 'Access'}</span><strong>{isFoundation ? `${completedCount} of 4 complete` : foundationComplete ? 'Unlocked ✓' : 'Locked · Foundation first'}</strong></div></aside></div></section>
      <section className="learning-area-body">{isFoundation && <div className="foundation-roadmap" aria-label="Foundation progress"><div className="roadmap-heading"><div><span className="section-kicker">Step 1 · Mandatory</span><h2>Complete the Foundation to unlock your pathway</h2></div><strong>{progress}%</strong></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><p>All four Foundation courses are required. When progress reaches 100%, all four specialization tracks unlock automatically.</p></div>}<div className="learning-area-intro" id={isFoundation ? 'foundation-courses' : undefined}><span className="section-kicker">{isFoundation ? 'Required courses' : foundationComplete ? 'Unlocked specialization' : 'Preview specialization'}</span><h2>{isFoundation ? 'Your four Foundation courses' : 'Courses included in this track'}</h2><p>{area.prerequisite}</p></div><div className="area-course-grid">{area.courses.map((course, index) => isFoundation ? <FoundationCourseCard key={course.slug} course={course} index={index} completed={completedFoundationCourses.includes(course.slug)} onToggle={onToggleFoundationCourse} /> : <button className="area-course-card" type="button" key={course.slug} onClick={() => navigate(`/courses/${course.slug}`)}><div className="course-card-topline"><span className="course-sequence">{String(index + 1).padStart(2, '0')}</span></div><strong>{course.title}</strong><p>{course.description}</p><span className="course-card-link">View course information <b aria-hidden="true">→</b></span></button>)}</div>{isFoundation && foundationComplete ? <div className="foundation-unlocked-banner"><span aria-hidden="true">✓</span><div><strong>Foundation complete — specializations unlocked</strong><p>You can now choose and enroll in any BONSAI specialization track.</p></div><button className="button button-primary" type="button" onClick={() => navigate('/')}>Choose a specialization</button></div> : <div className={`sequence-note ${isFoundation ? 'sequence-note-foundation' : ''}`}><span aria-hidden="true">{isFoundation ? '1' : locked ? '🔒' : '2'}</span><div><strong>{isFoundation ? 'Foundation comes first' : locked ? 'Enrollment is still locked' : 'Foundation complete — continue here'}</strong><p>{isFoundation ? 'Complete all four common-core courses. The specialization stage unlocks only when Foundation progress reaches 100%.' : locked ? 'You may preview these courses, but you cannot enroll in this specialization until the Foundation is complete.' : 'This specialization is now available because the shared Foundation has been completed.'}</p></div></div>}</section>
    </main>
  );
}

function CourseInfoPlaceholder({ course }) {
  const area = learningAreas[course.areaSlug];
  return <main className="course-info-placeholder"><button className="back-link" type="button" onClick={() => navigate('/courses')}><span aria-hidden="true">←</span> Back to course catalogue</button><div className="course-info-card"><div className="course-info-heading"><span className="pill">{course.pilot ? 'Pilot course' : area.kind === 'foundation' ? 'Foundation course' : 'Specialization course'}</span><h1>{course.title}</h1><p>{course.description}</p></div><div className="course-info-meta"><div><span>Learning area</span><strong>{area.title}</strong></div><div><span>Duration</span><strong>{course.pilot ? '2–3 hours' : 'To be confirmed'}</strong></div><div><span>Course information</span><strong>KAN-20</strong></div></div><div className="course-placeholder-note"><strong>Course Information page placeholder</strong><p>The detailed Course Information screen will be implemented in KAN-20. KAN-19 connects the catalogue to the same course routes already used by the learning-area pages.</p></div></div></main>;
}

function LoginPage({ onLogin }) {
  const [identifier, setIdentifier] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  function submit(event) { event.preventDefault(); const value = identifier.trim().toLowerCase(); const user = mockUsers.find((item) => item.username.toLowerCase() === value || item.id.toLowerCase() === value); if (!user || !password.trim()) { setError('Please enter a valid prototype username/BONSAI ID and password.'); return; } setError(''); onLogin(user); }
  return <main className="login-page"><section className="login-hero"><span className="pill">BONSAI-MOOC prototype</span><h1>Welcome to BONSAI-MOOC</h1><div className="hero-rule" /><p>Access BONSAI courses, teaching tools and collaboration spaces focused on flood resilience, disaster management and knowledge transfer.</p></section><section className="login-content"><div className="login-card" aria-labelledby="login-heading"><h2 id="login-heading">Login</h2><p>Enter your BONSAI credentials to continue.</p><form onSubmit={submit}><label>Username or BONSAI ID<div className="input-shell"><span aria-hidden="true">♙</span><input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="e.g. alex or BNS-1001" autoComplete="username" /></div></label><label>Password<div className="input-shell"><span aria-hidden="true">▣</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" /></div></label><div className="form-options"><label className="remember"><input type="checkbox" /> Remember me</label><button type="button" className="text-link">Forgot password?</button></div>{error && <div className="login-error" role="alert">{error}</div>}<button className="button button-primary login-submit" type="submit">Login <span aria-hidden="true">→</span></button></form><div className="divider"><span>New to BONSAI-MOOC?</span></div><button type="button" className="button button-outline register-wide">Create an account</button><div className="demo-note">Prototype environment — no real authentication backend is connected yet.</div></div><aside className="help-card" aria-label="Login help"><h2>Need help?</h2><div className="help-rule" /><div className="help-item"><span className="help-icon">?</span><div><strong>Check our FAQs</strong><p>Find answers to common questions.</p><button type="button" className="text-link">View FAQs</button></div></div><div className="help-item"><span className="help-icon">✉</span><div><strong>Contact support</strong><p>We are here to help.</p><button type="button" className="text-link">Contact us</button></div></div><div className="help-item"><span className="help-icon">▤</span><div><strong>User guide</strong><p>Learn how to make the most of BONSAI-MOOC.</p><button type="button" className="text-link">Open user guide</button></div></div></aside></section></main>;
}

function PlaceholderDashboard({ user, onLogout }) {
  const labels = { learner: 'Learner Dashboard', teacher: 'Teacher Dashboard', admin: 'Admin Dashboard' };
  return <main className="dashboard-placeholder"><span className="pill">{user.role} workspace</span><h1>{labels[user.role]}</h1><p>Welcome, {user.name}. Your account role routed you here automatically. This temporary destination will be replaced by the full {user.role} experience in its Jira task.</p><button className="button button-primary" type="button" onClick={onLogout}>Log out</button></main>;
}

function pageForPath(path, user, setUser, foundationComplete, completedFoundationCourses, onToggleFoundationCourse) {
  if (user) return <PlaceholderDashboard user={user} onLogout={() => { setUser(null); navigate('/'); }} />;
  if (path === '/login') return <LoginPage onLogin={(nextUser) => setUser(nextUser)} />;
  if (path === '/foundation') return <LearningAreaPage area={learningAreas.foundation} foundationComplete={foundationComplete} completedFoundationCourses={completedFoundationCourses} onToggleFoundationCourse={onToggleFoundationCourse} />;
  if (path === '/courses') return <CourseCatalogue />;
  if (path.startsWith('/courses/')) { const slug = path.split('/').filter(Boolean)[1]; const course = allCourses.find((item) => item.slug === slug); if (course) return <CourseInfoPlaceholder course={course} />; }
  if (path.startsWith('/tracks/')) { const slug = path.split('/').filter(Boolean)[1]; const track = learningAreas[slug]; if (track?.kind === 'track') return <LearningAreaPage area={track} foundationComplete={foundationComplete} completedFoundationCourses={completedFoundationCourses} onToggleFoundationCourse={onToggleFoundationCourse} />; }
  return <Homepage foundationComplete={foundationComplete} />;
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname || '/');
  const [user, setUser] = useState(null);
  const [completedFoundationCourses, setCompletedFoundationCourses] = useState([]);
  const foundationComplete = completedFoundationCourses.length === foundationCourses.length;
  function toggleFoundationCourse(slug) { setCompletedFoundationCourses((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]); }
  useEffect(() => { const handleLocation = () => setPath(window.location.pathname || '/'); window.addEventListener('popstate', handleLocation); return () => window.removeEventListener('popstate', handleLocation); }, []);
  return <div className="app-shell"><Header path={path} user={user} onLogout={() => { setUser(null); navigate('/'); }} />{pageForPath(path, user, setUser, foundationComplete, completedFoundationCourses, toggleFoundationCourse)}<Footer /></div>;
}
