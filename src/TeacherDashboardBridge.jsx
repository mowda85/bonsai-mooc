import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import TeacherDashboard from './TeacherDashboard.jsx';

const prototypeTeacher = { id: 'BNS-2001', username: 'anna', name: 'Dr. Anna Kontokosta', role: 'teacher' };

function navigate(path) {
  if (window.location.pathname === path && !window.location.search) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function TeacherDashboardBridge() {
  const [host, setHost] = useState(null);

  useEffect(() => {
    function findTeacherHost() {
      const candidate = document.querySelector('.dashboard-placeholder');
      const isTeacherPlaceholder = candidate?.querySelector('h1')?.textContent === 'Teacher Dashboard';
      setHost(isTeacherPlaceholder ? candidate : null);
    }

    findTeacherHost();
    const observer = new MutationObserver(findTeacherHost);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', findTeacherHost);
    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', findTeacherHost);
    };
  }, []);

  useEffect(() => {
    if (!host) return undefined;
    host.classList.add('teacher-dashboard-host');
    return () => host.classList.remove('teacher-dashboard-host');
  }, [host]);

  if (!host) return null;
  return createPortal(<TeacherDashboard user={prototypeTeacher} onNavigate={navigate} />, host);
}
