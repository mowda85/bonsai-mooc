import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { BONSAI_CATEGORIES, BONSAI_COURSES, getCategoryBySlug, getCourseBySlug, PILOT_COURSE_SLUG } from './courseArchitecture.js';
import { dependencyStatus, mergeCourseRequirements } from './courseRequirementsStore.js';

const ACHIEVEMENT_KEY = 'bonsai-mooc.prototype.category-achievements.v1';

const LEGACY_CATEGORY_ROUTES = {
  foundation: 'information-systems-knowledge-dissemination',
  'dike-stability-erosion': 'erosion',
  'animal-activities-burrows': 'animal-activities-burrows',
  'vegetation-nature-based-solutions': 'vegetation-biodiversity',
  'flood-risk-emergency-management': 'crisis-management',
};

const LEGACY_COURSE_ALIASES = {
  'dike-stability': 'dike-stability-lagrangian-numerical-modelling',
  'soil-erosion-assessment': 'soil-erosion-assessment-laboratory',
  'predicting-erosion-properties': 'predicting-clay-erosion-wave-impact',
  'numerical-modelling-flood-erosion': 'numerical-modelling-flood-blind-exercise',
  'burrows-levee-management': 'dealing-with-burrows-levee-management',
  'burrows-levee-safety': 'effect-burrows-levee-safety',
  'non-destructive-geophysical-methods': 'non-destructive-geophysical-methods-dikes',
  'animal-risk-assessment': 'risk-digging-animal-flood-defence',
  'vegetation-dike-safety': 'vegetation-erosion-resistance-dike-safety',
  'biodiversity-dike-vegetation': 'biodiversity-values-dike-vegetation',
  'climate-change-dike-vegetation': 'dike-vegetation-climate-change',
  'flood-risk-management': 'flood-risk-management-preparedness',
  'crisis-management': 'crisisology-hydraulic-warfare',
  'ai-flood-forecasting': 'flood-risk-management-preparedness',
};

const TEXT_REPLACEMENTS = [
  ['Foundation + specialization catalogue', '19 mapped courses · 5 Categories'],
  ['Official specialization structure', 'Official learning structure'],
  ['Specialization tracks / learning areas', 'BONSAI Categories'],
  ['specialization tracks', 'Categories'],
  ['specialization track', 'Category'],
  ['Specialization tracks', 'Categories'],
  ['Specialization track', 'Category'],
  ['official tracks', 'official Categories'],
  ['Official tracks', 'Official Categories'],
  ['track assignment', 'Category assignment'],
  ['Track assignment', 'Category assignment'],
  ['Track / learning area', 'Category assignment'],
  ['Learning area', 'Category'],
  ['Dike Stability and Erosion', 'Erosion'],
  ['Animal Activities and Burrows', 'Animal Activities / Burrows'],
  ['Vegetation and Nature-based Solutions', 'Vegetation / Biodiversity'],
  ['Flood Risk and Emergency Management', 'Crisis Management'],
  ['Foundation', 'Information Systems & Knowledge Dissemination'],
];

function navigate(path) {
  if (`${window.location.pathname}${window.location.search}` === path) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function replaceNavigate(path) {
  if (`${window.location.pathname}${window.location.search}` === path) return;
  window.history.replaceState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function readAchievements() {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(ACHIEVEMENT_KEY) || '{}');
    return {
      completedCourseSlugs: Array.isArray(value.completedCourseSlugs) ? value.completedCourseSlugs : [],
    };
  } catch {
    return { completedCourseSlugs: [] };
  }
}

function writeAchievements(value) {
  const normalized = { completedCourseSlugs: [...new Set(value.completedCourseSlugs || [])] };
  try {
    window.sessionStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(normalized));
  } catch {
    // Same-session in-memory state still keeps the page usable.
  }
  window.dispatchEvent(new CustomEvent('bonsai:category-achievements-changed', { detail: normalized }));
  return normalized;
}

function courseCertificateName(course) {
  return `BONSAI Course Certificate — ${course.title}`;
}

function categoryProgress(category, completedCourseSlugs) {
  const completed = category.courses.filter((course) => completedCourseSlugs.includes(course.slug));
  return {
    completedCount: completed.length,
    totalCount: category.courses.length,
    percent: category.courses.length ? Math.round((completed.length / category.courses.length) * 100) : 0,
    specialistEarned: category.courses.length > 0 && completed.length === category.courses.length,
  };
}

function resolveCourseSlug(slug) {
  if (getCourseBySlug(slug)) return slug;
  return LEGACY_COURSE_ALIASES[slug] || slug;
}

function routeState() {
  const path = window.location.pathname || '/';
  const search = window.location.search || '';
  if (path === '/') return { type: 'home' };
  if (path === '/courses') return { type: 'catalogue' };
  if (path === '/learner' && !search) return { type: 'learner' };
  const categoryMatch = path.match(/^\/categories\/([^/]+)\/?$/);
  if (categoryMatch) return { type: 'category', slug: categoryMatch[1] };
  const legacyTrackMatch = path.match(/^\/tracks\/([^/]+)\/?$/);
  if (legacyTrackMatch) return { type: 'legacy-category', slug: legacyTrackMatch[1] };
  if (path === '/foundation') return { type: 'legacy-category', slug: 'foundation' };
  const courseMatch = path.match(/^\/courses\/([^/]+)\/?$/);
  if (courseMatch) return { type: 'course', slug: resolveCourseSlug(courseMatch[1]), started: new URLSearchParams(search).get('started') === '1' };
  return { type: null };
}

function CourseCard({ course, completed }) {
  return (
    <button className={`category-v2-course-card ${completed ? 'is-complete' : ''}`} type="button" onClick={() => navigate(`/courses/${course.slug}`)}>
      <div className="category-v2-course-top"><span>{course.category}</span>{course.pilot && <b>Pilot course</b>}</div>
      <strong>{course.title}</strong>
      <p>{course.description}</p>
      <div className="category-v2-course-award"><span>{completed ? '✓ Course certificate earned' : 'Course badge / certificate'}</span><b>View course →</b></div>
    </button>
  );
}

function HomePage({ completedCourseSlugs }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return BONSAI_COURSES.filter((course) => `${course.title} ${course.category} ${course.description}`.toLowerCase().includes(normalized)).slice(0, 8);
  }, [query]);

  return (
    <main className="category-v2-page category-v2-home">
      <section className="category-v2-hero">
        <div><span className="pill">BONSAI learning platform</span><h1>Choose any course. Build specialist expertise at your own pace.</h1><p>BONSAI-MOOC is organised into five course Categories. Learners may take any individual course directly; completing every course in one Category earns a Specialist Certificate.</p><div className="hero-actions"><button className="button button-primary" type="button" onClick={() => navigate('/courses')}>Browse all courses →</button><button className="button button-outline" type="button" onClick={() => navigate('/learner')}>View my learning</button></div></div>
        <aside className="category-v2-hero-summary"><div><strong>5</strong><span>Categories</span></div><div><strong>{BONSAI_COURSES.length}</strong><span>Mapped courses</span></div><div><strong>2</strong><span>Achievement levels</span></div><p><b>Course completion</b> → badge/certificate<br /><b>Whole Category</b> → Specialist Certificate</p></aside>
      </section>

      <section className="category-v2-search-section">
        <div><span className="section-kicker">Course discovery</span><h2>What would you like to learn?</h2></div>
        <label className="category-v2-search"><span className="sr-only">Search BONSAI courses</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by course, topic or Category" /><span>⌕</span></label>
        {query && <div className="category-v2-search-results">{filtered.length ? filtered.map((course) => <CourseCard key={course.slug} course={course} completed={completedCourseSlugs.includes(course.slug)} />) : <div className="category-v2-empty"><strong>No matching courses</strong><p>Try another keyword.</p></div>}</div>}
      </section>

      <section className="category-v2-category-section">
        <div className="category-v2-section-heading"><div><span className="section-kicker">Five learning Categories</span><h2>Explore a specialist area</h2><p>Categories organise the curriculum; they do not lock learners into a fixed sequence.</p></div><span className="category-v2-open-chip">Open course access</span></div>
        <div className="category-v2-category-grid">{BONSAI_CATEGORIES.map((category, index) => {
          const progress = categoryProgress(category, completedCourseSlugs);
          return <button className="category-v2-category-card" type="button" key={category.slug} onClick={() => navigate(`/categories/${category.slug}`)}><span className="category-v2-index">0{index + 1}</span><strong>{category.name}</strong><p>{category.description}</p><div><span>{category.courses.length} course{category.courses.length === 1 ? '' : 's'}</span><span>{progress.specialistEarned ? '✓ Specialist Certificate earned' : 'Specialist Certificate pathway'}</span></div><b>Explore Category →</b></button>;
        })}</div>
      </section>

      <section className="category-v2-certificate-ladder"><div><span className="section-kicker">Achievements</span><h2>Two levels of recognition</h2><p>Finish an individual course to earn its course badge/certificate. Finish all courses in one Category to earn the Category's Specialist Certificate.</p></div><div className="category-v2-ladder-step"><span>1</span><strong>Course badge / certificate</strong><small>Awarded per completed course</small></div><div className="category-v2-ladder-arrow">→</div><div className="category-v2-ladder-step specialist"><span>2</span><strong>Specialist Certificate</strong><small>Awarded after the entire Category</small></div></section>
    </main>
  );
}

function CataloguePage({ completedCourseSlugs }) {
  const [query, setQuery] = useState('');
  const [categorySlug, setCategorySlug] = useState('all');
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return BONSAI_COURSES.filter((course) => (categorySlug === 'all' || course.categorySlug === categorySlug) && (!normalized || `${course.title} ${course.category} ${course.description} ${(course.topics || []).join(' ')}`.toLowerCase().includes(normalized)));
  }, [query, categorySlug]);

  return (
    <main className="category-v2-page category-v2-catalogue">
      <section className="category-v2-subhero"><button className="back-link" type="button" onClick={() => navigate('/')}>← Back to homepage</button><span className="pill">Course catalogue</span><h1>Explore all BONSAI courses</h1><p>Every mapped course is available for discovery and can be taken independently unless a specific prerequisite/dependency is configured later.</p><div className="category-v2-mini-stats"><span><b>{BONSAI_COURSES.length}</b> courses</span><span><b>5</b> Categories</span><span><b>0</b> default locks</span></div></section>
      <section className="category-v2-catalogue-body"><div className="category-v2-catalogue-tools"><label className="category-v2-search"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses or mapped topics" /><span>⌕</span></label><div className="category-v2-filter-row"><button className={categorySlug === 'all' ? 'active' : ''} type="button" onClick={() => setCategorySlug('all')}>All</button>{BONSAI_CATEGORIES.map((category) => <button className={categorySlug === category.slug ? 'active' : ''} type="button" key={category.slug} onClick={() => setCategorySlug(category.slug)}>{category.name}</button>)}</div></div><div className="category-v2-results-head"><strong>{visible.length}</strong><span>course{visible.length === 1 ? '' : 's'} shown</span></div>{visible.length ? <div className="category-v2-course-grid">{visible.map((course) => <CourseCard key={course.slug} course={course} completed={completedCourseSlugs.includes(course.slug)} />)}</div> : <div className="category-v2-empty"><strong>No courses found</strong><p>Clear the search or choose another Category.</p></div>}</section>
    </main>
  );
}

function CategoryPage({ category, completedCourseSlugs }) {
  if (!category) return <NotFound title="Category not found" />;
  const progress = categoryProgress(category, completedCourseSlugs);
  return (
    <main className="category-v2-page category-v2-detail">
      <section className="category-v2-subhero"><button className="back-link" type="button" onClick={() => navigate('/')}>← Back to Categories</button><span className="pill">BONSAI Category</span><h1>{category.name}</h1><p>{category.description}</p><div className="category-v2-mini-stats"><span><b>{category.courses.length}</b> courses</span><span><b>{progress.completedCount}/{progress.totalCount}</b> completed</span><span><b>{progress.percent}%</b> Category progress</span></div></section>
      <section className="category-v2-detail-body"><div className="category-v2-specialist-card"><div><span className="section-kicker">Category achievement</span><h2>{category.specialistCertificate}</h2><p>Complete all {category.courses.length} courses in this Category to earn the Specialist Certificate. You may take the courses in any order unless a specific dependency is configured.</p><div className="category-v2-progress"><span style={{ width: `${progress.percent}%` }} /></div><small>{progress.completedCount} of {progress.totalCount} courses complete</small></div><strong className={progress.specialistEarned ? 'earned' : ''}>{progress.specialistEarned ? '✓ Earned' : `${progress.percent}%`}</strong></div><div className="category-v2-section-heading"><div><span className="section-kicker">Courses</span><h2>Courses in {category.name}</h2></div><span className="category-v2-open-chip">Take any course</span></div><div className="category-v2-course-grid">{category.courses.map((baseCourse) => { const course = BONSAI_COURSES.find((item) => item.slug === baseCourse.slug) || baseCourse; return <CourseCard key={course.slug} course={course} completed={completedCourseSlugs.includes(course.slug)} />; })}</div></section>
    </main>
  );
}

function RequirementsPanel({ course, completedCourseSlugs }) {
  const status = dependencyStatus(course, { completedCourseSlugs });
  const resolved = status.course;
  const external = resolved.externalPrerequisites || [];
  const internal = resolved.internalDependencies || [];
  return (
    <section className="category-v2-requirements"><span className="section-kicker">Course access</span><h2>Prerequisites & Dependencies</h2>{!external.length && !internal.length ? <div className="category-v2-no-requirements"><strong>No prerequisites</strong><p>No external prerequisite or internal learning dependency has been defined for this course. It is open to learners by default.</p></div> : <div className="category-v2-requirement-columns"><div><h3>External prerequisites</h3>{external.length ? external.map((item) => <article key={item.id}><span className={item.level}>{item.level}</span><strong>{item.title}</strong>{item.description && <p>{item.description}</p>}</article>) : <p>None defined.</p>}</div><div><h3>Internal dependencies</h3>{internal.length ? internal.map((item) => <article key={item.id}><span className={item.required ? 'required' : 'recommended'}>{item.required ? 'required' : 'optional'}</span><strong>{item.rule === 'pass' ? 'Pass' : 'Complete'} {item.targetLabel}</strong><p>{item.targetType}</p></article>) : <p>None defined.</p>}</div></div>}{status.locked && <div className="category-v2-dependency-lock"><strong>Course start is locked by an explicit dependency.</strong><span>Complete: {status.unmetRequired.map((item) => item.targetLabel).join(', ')}</span></div>}</section>
  );
}

function CoursePage({ baseCourse, completedCourseSlugs, onCompletePrototype, started }) {
  if (!baseCourse) return <NotFound title="Course not found" />;
  const course = mergeCourseRequirements(baseCourse);
  const category = getCategoryBySlug(course.categorySlug);
  const status = dependencyStatus(course, { completedCourseSlugs });
  const completed = completedCourseSlugs.includes(course.slug);
  const [message, setMessage] = useState('');

  function startCourse() {
    if (status.locked) return;
    const sessionText = document.querySelector('.mock-session-chip')?.textContent || '';
    if (!sessionText) {
      navigate('/login');
      return;
    }
    if (!sessionText.includes('Learner session')) {
      setMessage('Course learning is available from a Learner session.');
      return;
    }
    if (course.pilot) {
      navigate(`/learn/${course.slug}/unit-1`);
      return;
    }
    navigate(`/courses/${course.slug}?started=1`);
  }

  return (
    <main className="category-v2-page category-v2-course-detail">
      <section className="category-v2-subhero"><button className="back-link" type="button" onClick={() => navigate('/courses')}>← Back to course catalogue</button><div className="category-v2-course-badges"><span className="pill">{category?.name || course.category}</span>{course.pilot && <span className="pilot-badge">Pilot course</span>}{completed && <span className="category-v2-earned-chip">✓ Course certificate earned</span>}</div><h1>{course.title}</h1><p>{course.description}</p><div className="hero-actions"><button className="button button-primary" type="button" disabled={status.locked} onClick={startCourse}>{status.locked ? 'Dependency required' : completed ? 'Review course →' : 'Start Course →'}</button><button className="button button-outline" type="button" onClick={() => navigate(`/categories/${course.categorySlug}`)}>View Category</button></div>{message && <div className="category-v2-start-message">{message}</div>}<div className="category-v2-mini-stats"><span><b>{course.duration || 'TBC'}</b> duration</span><span><b>{course.pilot ? course.units?.length || 3 : 'TBC'}</b> units</span><span><b>Course certificate</b> on completion</span></div></section>

      {started && !course.pilot && <section className="category-v2-started"><span>✓</span><div><strong>Course started in the prototype</strong><p>The course is accessible, but detailed learning content has not yet been supplied for this mapped course. The prototype therefore does not invent units or lessons.</p></div>{!completed && <button className="button button-outline" type="button" onClick={() => onCompletePrototype(course.slug)}>Mark course complete (prototype)</button>}{completed && <b>Course certificate earned</b>}</section>}

      <section className="category-v2-course-body"><div className="category-v2-course-main"><section><span className="section-kicker">Learning outcomes</span><h2>Learning objectives</h2>{course.objectives?.length ? <ol className="category-v2-objectives">{course.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ol> : <div className="category-v2-content-pending"><strong>Objectives to be confirmed</strong><p>The map establishes the course topic, but detailed learning objectives have not yet been supplied.</p></div>}</section><section><span className="section-kicker">Mapped structure</span><h2>{course.pilot ? 'Units and lessons' : 'Topics from the BONSAI map'}</h2>{course.pilot && course.units?.length ? <div className="category-v2-unit-list">{course.units.map((unit, index) => <article key={unit.title}><span>Unit {index + 1}</span><strong>{unit.title}</strong><small>{unit.lessons?.length || 0} lesson{unit.lessons?.length === 1 ? '' : 's'}</small></article>)}</div> : course.topics?.length ? <div className="category-v2-topic-list">{course.topics.map((topic) => <span key={topic}>{topic}</span>)}</div> : <div className="category-v2-content-pending"><strong>Detailed course structure to be confirmed</strong><p>No lower-level topics are shown in the supplied map for this course.</p></div>}</section><RequirementsPanel course={course} completedCourseSlugs={completedCourseSlugs} /></div><aside className="category-v2-course-side"><span className="section-kicker">Achievement</span><h2>{courseCertificateName(course)}</h2><p>Complete this individual course to earn its course-level badge/certificate.</p><div className={completed ? 'category-v2-certificate-status earned' : 'category-v2-certificate-status'}>{completed ? '✓ Earned' : 'Not yet earned'}</div><hr /><span className="section-kicker">Specialist pathway</span><strong>{category?.specialistCertificate}</strong><p>Complete every course in {category?.name} to earn the Specialist Certificate.</p></aside></section>
    </main>
  );
}

function LearnerCategoryDashboard({ completedCourseSlugs }) {
  const completedCourses = BONSAI_COURSES.filter((course) => completedCourseSlugs.includes(course.slug));
  const specialistAwards = BONSAI_CATEGORIES.filter((category) => categoryProgress(category, completedCourseSlugs).specialistEarned);
  return (
    <main className="category-v2-page category-v2-learner-dashboard">
      <section className="category-v2-subhero"><span className="pill">Learner Dashboard</span><h1>My BONSAI learning</h1><p>Take courses across any Category and build progress toward specialist recognition.</p><div className="hero-actions"><button className="button button-primary" type="button" onClick={() => navigate('/courses')}>Browse courses →</button><button className="button button-outline" type="button" onClick={() => navigate('/')}>View Categories</button></div></section>
      <section className="category-v2-dashboard-body"><div className="category-v2-dashboard-stats"><article><span>Course certificates</span><strong>{completedCourses.length}</strong><small>one per completed course</small></article><article><span>Specialist Certificates</span><strong>{specialistAwards.length}</strong><small>one per completed Category</small></article><article><span>Categories in progress</span><strong>{BONSAI_CATEGORIES.filter((category) => { const p = categoryProgress(category, completedCourseSlugs); return p.completedCount > 0 && !p.specialistEarned; }).length}</strong><small>based on course completion</small></article></div><div className="category-v2-section-heading"><div><span className="section-kicker">Specialist pathways</span><h2>Progress by Category</h2></div></div><div className="category-v2-dashboard-category-grid">{BONSAI_CATEGORIES.map((category) => { const progress = categoryProgress(category, completedCourseSlugs); return <button type="button" key={category.slug} onClick={() => navigate(`/categories/${category.slug}`)}><div><strong>{category.name}</strong><span>{progress.completedCount}/{progress.totalCount} courses</span></div><div className="category-v2-progress"><span style={{ width: `${progress.percent}%` }} /></div><small>{progress.specialistEarned ? '✓ Specialist Certificate earned' : `${progress.percent}% toward Specialist Certificate`}</small></button>; })}</div><section className="category-v2-achievements"><span className="section-kicker">Achievements</span><h2>Certificates & badges</h2>{completedCourses.length || specialistAwards.length ? <div className="category-v2-achievement-list">{completedCourses.map((course) => <article key={course.slug}><span>Course</span><strong>{courseCertificateName(course)}</strong></article>)}{specialistAwards.map((category) => <article className="specialist" key={category.slug}><span>Specialist</span><strong>{category.specialistCertificate}</strong></article>)}</div> : <div className="category-v2-empty"><strong>No course certificates yet</strong><p>Complete any BONSAI course to earn the first course badge/certificate.</p></div>}</section></section>
    </main>
  );
}

function NotFound({ title }) {
  return <main className="category-v2-page"><section className="category-v2-subhero"><span className="pill">BONSAI-MOOC</span><h1>{title}</h1><p>The requested item is not part of the current mapped Category structure.</p><button className="button button-primary" type="button" onClick={() => navigate('/courses')}>Browse courses</button></section></main>;
}

function patchLegacyTerminology() {
  const roots = document.querySelectorAll('.admin-dashboard-page, .teacher-dashboard-page, .teacher-assigned-page, .teacher-progress-placeholder-page');
  roots.forEach((root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      let next = node.nodeValue || '';
      TEXT_REPLACEMENTS.forEach(([from, to]) => { next = next.split(from).join(to); });
      if (next !== node.nodeValue) node.nodeValue = next;
      node = walker.nextNode();
    }
    root.querySelectorAll('input[placeholder]').forEach((input) => {
      if (input.placeholder.toLowerCase().includes('track')) input.placeholder = input.placeholder.replace(/specialization track/gi, 'Category').replace(/track/gi, 'Category');
    });
  });
}

export default function CategoryArchitectureBridge() {
  const [host, setHost] = useState(null);
  const [route, setRoute] = useState(routeState);
  const [achievements, setAchievements] = useState(readAchievements);
  const [, setRequirementsVersion] = useState(0);

  useEffect(() => {
    let portalHost = document.getElementById('bonsai-category-v2-host');
    if (!portalHost) {
      portalHost = document.createElement('div');
      portalHost.id = 'bonsai-category-v2-host';
      const footer = document.querySelector('.site-footer');
      if (footer?.parentNode) footer.parentNode.insertBefore(portalHost, footer);
      else document.getElementById('root')?.appendChild(portalHost);
    }
    setHost(portalHost);

    function syncRoute() {
      const next = routeState();
      if (next.type === 'legacy-category') {
        const mapped = LEGACY_CATEGORY_ROUTES[next.slug];
        if (mapped) {
          replaceNavigate(`/categories/${mapped}`);
          return;
        }
      }
      setRoute(next);
    }

    function syncAchievements() { setAchievements(readAchievements()); }
    function syncRequirements() { setRequirementsVersion((value) => value + 1); }
    function inspectDom() {
      patchLegacyTerminology();
      if (document.querySelector('.learner-completion-page')) {
        const current = readAchievements();
        if (!current.completedCourseSlugs.includes(PILOT_COURSE_SLUG)) {
          setAchievements(writeAchievements({ completedCourseSlugs: [...current.completedCourseSlugs, PILOT_COURSE_SLUG] }));
        }
      }
    }

    const observer = new MutationObserver(inspectDom);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('bonsai:category-achievements-changed', syncAchievements);
    window.addEventListener('bonsai:course-requirements-changed', syncRequirements);
    syncRoute();
    inspectDom();
    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('bonsai:category-achievements-changed', syncAchievements);
      window.removeEventListener('bonsai:course-requirements-changed', syncRequirements);
    };
  }, []);

  useEffect(() => {
    const active = ['home', 'catalogue', 'category', 'course', 'learner'].includes(route.type);
    document.body.classList.toggle('bonsai-category-v2-active', active);
    document.body.classList.toggle('bonsai-category-v2-learner', route.type === 'learner');
    return () => {
      document.body.classList.remove('bonsai-category-v2-active');
      document.body.classList.remove('bonsai-category-v2-learner');
    };
  }, [route.type]);

  function completePrototypeCourse(slug) {
    const current = readAchievements();
    setAchievements(writeAchievements({ completedCourseSlugs: [...current.completedCourseSlugs, slug] }));
  }

  if (!host) return null;
  const completedCourseSlugs = achievements.completedCourseSlugs;
  let content = null;
  if (route.type === 'home') content = <HomePage completedCourseSlugs={completedCourseSlugs} />;
  if (route.type === 'catalogue') content = <CataloguePage completedCourseSlugs={completedCourseSlugs} />;
  if (route.type === 'category') content = <CategoryPage category={getCategoryBySlug(route.slug)} completedCourseSlugs={completedCourseSlugs} />;
  if (route.type === 'course') content = <CoursePage baseCourse={getCourseBySlug(route.slug)} completedCourseSlugs={completedCourseSlugs} onCompletePrototype={completePrototypeCourse} started={route.started} />;
  if (route.type === 'learner') content = <LearnerCategoryDashboard completedCourseSlugs={completedCourseSlugs} />;
  return content ? createPortal(content, host) : null;
}
