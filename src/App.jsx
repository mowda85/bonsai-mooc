import { useState } from 'react';

const BONSAI_LOGO = 'data:image/webp;base64,UklGRhQqAABXRUJQVlA4IAgqAAAwoQCdASrgAWUBPm02l0ikIyIhJFMJOIANiU3fj5Mi+EfKbXyoYuv/...';
const FUNDING_CREDIT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAm0AAADPCAYAAACnQOZyAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8/...';

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
          <span>Project funding and programme credit</span>
          <img src={FUNDING_CREDIT} alt="Interreg North-West Europe and European Union co-funding credit" />
        </div>
      </footer>
    </div>
  );
}
