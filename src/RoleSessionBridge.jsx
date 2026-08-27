import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const roleHomePaths = {
  learner: '/learner',
  teacher: '/teacher',
  admin: '/admin',
};

const roleLabels = {
  learner: 'Learner',
  teacher: 'Teacher',
  admin: 'Admin',
};

function protectedRoleForPath(path) {
  if (path === '/learner') return 'learner';
  if (path === '/teacher') return 'teacher';
  if (path === '/admin') return 'admin';
  return null;
}

function locationKey() {
  return `${window.location.pathname}${window.location.search}`;
}

function replaceNavigate(path) {
  if (window.location.pathname === path && !window.location.search) return;
  window.history.replaceState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function RoleSessionBridge() {
  const [session, setSession] = useState(null);
  const [headerActions, setHeaderActions] = useState(null);
  const [, setRouteKey] = useState(locationKey);
  const pendingLoginRef = useRef(null);
  const pendingExpiryRef = useRef(null);

  useEffect(() => {
    let scanQueued = false;

    function scanHeader() {
      if (scanQueued) return;
      scanQueued = true;
      window.requestAnimationFrame(() => {
        scanQueued = false;
        const target = document.querySelector('.header-actions');
        setHeaderActions((current) => current === target ? current : target);
      });
    }

    function normalizeRoute(path) {
      const protectedRole = protectedRoleForPath(path);
      const pendingLogin = pendingLoginRef.current;

      if (pendingLogin && protectedRole) {
        window.clearTimeout(pendingExpiryRef.current);
        pendingExpiryRef.current = null;
        pendingLoginRef.current = null;
        setSession({
          identifier: pendingLogin.identifier,
          role: protectedRole,
        });
        return;
      }

      setSession((current) => {
        if (!current) {
          if (protectedRole) {
            window.setTimeout(() => replaceNavigate('/login'), 0);
          }
          return current;
        }

        const home = roleHomePaths[current.role];
        if (path === '/login' || (protectedRole && protectedRole !== current.role)) {
          window.setTimeout(() => replaceNavigate(home), 0);
        }
        return current;
      });
    }

    function handleRoute() {
      const path = window.location.pathname || '/';
      setRouteKey(locationKey());
      normalizeRoute(path);
      scanHeader();
    }

    function captureLogin(event) {
      const form = event.target.closest?.('.login-card form');
      if (!form) return;
      const identifier = form.querySelector('input[autocomplete="username"]')?.value?.trim() || '';
      const password = form.querySelector('input[autocomplete="current-password"]')?.value?.trim() || '';
      if (!identifier || !password) {
        pendingLoginRef.current = null;
        return;
      }

      pendingLoginRef.current = { identifier };
      window.clearTimeout(pendingExpiryRef.current);
      pendingExpiryRef.current = window.setTimeout(() => {
        pendingLoginRef.current = null;
        pendingExpiryRef.current = null;
      }, 1200);
    }

    function captureLogout(event) {
      const button = event.target.closest?.('button');
      if (!button) return;
      const text = button.textContent?.trim().toLowerCase() || '';
      if (text !== 'log out') return;
      window.clearTimeout(pendingExpiryRef.current);
      pendingExpiryRef.current = null;
      pendingLoginRef.current = null;
      setSession(null);
    }

    const observer = new MutationObserver(scanHeader);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('submit', captureLogin, true);
    document.addEventListener('click', captureLogout, true);
    window.addEventListener('popstate', handleRoute);
    handleRoute();
    scanHeader();

    return () => {
      observer.disconnect();
      document.removeEventListener('submit', captureLogin, true);
      document.removeEventListener('click', captureLogout, true);
      window.removeEventListener('popstate', handleRoute);
      window.clearTimeout(pendingExpiryRef.current);
    };
  }, []);

  if (!session || !headerActions) return null;

  return createPortal(
    <span className="mock-session-chip" aria-label={`Active mock session: ${roleLabels[session.role] || session.role}`}>
      <span className="mock-session-dot" aria-hidden="true" />
      <span>
        <strong>{roleLabels[session.role] || session.role} session</strong>
        <small>{session.identifier}</small>
      </span>
    </span>,
    headerActions,
  );
}
