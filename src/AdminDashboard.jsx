import { useEffect, useMemo, useState } from 'react';
import {
  approveCourseReview,
  getActiveCourseWorkflowState,
  prototypePublicationDefaults,
  prototypePublicationTitles,
  registerCourseContentChange,
} from './coursePublicationStore.js';
import {
  createOfficialCategory,
  deleteOfficialCategory,
  getOfficialCategories,
  moveOfficialCategory,
  updateOfficialCategory,
} from './officialLearningAreaStore.js';
import { BONSAI_COURSES } from './courseArchitecture.js';

const USER_STORAGE_KEY = 'bonsai-mooc.prototype.admin-users.v1';

const defaultUsers = [
  { id: 'BNS-1001', name: 'Alex Johnson', email: 'alex@bonsai.test', role: 'learner', blocked: false },
  { id: 'BNS-1002', name: 'Lea Martin', email: 'lea@bonsai.test', role: 'learner', blocked: false },
  { id: 'BNS-1003', name: 'Joris van Dijk', email: 'joris@bonsai.test', role: 'learner', blocked: false },
  { id: 'BNS-1004', name: 'Emma Clarke', email: 'emma@bonsai.test', role: 'learner', blocked: false },
  { id: 'BNS-2001', name: 'Dr. Anna Kontokosta', email: 'anna@bonsai.test', role: 'teacher', blocked: false },
  { id: 'BNS-2002', name: 'Dr. Martin Keller', email: 'martin@bonsai.test', role: 'teacher', blocked: false },
  { id: 'BNS-9001', name: 'BONSAI Administrator', email: 'admin@bonsai.test', role: 'admin', blocked: false },
];

function readUsers() {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(USER_STORAGE_KEY) || 'null');
    return Array.isArray(parsed) && parsed.length ? parsed : defaultUsers;
  } catch {
    return defaultUsers;
  }
}

function writeUsers(users) {
  try {
    window.sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Mock state can remain in memory if storage is unavailable.
  }
}

function currentReviews() {
  return Object.entries(prototypePublicationTitles).map(([slug, title]) => ({
    slug,
    title,
    state: getActiveCourseWorkflowState(slug, prototypePublicationDefaults[slug] || 'Draft'),
  }));
}

function StatCard({ label, value, detail }) {
  return <article className="admin-stat-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

export default function AdminDashboard({ user }) {
  const [section, setSection] = useState('overview');
  const [users, setUsers] = useState(readUsers);
  const [categories, setCategories] = useState(getOfficialCategories);
  const [reviews, setReviews] = useState(currentReviews);
  const [newCategory, setNewCategory] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const syncReviews = () => setReviews(currentReviews());
    const syncCategories = () => setCategories(getOfficialCategories());
    window.addEventListener('bonsai:publication-status-changed', syncReviews);
    window.addEventListener('bonsai:official-learning-areas-changed', syncCategories);
    return () => {
      window.removeEventListener('bonsai:publication-status-changed', syncReviews);
      window.removeEventListener('bonsai:official-learning-areas-changed', syncCategories);
    };
  }, []);

  useEffect(() => writeUsers(users), [users]);

  const analytics = useMemo(() => {
    const learners = users.filter((item) => item.role === 'learner').length;
    const teachers = users.filter((item) => item.role === 'teacher').length;
    const admins = users.filter((item) => item.role === 'admin').length;
    return {
      users: users.length,
      learners,
      teachers,
      admins,
      courses: BONSAI_COURSES.length,
      categories: categories.filter((item) => item.active).length,
      enrollments: 67,
      completions: 19,
    };
  }, [users, categories]);

  const reviewQueue = reviews.filter((item) => item.state?.status === 'Under Review');

  function changeRole(id, role) {
    setUsers((current) => current.map((item) => item.id === id ? { ...item, role } : item));
    setNotice('User role updated in prototype state.');
  }

  function toggleBlocked(id) {
    setUsers((current) => current.map((item) => item.id === id ? { ...item, blocked: !item.blocked } : item));
    setNotice('User status updated in prototype state.');
  }

  function approve(slug) {
    const next = approveCourseReview(slug, 'admin');
    setReviews(currentReviews());
    setNotice(next.status === 'Approved' ? 'Course review approved.' : 'Admin approval recorded; Lead Author approval is still required.');
  }

  function reject(slug) {
    registerCourseContentChange(slug, 'Admin review', 'Rejected by Admin — revise and resubmit', 'Draft');
    setReviews(currentReviews());
    setNotice('Course returned to Draft for revision.');
  }

  function addCategory(event) {
    event.preventDefault();
    if (!newCategory.trim()) return;
    setCategories(createOfficialCategory(newCategory));
    setNewCategory('');
    setNotice('Official Category created.');
  }

  function renameCategory(id, name) {
    setCategories(updateOfficialCategory(id, { name }));
    setNotice('Official Category renamed.');
  }

  function toggleCategory(id, active) {
    setCategories(updateOfficialCategory(id, { active }));
    setNotice(active ? 'Category activated for teacher assignment.' : 'Category deactivated from teacher assignment.');
  }

  function moveCategory(id, direction) {
    setCategories(moveOfficialCategory(id, direction));
    setNotice('Official Category order updated.');
  }

  function removeCategory(id) {
    setCategories(deleteOfficialCategory(id));
    setNotice('Category deleted from prototype governance.');
  }

  return (
    <main className="admin-dashboard-page">
      <section className="admin-hero">
        <div>
          <div className="admin-hero-badges"><span className="pill">Admin workspace</span><span className="admin-kicker">KAN-66</span></div>
          <h1>Admin Dashboard</h1>
          <p>Govern users, course review and the five-Category BONSAI learning structure from one prototype workspace.</p>
        </div>
        <aside><span>Signed in as</span><strong>{user.name}</strong><small>{user.id} · Admin</small></aside>
      </section>

      <nav className="admin-tabs" aria-label="Admin dashboard sections">
        {[
          ['overview', 'Overview'],
          ['reviews', `Course reviews${reviewQueue.length ? ` (${reviewQueue.length})` : ''}`],
          ['users', 'Users & roles'],
          ['structure', 'Categories'],
        ].map(([key, label]) => <button key={key} type="button" className={section === key ? 'active' : ''} onClick={() => { setSection(key); setNotice(''); }}>{label}</button>)}
      </nav>

      {notice && <div className="admin-notice" role="status">✓ {notice}</div>}

      {section === 'overview' && (
        <section className="admin-section-stack">
          <div className="admin-stat-grid">
            <StatCard label="Total users" value={analytics.users} detail={`${analytics.learners} learners · ${analytics.teachers} teachers · ${analytics.admins} admin`} />
            <StatCard label="Courses" value={analytics.courses} detail="Current mapped BONSAI course catalogue" />
            <StatCard label="Categories" value={analytics.categories} detail="Official active learning Categories" />
            <StatCard label="Completions" value={analytics.completions} detail="Prototype completed course enrollments" />
          </div>

          <div className="admin-overview-grid">
            <section className="admin-card">
              <span className="section-kicker">Role distribution</span><h2>Users by role</h2>
              <div className="admin-bars">
                {[
                  ['Learners', analytics.learners],
                  ['Teachers', analytics.teachers],
                  ['Admins', analytics.admins],
                ].map(([label, value]) => <div key={label}><div><strong>{label}</strong><span>{value}</span></div><progress max={analytics.users || 1} value={value} /></div>)}
              </div>
            </section>
            <section className="admin-card">
              <span className="section-kicker">Current architecture</span><h2>Open course access</h2>
              <ul className="admin-activity-list">
                <li><strong>Five Categories</strong><span>Erosion; Animal Activities / Burrows; Information Systems & Knowledge Dissemination; Vegetation / Biodiversity; Crisis Management.</span></li>
                <li><strong>Independent courses</strong><span>Learners may start any course unless an explicit required dependency is configured.</span></li>
                <li><strong>Course achievement</strong><span>Each completed course can award a badge/certificate.</span></li>
                <li><strong>Specialist achievement</strong><span>Completing every course in a Category can award its Specialist Certificate.</span></li>
              </ul>
            </section>
          </div>
        </section>
      )}

      {section === 'reviews' && (
        <section className="admin-card admin-wide-card">
          <span className="section-kicker">Course governance</span><h2>Courses waiting for review</h2><p>Admin approval is part of the existing publication workflow.</p>
          {reviewQueue.length ? <div className="admin-review-list">{reviewQueue.map(({ slug, title, state }) => (
            <article key={slug} className="admin-review-row">
              <div><strong>{title}</strong><span>Under Review · version {state.version || 1}</span><small>Lead Author: {state.leadAuthorApproved ? 'approved' : 'pending'} · Admin: {state.adminApproved ? 'approved' : 'pending'}</small></div>
              <div className="admin-row-actions"><button className="button button-primary" type="button" disabled={state.adminApproved} onClick={() => approve(slug)}>{state.adminApproved ? 'Admin approved' : 'Approve'}</button><button className="button button-outline" type="button" onClick={() => reject(slug)}>Reject to Draft</button></div>
            </article>
          ))}</div> : <div className="admin-empty">No courses are currently waiting for Admin review.</div>}
        </section>
      )}

      {section === 'users' && (
        <section className="admin-card admin-wide-card">
          <span className="section-kicker">User governance</span><h2>Users, roles & access</h2><p>Changes below are prototype-only mock state; no production identity provider or backend administration is connected.</p>
          <div className="admin-user-table" role="table" aria-label="Prototype users">
            <div className="admin-user-row admin-user-head" role="row"><span>User</span><span>Role</span><span>Status</span><span>Action</span></div>
            {users.map((item) => <div className="admin-user-row" role="row" key={item.id}>
              <div><strong>{item.name}</strong><small>{item.id} · {item.email}</small></div>
              <label><span className="sr-only">Role for {item.name}</span><select value={item.role} disabled={item.id === 'BNS-9001'} onChange={(event) => changeRole(item.id, event.target.value)}><option value="learner">Learner</option><option value="teacher">Teacher</option><option value="admin">Admin</option></select></label>
              <span className={`admin-status ${item.blocked ? 'blocked' : 'active'}`}>{item.blocked ? 'Blocked' : 'Active'}</span>
              <button type="button" className="button button-outline" disabled={item.id === 'BNS-9001'} onClick={() => toggleBlocked(item.id)}>{item.blocked ? 'Unblock' : 'Block'}</button>
            </div>)}
          </div>
        </section>
      )}

      {section === 'structure' && (
        <section className="admin-section-stack">
          <section className="admin-card admin-wide-card">
            <span className="section-kicker">Official learning structure</span><h2>BONSAI Categories</h2><p>These are the official course Categories available for learner discovery and teacher course assignment. Category membership does not create a prerequisite or lock by itself.</p>
            <form className="admin-add-track" onSubmit={addCategory}><input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="New Category name" /><button className="button button-primary" type="submit">Create Category</button></form>
            <div className="admin-track-list">{categories.map((category, index) => <article className="admin-track-row" key={category.id}>
              <span className="admin-track-order">{String(index + 1).padStart(2, '0')}</span>
              <label><span className="sr-only">Category name</span><input value={category.name} onChange={(event) => renameCategory(category.id, event.target.value)} /></label>
              <span className={`admin-status ${category.active ? 'active' : 'blocked'}`}>{category.active ? 'Active' : 'Inactive'}</span>
              <div className="admin-track-actions"><button type="button" disabled={index === 0} onClick={() => moveCategory(category.id, 'up')} aria-label={`Move ${category.name} up`}>↑</button><button type="button" disabled={index === categories.length - 1} onClick={() => moveCategory(category.id, 'down')} aria-label={`Move ${category.name} down`}>↓</button><button type="button" onClick={() => toggleCategory(category.id, !category.active)}>{category.active ? 'Deactivate' : 'Activate'}</button><button type="button" className="danger" onClick={() => removeCategory(category.id)}>Delete</button></div>
            </article>)}</div>
          </section>
        </section>
      )}
    </main>
  );
}
