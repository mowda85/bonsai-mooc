import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const SPACE_KEY = 'teacher-networking';

const samplePosts = [
  {
    type: 'Teaching discussion',
    badge: 'Discussion',
    initials: 'AC',
    author: 'Dr. Amélie Caron',
    institution: 'BONSAI partner university',
    time: '25 min ago',
    title: 'Best way to explain estuary dynamics to non-specialist learners?',
    body: 'I am simplifying a short introductory unit and would like to compare approaches from colleagues in engineering, geography and environmental science. What examples or diagrams have worked well when the audience does not already know the technical vocabulary?',
    meta: 'Sample teaching thread · 6 prototype replies',
  },
  {
    type: 'Course collaboration',
    badge: 'Seeking co-author',
    initials: 'MK',
    author: 'Dr. Martin Keller',
    institution: 'BONSAI partner institution',
    time: '1 h ago',
    title: 'Looking for a hydrology co-author for a new sediment-transport unit',
    body: 'I am drafting a new course unit on sediment transport and would like a co-author with a hydrology background to review the learning objectives, contribute one applied example and help shape a short formative activity.',
    meta: 'Sample co-author request · cross-institution collaboration',
  },
  {
    type: 'Experience sharing',
    badge: 'Practice exchange',
    initials: 'SR',
    author: 'Sofia Rossi',
    institution: 'BONSAI teaching network',
    time: 'Today',
    title: 'What worked in our first learner feedback round',
    body: 'A shared teacher space could also help colleagues exchange practical lessons from running courses: what learners found difficult, which activities generated useful discussion, and what should be revised before the next delivery.',
    meta: 'Sample experience note · vision showcase only',
  },
];

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function TeacherNetworkingSpace() {
  return (
    <main className="teacher-networking-page">
      <section className="teacher-networking-hero">
        <button className="back-link" type="button" onClick={() => navigate('/teacher')}><span aria-hidden="true">←</span> Back to teacher dashboard</button>
        <div className="teacher-networking-breadcrumb"><span>Teacher dashboard</span><b>/</b><strong>Teacher networking space</strong></div>
        <div className="teacher-networking-hero-grid">
          <div>
            <div className="teacher-networking-badges"><span className="pill">Vision showcase</span><span className="teacher-networking-kicker">KAN-55</span></div>
            <h1>Build courses and share teaching practice across institutions</h1>
            <p>A sample teacher community for discussing pedagogy, finding co-authors for new course content and learning from colleagues’ delivery experience across the BONSAI network.</p>
            <div className="teacher-networking-topics" aria-label="Teacher networking examples">
              <span>Teaching discussions</span><span>Co-author search</span><span>Course collaboration</span><span>Experience sharing</span>
            </div>
          </div>
          <aside className="teacher-networking-vision-card">
            <span>Prototype scope</span>
            <strong>Static showcase</strong>
            <p>The posts below are sample content only. Creating threads, replying, messaging colleagues and accepting co-author requests are intentionally not functional in this stretch task.</p>
          </aside>
        </div>
      </section>

      <section className="teacher-networking-body">
        <div className="teacher-networking-feed">
          <div className="teacher-networking-section-heading">
            <div><span className="section-kicker">Teacher community feed</span><h2>What educators could exchange</h2><p>Three read-only examples illustrate the cross-institution collaboration vision without expanding the prototype into a working social platform.</p></div>
            <span className="teacher-networking-static-label">Sample posts · read only</span>
          </div>

          <div className="teacher-networking-posts">
            {samplePosts.map((post) => (
              <article className="teacher-networking-post" key={post.title}>
                <div className="teacher-networking-post-head">
                  <span className="teacher-networking-avatar" aria-hidden="true">{post.initials}</span>
                  <div><strong>{post.author}</strong><small>{post.institution} · {post.time}</small></div>
                  <span className={`teacher-networking-post-badge ${post.type === 'Course collaboration' ? 'collaboration' : ''}`}>{post.badge}</span>
                </div>
                <span className="teacher-networking-post-type">{post.type}</span>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
                <div className="teacher-networking-post-meta"><span>{post.meta}</span><span aria-hidden="true">•••</span></div>
              </article>
            ))}
          </div>
        </div>

        <aside className="teacher-networking-side">
          <section className="teacher-networking-side-card">
            <span className="section-kicker">Collaboration purpose</span>
            <h2>Connect teaching expertise</h2>
            <div className="teacher-networking-purpose-list">
              <div><span>?</span><p><strong>Discuss pedagogy</strong><small>Compare ways to explain difficult topics to different audiences.</small></p></div>
              <div><span>＋</span><p><strong>Find co-authors</strong><small>Match course leads with complementary subject expertise.</small></p></div>
              <div><span>↔</span><p><strong>Work across institutions</strong><small>Share course ideas and examples beyond one university.</small></p></div>
              <div><span>◎</span><p><strong>Learn from delivery</strong><small>Exchange experience from learner questions, feedback and revisions.</small></p></div>
            </div>
          </section>
          <section className="teacher-networking-side-card teacher-networking-scope-note">
            <span className="section-kicker">Epic 6 boundary</span>
            <h2>Show collaboration without building a social backend</h2>
            <p>This screen deliberately contains no working post, reply, chat, invitation, notification or moderation system. Those capabilities would require a separate functional scope.</p>
          </section>
        </aside>
      </section>
    </main>
  );
}

export default function TeacherNetworkingBridge() {
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
        if (window.location.pathname !== '/teacher') {
          clearPage();
          setActionTarget(null);
          return;
        }

        const params = new URLSearchParams(window.location.search);
        const dashboard = document.querySelector('.teacher-dashboard-page');
        const inNetworking = params.get('space') === SPACE_KEY;

        if (inNetworking && dashboard) {
          setActionTarget(null);
          if (hiddenDashboard !== dashboard) {
            clearPage();
            hiddenDashboard = dashboard;
            hiddenDashboard.style.display = 'none';
            mount = document.createElement('div');
            mount.className = 'teacher-networking-portal';
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
        const target = dashboard.querySelector('.teacher-dashboard-hero-actions');
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
      {actionTarget && createPortal(<button className="button button-outline teacher-networking-entry" type="button" onClick={() => navigate('/teacher?space=teacher-networking')}>Teacher networking</button>, actionTarget)}
      {pageTarget && createPortal(<TeacherNetworkingSpace />, pageTarget)}
    </>
  );
}
