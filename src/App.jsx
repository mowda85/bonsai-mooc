import { useState } from 'react';

const BONSAI_LOGO = 'data:image/webp;base64,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';

const roles = {
  learner: {
    title: 'Learner',
    eyebrow: 'Learn & progress',
    description: 'Access courses, track your progress, complete activities, and continue learning.',
    destination: 'Learner Dashboard',
  },
  teacher: {
    title: 'Teacher',
    eyebrow: 'Create & guide',
    description: 'Create and manage courses, engage with learners, and review learning progress.',
    destination: 'Teacher Dashboard',
  },
};

function RoleSelection({ onSelect }) {
  return (
    <main className="role-page">
      <section className="welcome-panel">
        <span className="pill">BONSAI-MOOC prototype</span>
        <h1>Welcome to BONSAI-MOOC</h1>
        <p>A flexible learning platform for learners and educators working toward smarter, more sustainable communities.</p>
        <div className="auth-actions" aria-label="Mock authentication actions">
          <button className="button button-secondary" type="button">Login</button>
          <button className="button button-primary green" type="button">Register</button>
        </div>
      </section>

      <section className="role-section" aria-labelledby="role-heading">
        <div className="section-heading">
          <span>Prototype access</span>
          <h2 id="role-heading">Choose your experience</h2>
          <p>No real authentication is required for this prototype.</p>
        </div>

        <div className="role-grid">
          {Object.entries(roles).map(([key, role]) => (
            <article className={`role-card role-card-${key}`} key={key}>
              <div className="role-icon" aria-hidden="true">{key === 'learner' ? 'L' : 'T'}</div>
              <span className="role-eyebrow">{role.eyebrow}</span>
              <h3>View as {role.title}</h3>
              <p>{role.description}</p>
              <button className={`button role-button ${key}`} type="button" onClick={() => onSelect(key)}>
                Continue as {role.title}
                <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function PlaceholderDashboard({ role, onBack }) {
  const data = roles[role];
  return (
    <main className="dashboard-placeholder">
      <span className="pill">{data.title} view</span>
      <h1>{data.destination}</h1>
      <p>Role routing is working. This temporary destination will be replaced by the full {data.title.toLowerCase()} dashboard in its Jira task.</p>
      <button className="button button-primary" type="button" onClick={onBack}>Change role</button>
    </main>
  );
}

export default function App() {
  const [role, setRole] = useState(null);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setRole(null); }} aria-label="BONSAI home">
          <img className="brand-logo" src={BONSAI_LOGO} alt="BONSAI bonsai tree logo" />
          <span className="brand-name">BONSAI</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#about">About</a>
          <a href="#courses">Courses</a>
          <a href="#help">Help</a>
        </nav>
      </header>

      {role ? <PlaceholderDashboard role={role} onBack={() => setRole(null)} /> : <RoleSelection onSelect={setRole} />}

      <footer className="site-footer">
        <div className="footer-brand">
          <img src={BONSAI_LOGO} alt="BONSAI logo" />
          <div><strong>BONSAI-MOOC</strong><span>Smart learning for a sustainable future.</span></div>
        </div>
        <div className="footer-credit">
          <strong>Interreg North-West Europe</strong>
          <span>Co-funded by the European Union</span>
          <span>Bonsai</span>
        </div>
      </footer>
    </div>
  );
}
