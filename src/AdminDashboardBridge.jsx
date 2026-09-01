import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AdminDashboard from './AdminDashboard.jsx';

const prototypeAdmin = { id: 'BNS-9001', username: 'admin', name: 'BONSAI Administrator', role: 'admin' };

export default function AdminDashboardBridge() {
  const [host, setHost] = useState(null);

  useEffect(() => {
    function findAdminHost() {
      const candidates = Array.from(document.querySelectorAll('.dashboard-placeholder'));
      const candidate = candidates.find((item) => item.querySelector('h1')?.textContent === 'Admin Dashboard') || null;
      setHost((current) => current === candidate ? current : candidate);
    }

    findAdminHost();
    const observer = new MutationObserver(findAdminHost);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', findAdminHost);
    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', findAdminHost);
    };
  }, []);

  useEffect(() => {
    if (!host) return undefined;
    host.classList.add('admin-dashboard-host');
    return () => host.classList.remove('admin-dashboard-host');
  }, [host]);

  if (!host) return null;
  return createPortal(<AdminDashboard user={prototypeAdmin} />, host);
}
