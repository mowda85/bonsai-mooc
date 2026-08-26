import { useEffect, useMemo, useState } from 'react';

const mockUsers = [
  { id: 'BNS-1001', username: 'alex', name: 'Alex Johnson', role: 'learner' },
  { id: 'BNS-2001', username: 'anna', name: 'Dr. Anna Kontokosta', role: 'teacher' },
  { id: 'BNS-9001', username: 'admin', name: 'BONSAI Administrator', role: 'admin' },
];

const specializationTracks = [
  {
    slug: 'dike-stability-erosion',
    title: 'Dike Stability and Erosion',
    eyebrow: 'Specialization 01',
    description: 'Explore the behaviour, assessment and resilience of flood-defence structures under changing conditions.',
  },
  {
    slug: 'animal-activities-burrows',
    title: 'Animal Activities and Burrows',
    eyebrow: 'Specialization 02',
    description: 'Study how animal activity can affect levees and how flood managers can monitor and respond to those risks.',
  },
  {
    slug: 'vegetation-nature-based-solutions',
    title: 'Vegetation and Nature-based Solutions',
    eyebrow: 'Specialization 03',
    description: 'Learn how vegetation, biodiversity and nature-based approaches can contribute to resilient flood defences.',
  },
  {
    slug: 'flood-risk-emergency-management',
    title: 'Flood Risk and Emergency Management',
    eyebrow: 'Specialization 04',
    description: 'Build knowledge in preparedness, disaster management, response planning and flood-resilience practice.',
  },
];

const mockCourses = [
  { title: 'Information Systems and Knowledge Dissemination', area: 'Foundation', description: 'Data, information, knowledge and knowledge sharing in the BONSAI context.' },
  { title: 'Introduction to Flood Resilience', area: 'Foundation', description: 'Core concepts that support later BONSAI learning pathways.' },
  { title: 'Levee Stability Fundamentals', area: 'Dike Stability and Erosion', description: 'An introduction to flood-defence stability and failure mechanisms.' },
  { title: 'Erosion and Levee Covers', area: 'Dike Stability and Erosion', description: 'How soil, climate and surface conditions influence erosion resistance.' },
  { title: 'Animal Activity in Flood Defences', area: 'Animal Activities and Burrows', description: 'Monitoring and managing the effects of burrowing animals on levees.' },
  { title: 'Vegetation for Resilient Levees', area: 'Vegetation and Nature-based Solutions', description: 'Vegetation, biodiversity and resilience in flood-defence systems.' },
  { title: 'Nature-based Flood Defence', area: 'Vegetation and Nature-based Solutions', description: 'Nature-based approaches for resilient estuarine systems.' },
  { title: 'Flood Emergency Preparedness', area: 'Flood Risk and Emergency Management', description: 'Preparedness, communication and response during flood threats.' },
];

function navigate(path) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
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
        {isPublic ? (
          <>
            {path !== '/login' && <button type="button" className="button button-ghost" onClick={() => navigate('/login')}>Login</button>}
            <button type="button" className="button button-outline">Register</button>
          </>
        ) : (
          <button type="button" className="button button-outline" onClick={onLogout}>Log out</button>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <img src="/bonsai-logo.webp" alt="" aria-hidden="true" />
        <div><strong>BONSAI-MOOC</strong><span>Learning and knowledge transfer for flood resilience in North-West Europe.</span></div>
      </div>
      <div className="footer-links"><a href="#about">About</a><button type="button" onClick={() => navigate('/courses')}>Courses</button><a href="#contact">Contact</a><a href="#privacy">Privacy Policy</a></div>
      <div className="funding-credit">
        <div className="interreg-text"><strong>Interreg</strong><span>North-West Europe</span><b>BONSAI</b></div>
        <div className="eu-credit"><img src="/eu-flag.svg" alt="European Union flag" /><span>Co-funded by<br /><strong>the European Union</strong></span></div>
      </div>
    </footer>
  );
}

function Homepage() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const results = useMemo(() => {
    const normalized = submittedQuery.trim().toLowerCase();
    if (!normalized) return [];
    return mockCourses.filter((course) => `${course.title} ${course.area} ${course.description}`.toLowerCase().includes(normalized));
  }, [submittedQuery]);

  function search(event) {
    event.preventDefault();
    setSubmittedQuery(query);
  }

  return (
    <main className="homepage">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="pill">BONSAI learning platform</span>
          <h1>Build the knowledge to strengthen flood resilience.</h1>
          <p>Start with a shared Foundation, then continue into the BONSAI specialization area that best matches your interests and professional needs.</p>
          <div className="hero-actions">
            <button className="button button-primary" type="button" onClick={() => navigate('/foundation')}>Start with the Foundation <span aria-hidden="true">→</span></button>
            <button className="button button-outline" type="button" onClick={() => navigate('/courses')}>Browse all courses</button>
          </div>
        </div>
        <div className="home-hero-panel" aria-label="BONSAI learning pathway">
          <div className="path-step path-foundation"><span>1</span><div><strong>Foundation</strong><small>Common knowledge for everyone</small></div></div>
          <div className="path-line" />
          <div className="path-step"><span>2</span><div><strong>Choose a specialization</strong><small>Continue based on your area of interest</small></div></div>
          <div className="path-tags"><span>Dikes</span><span>Animals</span><span>Vegetation</span><span>Emergency</span></div>
        </div>
      </section>

      <section className="search-section" aria-labelledby="course-search-heading">
        <div>
          <span className="section-kicker">Course discovery</span>
          <h2 id="course-search-heading">What would you like to learn?</h2>
        </div>
        <form className="course-search" onSubmit={search}>
          <label className="sr-only" htmlFor="course-search">Search courses</label>
          <input id="course-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by topic, course or specialization" />
          <button className="button button-primary" type="submit">Search</button>
        </form>
        {submittedQuery && (
          <div className="search-results" aria-live="polite">
            <div className="search-results-head"><strong>{results.length} result{results.length === 1 ? '' : 's'}</strong><button type="button" className="text-link" onClick={() => { setQuery(''); setSubmittedQuery(''); }}>Clear search</button></div>
            {results.length ? results.map((course) => (
              <button className="search-result-card" type="button" key={course.title} onClick={() => navigate('/courses')}>
                <span>{course.area}</span><strong>{course.title}</strong><p>{course.description}</p>
              </button>
            )) : <div className="empty-result">No prototype courses match “{submittedQuery}”. Try a broader keyword.</div>}
          </div>
        )}
      </section>

      <section className="foundation-section" aria-labelledby="foundation-heading">
        <div className="foundation-copy">
          <span className="section-kicker">Your starting point</span>
          <h2 id="foundation-heading">Foundation</h2>
          <p>The Foundation is the shared core of BONSAI-MOOC. It gives every learner the common concepts and context needed before moving into a specialization.</p>
          <div className="foundation-meta"><span>Common core</span><span>Recommended first</span><span>For every learner</span></div>
          <button className="button button-primary" type="button" onClick={() => navigate('/foundation')}>Explore the Foundation</button>
        </div>
        <div className="foundation-visual" aria-hidden="true">
          <div className="foundation-tree">BONSAI</div>
          <div className="foundation-branches"><span>Understand</span><span>Connect</span><span>Apply</span></div>
        </div>
      </section>

      <section className="tracks-section" aria-labelledby="tracks-heading">
        <div className="section-heading-row">
          <div><span className="section-kicker">After the Foundation</span><h2 id="tracks-heading">Choose your specialization</h2><p>Continue into one or more areas that match your role, interests or learning goals.</p></div>
          <button className="button button-outline" type="button" onClick={() => navigate('/courses')}>Browse all courses</button>
        </div>
        <div className="track-grid">
          {specializationTracks.map((track, index) => (
            <button className="track-card" type="button" key={track.slug} onClick={() => navigate(`/tracks/${track.slug}`)}>
              <span className="track-number">0{index + 1}</span>
              <span className="track-eyebrow">{track.eyebrow}</span>
              <strong>{track.title}</strong>
              <p>{track.description}</p>
              <span className="track-link">Explore track <b aria-hidden="true">→</b></span>
            </button>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div><span className="section-kicker">Ready to begin?</span><h2>Explore BONSAI learning at your own pace.</h2><p>Browse the learning offer now, then sign in when you are ready to continue your learner, teacher or admin journey.</p></div>
        <div className="hero-actions"><button className="button button-primary" type="button" onClick={() => navigate('/login')}>Login</button><button className="button button-outline" type="button">Register</button></div>
      </section>
    </main>
  );
}

function LoginPage({ onLogin }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    const value = identifier.trim().toLowerCase();
    const user = mockUsers.find((item) => item.username.toLowerCase() === value || item.id.toLowerCase() === value);
    if (!user || !password.trim()) {
      setError('Please enter a valid prototype username/BONSAI ID and password.');
      return;
    }
    setError('');
    onLogin(user);
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <span className="pill">BONSAI-MOOC prototype</span>
        <h1>Welcome to BONSAI-MOOC</h1>
        <div className="hero-rule" />
        <p>Access BONSAI courses, teaching tools and collaboration spaces focused on flood resilience, disaster management and knowledge transfer.</p>
      </section>

      <section className="login-content">
        <div className="login-card" aria-labelledby="login-heading">
          <h2 id="login-heading">Login</h2>
          <p>Enter your BONSAI credentials to continue.</p>
          <form onSubmit={submit}>
            <label>Username or BONSAI ID<div className="input-shell"><span aria-hidden="true">♙</span><input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="e.g. alex or BNS-1001" autoComplete="username" /></div></label>
            <label>Password<div className="input-shell"><span aria-hidden="true">▣</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" /></div></label>
            <div className="form-options"><label className="remember"><input type="checkbox" /> Remember me</label><button type="button" className="text-link">Forgot password?</button></div>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button className="button button-primary login-submit" type="submit">Login <span aria-hidden="true">→</span></button>
          </form>
          <div className="divider"><span>New to BONSAI-MOOC?</span></div>
          <button type="button" className="button button-outline register-wide">Create an account</button>
          <div className="demo-note">Prototype environment — no real authentication backend is connected yet.</div>
        </div>

        <aside className="help-card" aria-label="Login help">
          <h2>Need help?</h2><div className="help-rule" />
          <div className="help-item"><span className="help-icon">?</span><div><strong>Check our FAQs</strong><p>Find answers to common questions.</p><button type="button" className="text-link">View FAQs</button></div></div>
          <div className="help-item"><span className="help-icon">✉</span><div><strong>Contact support</strong><p>We are here to help.</p><button type="button" className="text-link">Contact us</button></div></div>
          <div className="help-item"><span className="help-icon">▤</span><div><strong>User guide</strong><p>Learn how to make the most of BONSAI-MOOC.</p><button type="button" className="text-link">Open user guide</button></div></div>
        </aside>
      </section>
    </main>
  );
}

function PlaceholderPage({ eyebrow, title, description }) {
  return (
    <main className="placeholder-page">
      <span className="pill">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="placeholder-actions"><button className="button button-primary" type="button" onClick={() => navigate('/')}>Back to homepage</button><button className="button button-outline" type="button" onClick={() => navigate('/login')}>Login</button></div>
    </main>
  );
}

function PlaceholderDashboard({ user, onLogout }) {
  const labels = { learner: 'Learner Dashboard', teacher: 'Teacher Dashboard', admin: 'Admin Dashboard' };
  return (
    <main className="dashboard-placeholder">
      <span className="pill">{user.role} workspace</span>
      <h1>{labels[user.role]}</h1>
      <p>Welcome, {user.name}. Your account role routed you here automatically. This temporary destination will be replaced by the full {user.role} experience in its Jira task.</p>
      <button className="button button-primary" type="button" onClick={onLogout}>Log out</button>
    </main>
  );
}

function pageForPath(path, user, setUser) {
  if (user) return <PlaceholderDashboard user={user} onLogout={() => { setUser(null); navigate('/'); }} />;
  if (path === '/login') return <LoginPage onLogin={(nextUser) => setUser(nextUser)} />;
  if (path === '/foundation') return <PlaceholderPage eyebrow="Foundation" title="Foundation learning area" description="The Foundation page will be expanded in its dedicated learning-page work. For KAN-17, this confirms that Foundation is a separate common starting point rather than a specialization track." />;
  if (path === '/courses') return <PlaceholderPage eyebrow="Course catalogue" title="Browse all BONSAI courses" description="The full catalogue will be implemented in KAN-19. This placeholder keeps the KAN-17 navigation flow working now." />;
  if (path.startsWith('/tracks/')) {
    const slug = path.split('/').filter(Boolean)[1];
    const track = specializationTracks.find((item) => item.slug === slug);
    return <PlaceholderPage eyebrow="Specialization track" title={track?.title || 'BONSAI specialization'} description="The full track page will be implemented in KAN-18. This placeholder confirms the homepage navigation path." />;
  }
  return <Homepage />;
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname || '/');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleLocation = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  return (
    <div className="app-shell">
      <Header path={path} user={user} onLogout={() => { setUser(null); navigate('/'); }} />
      {pageForPath(path, user, setUser)}
      <Footer />
    </div>
  );
}
