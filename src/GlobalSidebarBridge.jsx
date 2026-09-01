import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

function locationKey() {
  return `${window.location.pathname}${window.location.search}`;
}

function navigate(path) {
  if (`${window.location.pathname}${window.location.search}` === path) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function readSession() {
  const actions = document.querySelector('.header-actions');
  const logout = Array.from(actions?.querySelectorAll('button') || []).find((button) => button.textContent?.trim().toLowerCase() === 'log out');
  const chipText = actions?.querySelector('.mock-session-chip strong')?.textContent?.toLowerCase() || '';
  let role = null;
  if (chipText.includes('learner')) role = 'learner';
  else if (chipText.includes('teacher')) role = 'teacher';
  else if (chipText.includes('admin')) role = 'admin';
  else if (window.location.pathname.startsWith('/learner')) role = 'learner';
  else if (window.location.pathname.startsWith('/teacher')) role = 'teacher';
  else if (window.location.pathname.startsWith('/admin')) role = 'admin';
  return { loggedIn: Boolean(logout), role };
}

function dashboardPath(role) {
  if (role === 'teacher') return '/teacher';
  if (role === 'admin') return '/admin';
  return '/learner';
}

function networkPath(role) {
  if (role === 'teacher') return '/teacher?space=teacher-networking';
  if (role === 'learner') return '/learner?space=student-networking';
  return null;
}

export default function GlobalSidebarBridge() {
  const [headerActions, setHeaderActions] = useState(null);
  const [open, setOpen] = useState(false);
  const [routeKey, setRouteKey] = useState(locationKey);
  const [session, setSession] = useState(readSession);

  useEffect(() => {
    let queued = false;
    const scan = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        const nextTarget = document.querySelector('.header-actions');
        setHeaderActions((current) => current === nextTarget ? current : nextTarget);
        const nextSession = readSession();
        setSession((current) => current.loggedIn === nextSession.loggedIn && current.role === nextSession.role ? current : nextSession);
      });
    };
    const handleRoute = () => {
      setRouteKey(locationKey());
      setOpen(false);
      scan();
    };
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('popstate', handleRoute);
    scan();
    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('global-sidebar-open', open);
    return () => document.body.classList.remove('global-sidebar-open');
  }, [open]);

  useEffect(() => {
    function onEscape(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, []);

  const items = useMemo(() => {
    const next = [
      { label: 'Homepage', icon: '⌂', path: '/' },
      { label: 'Courses', icon: '▤', path: '/courses' },
    ];
    if (session.loggedIn) {
      next.push({ label: 'Dashboard', icon: '◫', path: dashboardPath(session.role) });
      const networking = networkPath(session.role);
      if (networking) next.push({ label: 'Networking', icon: '◎', path: networking });
      if (session.role === 'learner') next.push({ label: 'Foundation', icon: '◇', path: '/foundation' });
      if (session.role === 'teacher') {
        next.push({ label: 'Progress & Results', icon: '↗', path: '/teacher?progress=information-systems-knowledge-dissemination' });
        next.push({ label: 'Feedback overview', icon: '◌', path: '/teacher?feedback=overview' });
      }
    } else {
      next.push({ label: 'Login', icon: '→', path: '/login' });
    }
    return next;
  }, [session.loggedIn, session.role, routeKey]);

  function logout() {
    const button = Array.from(document.querySelectorAll('.header-actions button')).find((item) => item.textContent?.trim().toLowerCase() === 'log out');
    if (button) button.click();
    setOpen(false);
  }

  const toggle = headerActions ? createPortal(
    <button
      className="global-sidebar-toggle"
      type="button"
      aria-label={open ? 'Hide navigation sidebar' : 'Open navigation sidebar'}
      aria-expanded={open}
      onClick={() => setOpen((current) => !current)}
    >
      <span aria-hidden="true">{open ? '×' : '☰'}</span>
      <span>Menu</span>
    </button>,
    headerActions,
  ) : null;

  const panel = createPortal(
    <>
      <button className={`global-sidebar-backdrop ${open ? 'is-open' : ''}`} type="button" aria-label="Hide navigation sidebar" onClick={() => setOpen(false)} />
      <aside className={`global-sidebar ${open ? 'is-open' : ''}`} aria-hidden={!open} aria-label="BONSAI-MOOC quick navigation">
        <div className="global-sidebar-head">
          <div className="global-sidebar-brand">
            <img src="/bonsai-logo.webp" alt="" aria-hidden="true" />
            <div><strong>BONSAI-MOOC</strong><span>Quick navigation</span></div>
          </div>
          <button type="button" className="global-sidebar-close" onClick={() => setOpen(false)} aria-label="Hide navigation sidebar">×</button>
        </div>

        <div className="global-sidebar-session">
          <span>{session.loggedIn ? `${session.role || 'User'} session` : 'Public navigation'}</span>
          <strong>{session.loggedIn ? 'Signed in' : 'Not signed in'}</strong>
        </div>

        <nav className="global-sidebar-nav" aria-label="Sidebar navigation">
          {items.map((item) => (
            <button
              key={`${item.label}-${item.path}`}
              type="button"
              className={`${locationKey() === item.path ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setOpen(false); }}
            >
              <span aria-hidden="true">{item.icon}</span>
              <strong>{item.label}</strong>
            </button>
          ))}
        </nav>

        <div className="global-sidebar-footer">
          {session.loggedIn ? (
            <button className="global-sidebar-logout" type="button" onClick={logout}><span aria-hidden="true">↪</span><strong>Log out</strong></button>
          ) : (
            <button className="global-sidebar-login" type="button" onClick={() => { navigate('/login'); setOpen(false); }}><span aria-hidden="true">→</span><strong>Login</strong></button>
          )}
          <button className="global-sidebar-hide" type="button" onClick={() => setOpen(false)}>Hide sidebar</button>
        </div>
      </aside>
    </>,
    document.body,
  );

  return <>{toggle}{panel}</>;
}
