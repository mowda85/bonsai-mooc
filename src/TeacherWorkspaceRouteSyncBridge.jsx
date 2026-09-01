import { useEffect } from 'react';

function locationKey() {
  return `${window.location.pathname}${window.location.search}`;
}

export default function TeacherWorkspaceRouteSyncBridge() {
  useEffect(() => {
    let lastKey = locationKey();
    let queued = false;

    function syncIfNeeded() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        const nextKey = locationKey();
        if (nextKey === lastKey) return;
        lastKey = nextKey;
        if (window.location.pathname !== '/teacher') return;
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
    }

    const observer = new MutationObserver(syncIfNeeded);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
