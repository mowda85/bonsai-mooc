import { useState } from 'react';

const roles = {
  learner: {
    title: 'Learner',
    eyebrow: 'Learn & progress',
    description: 'Explore courses, complete lessons and quizzes, and follow your learning progress.',
    destination: 'Learner Dashboard',
  },
  teacher: {
    title: 'Teacher',
    eyebrow: 'Create & guide',
    description: 'Manage course content, preview learning experiences, and review learner progress.',
    destination: 'Teacher Dashboard',
  },
};

function RoleSelection({ onSelect }) {
  return (
    <main className="role-page">
      <section className="welcome-panel">
        <span className="pill">BONSAI-MOOC prototype</span>
        <h1>Welcome to BONSAI MOOC</h1>
        <p>
          Choose how you want to explore the prototype. No real account or password is required at this stage.
        </p>
        <div className="auth-actions" aria-label="Mock authentication actions">
          <button className="button button-primary" type="button">Login</button>
          <button className="button button-secondary" type="button">Register</button>
        </div>
      </section>

      <section className="role-section" aria-labelledby="role-heading">
        <div className="section-heading">
          <span>Prototype access</span>
          <h2 id="role-heading">Select your role</h2>
          <p>You can switch roles later; this selection only controls the prototype experience.</p>
        </div>

        <div className="role-grid">
          {Object.entries(roles).map(([key, role]) => (
            <article className={`role-card role-card-${key}`} key={key}>
              <div className="role-icon" aria-hidden="true">{key === 'learner' ? 'L' : 'T'}</div>
              <span className="role-eyebrow">{role.eyebrow}</span>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
              <button className={`button role-button ${key}`} type="button" onClick={() => onSelect(key)}>
                View as {role.title}
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
      <p>
        Role routing is working. This temporary destination will be replaced by the full {data.title.toLowerCase()} dashboard in its Jira task.
      </p>
      <button className="button button-primary" type="button" onClick={onBack}>Change role</button>
    </main>
  );
}

export default function App() {
  const [role, setRole] = useState(null);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setRole(null); }}>
          <span className="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
          <span><strong>BONSAI</strong><small>MOOC</small></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#about">About</a>
          <a href="#courses">Courses</a>
        </nav>
      </header>

      {role ? <PlaceholderDashboard role={role} onBack={() => setRole(null)} /> : <RoleSelection onSelect={setRole} />}

      <footer>Building knowledge for resilient and sustainable communities.</footer>
    </div>
  );
}
