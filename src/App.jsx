import { useEffect, useState } from 'react';
import LearnerDashboard from './LearnerDashboard.jsx';
import { PILOT_COURSE_SLUG, PILOT_COURSE_UNITS } from './courseArchitecture.js';

const ACTIVE_USER_KEY = 'bonsai-mooc.prototype.active-user.v1';

const mockUsers = [
  { id: 'BNS-1001', username: 'alex', name: 'Alex Johnson', role: 'learner' },
  { id: 'BNS-2001', username: 'anna', name: 'Dr. Anna Kontokosta', role: 'teacher' },
  { id: 'BNS-9001', username: 'admin', name: 'BONSAI Administrator', role: 'admin' },
];

const pilotLearnerProgress = {
  learnerId: 'BNS-1001',
  currentCourse: {
    slug: PILOT_COURSE_SLUG,
    completedUnits: [],
    totalUnits: PILOT_COURSE_UNITS.length,
    completedActivityIds: [],
    quizResult: null,
  },
  certificates: [],
};

function navigate(path) {
  if (`${window.location.pathname}${window.location.search}` === path) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function roleHomePath(role) {
  if (role === 'learner') return '/learner';
  if (role === 'teacher') return '/teacher';
  return '/admin';
}

function Header({ routeKey, user, onLogout }) {
  const pathname = routeKey.split('?')[0];
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
        {!user ? (
          <>
            {pathname !== '/login' && <button type="button" className="button button-ghost" onClick={() => navigate('/login')}>Login</button>}
            <button type="button" className="button button-outline">Register</button>
          </>
        ) : (
          <>
            <button type="button" className="button button-ghost" onClick={() => navigate(roleHomePath(user.role))}>Dashboard</button>
            <button type="button" className="button button-outline" onClick={onLogout}>Log out</button>
          </>
        )}
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
      <section className="login-hero"><span className="pill">BONSAI-MOOC prototype</span><h1>Welcome to BONSAI-MOOC</h1><div className="hero-rule" /><p>Access BONSAI courses, teaching tools and collaboration spaces focused on flood resilience, disaster management and knowledge transfer.</p></section>
      <section className="login-content">
        <div className="login-card" aria-labelledby="login-heading">
          <h2 id="login-heading">Login</h2><p>Enter your BONSAI credentials to continue.</p>
          <form onSubmit={submit}>
            <label>Username or BONSAI ID<div className="input-shell"><span aria-hidden="true">♙</span><input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="e.g. alex or BNS-1001" autoComplete="username" /></div></label>
            <label>Password<div className="input-shell"><span aria-hidden="true">▣</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" /></div></label>
            <div className="form-options"><label className="remember"><input type="checkbox" /> Remember me</label><button type="button" className="text-link">Forgot password?</button></div>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button className="button button-primary login-submit" type="submit">Login <span aria-hidden="true">→</span></button>
          </form>
          <div className="divider"><span>New to BONSAI-MOOC?</span></div><button type="button" className="button button-outline register-wide">Create an account</button><div className="demo-note">Prototype environment — no real authentication backend is connected yet.</div>
        </div>
        <aside className="help-card" aria-label="Login help"><h2>Need help?</h2><div className="help-rule" /><div className="help-item"><span className="help-icon">?</span><div><strong>Check our FAQs</strong><p>Find answers to common questions.</p><button type="button" className="text-link">View FAQs</button></div></div><div className="help-item"><span className="help-icon">✉</span><div><strong>Contact support</strong><p>We are here to help.</p><button type="button" className="text-link">Contact us</button></div></div><div className="help-item"><span className="help-icon">▤</span><div><strong>User guide</strong><p>Learn how to make the most of BONSAI-MOOC.</p><button type="button" className="text-link">Open user guide</button></div></div></aside>
      </section>
    </main>
  );
}

function PlaceholderDashboard({ user, onLogout }) {
  const labels = { teacher: 'Teacher Dashboard', admin: 'Admin Dashboard' };
  return <main className="dashboard-placeholder"><span className="pill">{user.role} workspace</span><h1>{labels[user.role] || 'Dashboard'}</h1><p>Welcome, {user.name}. Loading your BONSAI {user.role} workspace.</p><button className="button button-primary" type="button" onClick={onLogout}>Log out</button></main>;
}

function pageForRoute({ routeKey, user, onLogin, onLogout }) {
  const pathname = routeKey.split('?')[0];
  if (pathname === '/login') return user ? pageForRoute({ routeKey: roleHomePath(user.role), user, onLogin, onLogout }) : <LoginPage onLogin={onLogin} />;
  if (pathname === '/learner') return user?.role === 'learner' ? <LearnerDashboard user={user} progress={pilotLearnerProgress} onNavigate={navigate} /> : <LoginPage onLogin={onLogin} />;
  if (pathname === '/teacher') return user?.role === 'teacher' ? <PlaceholderDashboard user={user} onLogout={onLogout} /> : <LoginPage onLogin={onLogin} />;
  if (pathname === '/admin') return user?.role === 'admin' ? <PlaceholderDashboard user={user} onLogout={onLogout} /> : <LoginPage onLogin={onLogin} />;

  // Public home, catalogue, Category, course and legacy redirect routes are rendered by CategoryArchitectureBridge.
  return <main className="category-route-placeholder" style={{ display: 'none' }} aria-hidden="true" />;
}

export default function App() {
  const [routeKey, setRouteKey] = useState(`${window.location.pathname}${window.location.search}` || '/');
  const [user, setUser] = useState(null);

  function handleLogin(nextUser) {
    setUser(nextUser);
    try {
      window.sessionStorage.setItem(ACTIVE_USER_KEY, JSON.stringify({
        id: nextUser.id,
        username: nextUser.username,
        name: nextUser.name,
        role: nextUser.role,
      }));
    } catch {
      // The in-memory user state still keeps the current prototype session usable.
    }
    navigate(roleHomePath(nextUser.role));
  }

  function handleLogout() {
    setUser(null);
    try {
      window.sessionStorage.removeItem(ACTIVE_USER_KEY);
    } catch {
      // Ignore storage cleanup failures in the prototype.
    }
    navigate('/');
  }

  useEffect(() => {
    const handleLocation = () => setRouteKey(`${window.location.pathname}${window.location.search}` || '/');
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  return <div className="app-shell"><Header routeKey={routeKey} user={user} onLogout={handleLogout} />{pageForRoute({ routeKey, user, onLogin: handleLogin, onLogout: handleLogout })}<Footer /></div>;
}
