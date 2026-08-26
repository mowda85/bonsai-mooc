import { useState } from 'react';

const mockUsers = [
  { id: 'BNS-1001', username: 'alex', name: 'Alex Johnson', role: 'learner' },
  { id: 'BNS-2001', username: 'anna', name: 'Dr. Anna Kontokosta', role: 'teacher' },
  { id: 'BNS-9001', username: 'admin', name: 'BONSAI Administrator', role: 'admin' },
];

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
        <p>Access high-quality courses, teaching tools and collaboration spaces for smarter, more sustainable cities.</p>
      </section>

      <section className="login-content">
        <div className="login-card" aria-labelledby="login-heading">
          <h2 id="login-heading">Login</h2>
          <p>Enter your BONSAI credentials to continue.</p>
          <form onSubmit={submit}>
            <label>
              Username or BONSAI ID
              <div className="input-shell">
                <span aria-hidden="true">♙</span>
                <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="e.g. alex or BNS-1001" autoComplete="username" />
              </div>
            </label>
            <label>
              Password
              <div className="input-shell">
                <span aria-hidden="true">▣</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
              </div>
            </label>

            <div className="form-options">
              <label className="remember"><input type="checkbox" /> Remember me</label>
              <button type="button" className="text-link">Forgot password?</button>
            </div>

            {error && <div className="login-error" role="alert">{error}</div>}
            <button className="button button-primary login-submit" type="submit">Login <span aria-hidden="true">→</span></button>
          </form>

          <div className="divider"><span>New to BONSAI-MOOC?</span></div>
          <button type="button" className="button button-outline register-wide">Create an account</button>
          <div className="demo-note">Prototype environment — no real authentication backend is connected yet.</div>
        </div>

        <aside className="help-card" aria-label="Login help">
          <h2>Need help?</h2>
          <div className="help-rule" />
          <div className="help-item"><span className="help-icon">?</span><div><strong>Check our FAQs</strong><p>Find answers to common questions.</p><button type="button" className="text-link">View FAQs</button></div></div>
          <div className="help-item"><span className="help-icon">✉</span><div><strong>Contact support</strong><p>We are here to help.</p><button type="button" className="text-link">Contact us</button></div></div>
          <div className="help-item"><span className="help-icon">▤</span><div><strong>User guide</strong><p>Learn how to make the most of BONSAI-MOOC.</p><button type="button" className="text-link">Open user guide</button></div></div>
        </aside>
      </section>

      <div className="security-strip"><span aria-hidden="true">✓</span><div><strong>Secure access</strong><p>Prototype login data stays inside this demo session.</p></div></div>
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

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); if (user) setUser(null); }}>
          <img src="/bonsai-logo.webp" alt="BONSAI project tree logo" />
          <span><strong>BONSAI</strong><small>MOOC FOR SMART CITIES</small></span>
        </a>
        <nav aria-label="Primary navigation"><a href="#about">About</a><a href="#courses">Courses</a><a href="#news">News</a><a href="#contact">Contact</a></nav>
        {!user && <button type="button" className="button button-outline header-register">Register</button>}
      </header>

      {user ? <PlaceholderDashboard user={user} onLogout={() => setUser(null)} /> : <LoginPage onLogin={setUser} />}

      <footer className="site-footer">
        <div className="footer-brand">
          <img src="/bonsai-logo.webp" alt="" aria-hidden="true" />
          <div><strong>BONSAI-MOOC</strong><span>Building a greener future through accessible online education.</span></div>
        </div>
        <div className="footer-links"><a href="#about">About</a><a href="#courses">Courses</a><a href="#news">News</a><a href="#contact">Contact</a><a href="#privacy">Privacy Policy</a></div>
        <div className="funding-credit">
          <div className="interreg-text"><strong>Interreg</strong><span>North-West Europe</span><b>Bonsai</b></div>
          <div className="eu-credit"><img src="/eu-flag.svg" alt="European Union flag" /><span>Co-funded by<br /><strong>the European Union</strong></span></div>
        </div>
      </footer>
    </div>
  );
}
