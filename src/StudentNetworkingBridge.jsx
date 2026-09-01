import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const SPACE_KEY = 'student-networking';

const samplePosts = [
  {
    type: 'Learner Q&A',
    badge: 'Question',
    initials: 'LM',
    author: 'Lea Martin',
    institution: 'Université Gustave Eiffel',
    time: '18 min ago',
    title: 'How would you explain data → information → knowledge in a flood-risk example?',
    body: 'I understand the definitions in Unit 1, but I would like to compare examples from different cities before I write my reflection. What would count as the “knowledge” step in a real decision-making situation?',
    meta: 'Sample discussion · 4 prototype replies',
  },
  {
    type: 'Focus group',
    badge: 'Looking for teammates',
    initials: 'JV',
    author: 'Joris van Dijk',
    institution: 'TU Delft',
    time: '1 h ago',
    title: 'Anyone from another university working on the same case study?',
    body: 'I am reviewing the information-systems case study and would like to compare notes with learners from another BONSAI partner institution. A small cross-university focus group could compare how each team structures the same evidence.',
    meta: 'Sample collaboration post · Delft ↔ BONSAI network',
  },
  {
    type: 'Announcement',
    badge: 'Administration',
    initials: 'B',
    author: 'BONSAI-MOOC Administration',
    institution: 'BONSAI network',
    time: 'Today',
    title: 'Learner office hour and course-support session',
    body: 'A prototype announcement area can be used for teacher messages, course support, platform notices and invitations to learner focus groups. In the full vision, announcements would be targeted to the relevant course or learner community.',
    meta: 'Sample announcement · vision showcase only',
  },
];

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function StudentNetworkingSpace() {
  return (
    <main className="student-networking-page">
      <section className="student-networking-hero">
        <button className="back-link" type="button" onClick={() => navigate('/learner')}><span aria-hidden="true">←</span> Back to learner dashboard</button>
        <div className="student-networking-breadcrumb"><span>Learner dashboard</span><b>/</b><strong>Student networking space</strong></div>
        <div className="student-networking-hero-grid">
          <div>
            <div className="student-networking-badges"><span className="pill">Vision showcase</span><span className="student-networking-kicker">KAN-54</span></div>
            <h1>Learn together across the BONSAI network</h1>
            <p>A sample learner community for asking course questions, finding peers for focus groups and seeing teacher or administration announcements across institutions.</p>
            <div className="student-networking-topics" aria-label="Networking space examples">
              <span>Q&A</span><span>Focus groups</span><span>Cross-university peers</span><span>Announcements</span>
            </div>
          </div>
          <aside className="student-networking-vision-card">
            <span>Prototype scope</span>
            <strong>Static showcase</strong>
            <p>The posts below are sample content only. Posting, replying, messaging and group creation are intentionally not functional in this stretch task.</p>
          </aside>
        </div>
      </section>

      <section className="student-networking-body">
        <div className="student-networking-feed">
          <div className="student-networking-section-heading">
            <div><span className="section-kicker">Community feed</span><h2>What learners could see</h2><p>Three sample post types illustrate the intended collaboration experience without adding social-network functionality to the prototype.</p></div>
            <span className="student-networking-static-label">Sample posts · read only</span>
          </div>

          <div className="student-networking-posts">
            {samplePosts.map((post) => (
              <article className="student-networking-post" key={post.title}>
                <div className="student-networking-post-head">
                  <span className="student-networking-avatar" aria-hidden="true">{post.initials}</span>
                  <div><strong>{post.author}</strong><small>{post.institution} · {post.time}</small></div>
                  <span className={`student-networking-post-badge ${post.type === 'Announcement' ? 'announcement' : ''}`}>{post.badge}</span>
                </div>
                <span className="student-networking-post-type">{post.type}</span>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
                <div className="student-networking-post-meta"><span>{post.meta}</span><span aria-hidden="true">•••</span></div>
              </article>
            ))}
          </div>
        </div>

        <aside className="student-networking-side">
          <section className="student-networking-side-card">
            <span className="section-kicker">Community purpose</span>
            <h2>Connect beyond one classroom</h2>
            <div className="student-networking-purpose-list">
              <div><span>?</span><p><strong>Ask questions</strong><small>Discuss course concepts with peers and teachers.</small></p></div>
              <div><span>◎</span><p><strong>Create focus groups</strong><small>Find learners working on similar cases or topics.</small></p></div>
              <div><span>↔</span><p><strong>Cross institutions</strong><small>Compare approaches across BONSAI partner universities.</small></p></div>
              <div><span>!</span><p><strong>See announcements</strong><small>Receive sample teacher and administration notices.</small></p></div>
            </div>
          </section>
          <section className="student-networking-side-card student-networking-scope-note">
            <span className="section-kicker">Epic 6 boundary</span>
            <h2>Show the vision, not a social backend</h2>
            <p>This screen deliberately contains no working post, reply, chat, notification or moderation system. Those would require a separate functional product scope.</p>
          </section>
        </aside>
      </section>
    </main>
  );
}

export default function StudentNetworkingBridge() {
  const [actionTarget, setActionTarget] = useState(null);
  const [pageTarget, setPageTarget] = useState(null);

  useEffect(() => {
    let hiddenDashboard = null;
    let mount = null;
    let queued = false;

    function clearPage() {
      if (hiddenDashboard) {
        hiddenDashboard.style.display = '';
        hiddenDashboard = null;
      }
      if (mount?.isConnected) mount.remove();
      mount = null;
      setPageTarget(null);
    }

    function scan() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        if (window.location.pathname !== '/learner') {
          clearPage();
          setActionTarget(null);
          return;
        }

        const params = new URLSearchParams(window.location.search);
        const dashboard = document.querySelector('.learner-dashboard-page');
        const inNetworking = params.get('space') === SPACE_KEY;

        if (inNetworking && dashboard) {
          setActionTarget(null);
          if (hiddenDashboard !== dashboard) {
            clearPage();
            hiddenDashboard = dashboard;
            hiddenDashboard.style.display = 'none';
            mount = document.createElement('div');
            mount.className = 'student-networking-portal';
            dashboard.parentNode?.insertBefore(mount, dashboard.nextSibling);
            setPageTarget(mount);
          }
          return;
        }

        clearPage();
        if (!dashboard) {
          setActionTarget(null);
          return;
        }
        const target = dashboard.querySelector('.learner-dashboard-hero-actions');
        setActionTarget((current) => current === target ? current : target);
      });
    }

    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', scan);
    scan();

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', scan);
      clearPage();
    };
  }, []);

  return (
    <>
      {actionTarget && createPortal(<button className="button button-outline student-networking-entry" type="button" onClick={() => navigate('/learner?space=student-networking')}>Student networking</button>, actionTarget)}
      {pageTarget && createPortal(<StudentNetworkingSpace />, pageTarget)}
    </>
  );
}
