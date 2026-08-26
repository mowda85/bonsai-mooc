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
      <section className="login-intro">
        <span className="pill">BONSAI-MOOC prototype</span>
        <h1>Learn. Connect. Build.</h1>
        <h2>Shaping the cities of tomorrow.</h2>
        <p>Access learning, teaching and collaboration tools for smarter and more sustainable cities.</p>
      </section>
      <section className="login-card" aria-labelledby="login-heading">
        <h2 id="login-heading">Welcome to BONSAI</h2>
        <p>Sign in to continue to your workspace.</p>
        <form onSubmit={submit}>
          <label>Username or BONSAI ID<input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="e.g. BNS-1001" autoComplete="username" /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" autoComplete="current-password" /></label>
          {error && <div className="login-error" role="alert">{error}</div>}
          <button className="button button-primary login-submit" type="submit">Login</button>
        </form>
        <div className="register-row"><span>New to BONSAI?</span><button type="button" className="text-button">Register</button></div>
        <div className="demo-note">Prototype only — your account role is resolved automatically.</div>
      </section>
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
          <img src="/bonsai-logo.webp" alt="BONSAI" />
          <span><strong>BONSAI</strong><small>Smart Learning for a Sustainable Future</small></span>
        </a>
        <nav aria-label="Primary navigation"><a href="#about">About</a><a href="#courses">Courses</a><a href="#help">Help</a></nav>
      </header>
      {user ? <PlaceholderDashboard user={user} onLogout={() => setUser(null)} /> : <LoginPage onLogin={setUser} />}
      <footer><div><strong>Interreg North-West Europe</strong><span>Co-funded by the European Union</span></div><p>BONSAI is part of the Interreg North-West Europe programme.</p></footer>
    </div>
  );
}
