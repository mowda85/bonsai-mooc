import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  approveCoauthorChange,
  approveCourseReview,
  getCoursePublicationState,
  getCoursePublicationStatus,
  isCoursePublished,
  prototypePublicationDefaults,
  prototypePublicationTitles,
  publishCourse,
  requestCoauthorChange,
  submitCourseForReview,
  workflowStatuses,
} from './coursePublicationStore.js';

const titleToSlug = Object.fromEntries(Object.entries(prototypePublicationTitles).map(([slug, title]) => [title, slug]));

function currentQuery() {
  return new URLSearchParams(window.location.search);
}

function slugFromTeacherQuery() {
  const query = currentQuery();
  return query.get('review') || query.get('course') || '';
}

function reviewSlugFromQuery() {
  return currentQuery().get('review') || '';
}

function currentActor() {
  if (window.location.pathname === '/admin') return 'admin';
  return currentQuery().get('actor') === 'coauthor' ? 'coauthor' : 'leadAuthor';
}

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function slugForCard(card) {
  const title = card.querySelector('strong')?.textContent?.trim();
  return titleToSlug[title] || '';
}

function updateTeacherStatusDom() {
  document.querySelectorAll('.teacher-course-row').forEach((row) => {
    const title = row.querySelector('.teacher-course-open')?.textContent?.trim();
    const slug = titleToSlug[title];
    if (!slug) return;
    const status = getCoursePublicationStatus(slug, prototypePublicationDefaults[slug]);
    const badge = row.querySelector('.teacher-row-status');
    if (badge) badge.textContent = status;
  });

  const assignedPage = document.querySelector('.teacher-assigned-page');
  if (!assignedPage) return;
  const title = assignedPage.querySelector('h1')?.textContent?.trim();
  const slug = titleToSlug[title] || currentQuery().get('course');
  if (!slug) return;
  const domFallback = assignedPage.querySelector('.teacher-status-chip')?.textContent?.trim() || 'Draft';
  const status = getCoursePublicationStatus(slug, domFallback);
  const badge = assignedPage.querySelector('.teacher-status-chip');
  if (badge) {
    badge.textContent = status;
    Array.from(badge.classList).filter((name) => name.startsWith('teacher-status-')).forEach((name) => badge.classList.remove(name));
    badge.classList.add(`teacher-status-${status.toLowerCase().replaceAll(' ', '-')}`);
  }

  const currentIndex = workflowStatuses.indexOf(status);
  assignedPage.querySelectorAll('.teacher-workflow-step').forEach((step, index) => {
    step.classList.toggle('teacher-workflow-reached', index <= currentIndex);
    step.classList.toggle('teacher-workflow-current', index === currentIndex);
    const marker = step.querySelector('span');
    if (marker) marker.textContent = index < currentIndex ? '✓' : String(index + 1);
  });
}

function updatePublicVisibility() {
  const cardSelectors = ['.catalogue-course-card', '.area-course-card', '.search-result-card'];
  document.querySelectorAll(cardSelectors.join(',')).forEach((card) => {
    const slug = slugForCard(card);
    if (!slug) return;
    card.hidden = !isCoursePublished(slug);
  });

  const catalogueCards = Array.from(document.querySelectorAll('.catalogue-course-card'));
  const catalogueCount = document.querySelector('.catalogue-results-head strong');
  if (catalogueCount && catalogueCards.length) catalogueCount.textContent = String(catalogueCards.filter((card) => !card.hidden).length);

  const searchCards = Array.from(document.querySelectorAll('.search-result-card'));
  const searchCount = document.querySelector('.search-results-head strong');
  if (searchCount && searchCards.length) {
    const count = searchCards.filter((card) => !card.hidden).length;
    searchCount.textContent = `${count} result${count === 1 ? '' : 's'}`;
  }

  const areaCards = Array.from(document.querySelectorAll('.learning-area-page .area-course-card'));
  const areaCount = document.querySelector('.learning-area-summary > div:first-child strong');
  if (areaCount && areaCards.length) areaCount.textContent = String(areaCards.filter((card) => !card.hidden).length);

  const unpublished = Object.keys(prototypePublicationDefaults).filter((slug) => !isCoursePublished(slug));
  const publishedTotal = 20 - unpublished.length;
  const publishedFoundation = isCoursePublished('information-systems-knowledge-dissemination') ? 4 : 3;
  const catalogueSummaryValues = document.querySelectorAll('.catalogue-summary strong');
  if (catalogueSummaryValues.length >= 3) {
    catalogueSummaryValues[0].textContent = String(publishedTotal);
    catalogueSummaryValues[1].textContent = String(publishedFoundation);
    catalogueSummaryValues[2].textContent = String(publishedTotal - publishedFoundation);
  }
}

function getTeacherCourseContext(slug) {
  const assignedPage = document.querySelector('.teacher-assigned-page');
  const currentTitle = assignedPage?.querySelector('h1')?.textContent?.trim();
  const currentBadge = assignedPage?.querySelector('.teacher-status-chip')?.textContent?.trim();
  return {
    title: prototypePublicationTitles[slug] || currentTitle || 'Course',
    fallbackStatus: prototypePublicationDefaults[slug] || currentBadge || 'Draft',
  };
}

function ApprovalState({ label, approved }) {
  return (
    <div className={`publication-approval ${approved ? 'approved' : ''}`}>
      <span>{approved ? '✓' : '○'}</span>
      <div><strong>{label}</strong><small>{approved ? 'Approved' : 'Approval required'}</small></div>
    </div>
  );
}

function ReviewPublicationPage({ slug, actor, onChanged }) {
  const context = getTeacherCourseContext(slug);
  const [state, setState] = useState(() => getCoursePublicationState(slug, context.fallbackStatus));
  const [requestText, setRequestText] = useState('');
  const [message, setMessage] = useState('');
  const status = state.status;
  const currentIndex = workflowStatuses.indexOf(status);
  const isLead = actor === 'leadAuthor';
  const isAdmin = actor === 'admin';
  const isCoauthor = actor === 'coauthor';
  const actorLabel = isAdmin ? 'Admin' : isCoauthor ? 'Co-author prototype view' : 'Lead Author';

  function apply(next, nextMessage) {
    setState(next);
    setMessage(nextMessage || '');
    onChanged();
  }

  function submitReview() {
    apply(submitCourseForReview(slug), 'Course submitted for Lead Author + Admin review.');
  }

  function approveReview() {
    const role = isAdmin ? 'admin' : 'leadAuthor';
    const next = approveCourseReview(slug, role);
    apply(next, next.status === 'Approved' ? 'Both approvals are complete. Course is Approved.' : `${actorLabel} approval recorded. The other approval is still required.`);
  }

  function submitChangeRequest(event) {
    event.preventDefault();
    if (!requestText.trim()) {
      setMessage('Enter the requested change before submitting.');
      return;
    }
    apply(requestCoauthorChange(slug, requestText), 'Co-author change request sent to the Lead Author.');
    setRequestText('');
  }

  function approveChange() {
    apply(approveCoauthorChange(slug), 'Lead Author approved the Co-author change request.');
  }

  function publish() {
    const role = isAdmin ? 'admin' : 'leadAuthor';
    apply(publishCourse(slug, role), `Course published by ${actorLabel}.`);
  }

  const pendingRequest = state.changeRequest?.status === 'pending';
  const reviewBlocked = pendingRequest;
  const approvalAlreadyRecorded = isLead ? state.leadAuthorApproved : state.adminApproved;

  return (
    <main className="teacher-publication-page">
      <section className="teacher-publication-hero">
        <button className="back-link" type="button" onClick={() => navigate(isAdmin ? '/admin' : `/teacher?course=${slug}`)}><span aria-hidden="true">←</span> {isAdmin ? 'Back to Admin Dashboard' : 'Back to Assigned Course'}</button>
        <div className="teacher-breadcrumb"><span>{isAdmin ? 'Admin Dashboard' : 'Teacher Dashboard'}</span><b>/</b><span>{context.title}</span><b>/</b><strong>Review & Publication</strong></div>
        <div className="teacher-publication-hero-grid">
          <div>
            <div className="teacher-hero-badges"><span className="pill">Review & Publication</span><span className="teacher-kicker-badge">KAN-37</span><span className="publication-actor-badge">{actorLabel}</span></div>
            <h1>{context.title}</h1>
            <p>Course governance requires both Lead Author and Admin approval before an Under Review course becomes Approved. Either the Lead Author or Admin may then publish it.</p>
          </div>
          <aside className={`teacher-publication-status teacher-publication-status-${status.toLowerCase().replaceAll(' ', '-')}`}><span>Current status</span><strong>{status}</strong><small>{status === 'Published' ? 'Visible on learner-facing discovery screens.' : 'Not visible on learner-facing discovery screens.'}</small></aside>
        </div>
      </section>

      <section className="teacher-publication-body">
        <section className="teacher-publication-main-card">
          <span className="section-kicker">Course workflow</span>
          <h2>Draft → Under Review → Approved → Published</h2>
          <p>Under Review is a dual-approval stage. A Co-author can request a change, but the Lead Author must approve that request before review can complete.</p>
          <div className="teacher-publication-steps" aria-label={`Current course status: ${status}`}>
            {workflowStatuses.map((item, index) => (
              <div key={item} className={`${index <= currentIndex ? 'reached' : ''} ${index === currentIndex ? 'current' : ''}`}>
                <span>{index < currentIndex ? '✓' : index + 1}</span>
                <div><strong>{item}</strong><small>{item === 'Under Review' ? 'Lead Author + Admin approval' : item === 'Approved' ? 'Lead Author or Admin may publish' : item === 'Published' ? 'Learner-visible' : 'Lead Author draft'}</small></div>
              </div>
            ))}
          </div>

          <div className="publication-governance-grid">
            <ApprovalState label="Lead Author approval" approved={state.leadAuthorApproved} />
            <ApprovalState label="Admin approval" approved={state.adminApproved} />
          </div>

          <div className={`publication-change-request ${state.changeRequest ? state.changeRequest.status : 'none'}`}>
            <div><span className="section-kicker">Co-author change request</span><strong>{state.changeRequest ? (pendingRequest ? 'Awaiting Lead Author approval' : 'Approved by Lead Author') : 'No active request'}</strong></div>
            {state.changeRequest ? <p>{state.changeRequest.text}</p> : <p>A Co-author may request a change while the course is Under Review.</p>}
          </div>
        </section>

        <aside className="teacher-publication-side-stack">
          <section className="teacher-publication-action-card">
            <span className="section-kicker">Actions for {actorLabel}</span>
            {message && <div className="publication-action-message" role="status">{message}</div>}

            {status === 'Draft' && isLead && <><h2>Submit for Review</h2><p>Only the Lead Author starts formal review.</p><button className="button button-primary" type="button" onClick={submitReview}>Submit for Review →</button></>}
            {status === 'Draft' && !isLead && <><h2>Waiting for Lead Author</h2><p>The Lead Author must submit this Draft before approval or change-request actions begin.</p></>}

            {status === 'Under Review' && isCoauthor && !pendingRequest && <form className="publication-change-form" onSubmit={submitChangeRequest}><h2>Request a change</h2><p>Co-authors can request a change, but cannot approve or publish the course.</p><label><span>Requested change</span><textarea rows="4" value={requestText} onChange={(event) => setRequestText(event.target.value)} placeholder="Describe what should be changed" /></label><button className="button button-primary" type="submit">Send change request</button></form>}
            {status === 'Under Review' && isCoauthor && pendingRequest && <><h2>Request pending</h2><p>Your change request is waiting for Lead Author approval.</p></>}

            {status === 'Under Review' && isLead && pendingRequest && <><h2>Approve Co-author request</h2><p>Review approval is paused until the Lead Author accepts the requested change.</p><button className="button button-primary" type="button" onClick={approveChange}>Approve requested change →</button></>}

            {status === 'Under Review' && (isLead || isAdmin) && !reviewBlocked && !approvalAlreadyRecorded && <><h2>{isLead ? 'Approve as Lead Author' : 'Approve as Admin'}</h2><p>Your approval is recorded separately. The course becomes Approved only when both approvals are present.</p><button className="button button-primary" type="button" onClick={approveReview}>{isLead ? 'Approve as Lead Author' : 'Approve as Admin'} →</button></>}
            {status === 'Under Review' && (isLead || isAdmin) && !reviewBlocked && approvalAlreadyRecorded && <><h2>Your approval is recorded</h2><p>Waiting for the {isLead ? 'Admin' : 'Lead Author'} approval before the course can become Approved.</p></>}
            {status === 'Under Review' && isAdmin && reviewBlocked && <><h2>Change request pending</h2><p>The Lead Author must approve the Co-author change request before Admin approval can complete the review.</p></>}

            {status === 'Approved' && (isLead || isAdmin) && <><h2>Publish course</h2><p>This course has both required approvals. Either the Lead Author or Admin may publish it.</p><button className="button button-primary" type="button" onClick={publish}>Publish as {isLead ? 'Lead Author' : 'Admin'} →</button></>}
            {status === 'Approved' && isCoauthor && <><h2>Approved</h2><p>Co-authors cannot publish. Publication must be performed by the Lead Author or Admin.</p></>}

            {status === 'Published' && <><h2>Course is Published</h2><p>No further publication transition is available.</p><div className="teacher-publication-live-note">✓ Learner discovery visibility enabled</div></>}
          </section>

          {!isAdmin && <section className="teacher-publication-action-card"><span className="section-kicker">Prototype role check</span><h2>{isCoauthor ? 'Return to Lead Author view' : 'Open Co-author view'}</h2><p>{isCoauthor ? 'Return to the Lead Author governance actions.' : 'Use the prototype Co-author view to test change requests without adding a separate account-management task.'}</p><button className="button button-outline" type="button" onClick={() => navigate(`/teacher?review=${slug}&course=${slug}${isCoauthor ? '' : '&actor=coauthor'}`)}>{isCoauthor ? 'Lead Author view' : 'Co-author view'}</button></section>}

          <section className="teacher-publication-action-card">
            <span className="section-kicker">Verify learner visibility</span>
            <h2>Open the Course Catalogue</h2>
            <p>{status === 'Published' ? 'The course should now appear in learner-facing discovery.' : 'The course should remain hidden until it reaches Published.'}</p>
            <button className="button button-outline" type="button" onClick={() => navigate('/courses')}>Open learner catalogue</button>
          </section>
        </aside>
      </section>
    </main>
  );
}

function AdminPublicationQueue() {
  const courses = Object.entries(prototypePublicationTitles).map(([slug, title]) => ({ slug, title, state: getCoursePublicationState(slug, prototypePublicationDefaults[slug]) }));
  return (
    <section className="admin-publication-queue">
      <div className="admin-publication-heading"><div><span className="section-kicker">KAN-37 · Admin governance</span><h2>Course review & publication</h2><p>Admin approval is required alongside Lead Author approval. Admin may also publish a course once it is Approved.</p></div></div>
      <div className="admin-publication-list">{courses.map(({ slug, title, state }) => <article key={slug}><div><strong>{title}</strong><span>{state.status}</span></div><div className="admin-publication-approval-mini"><small className={state.leadAuthorApproved ? 'done' : ''}>Lead {state.leadAuthorApproved ? '✓' : '○'}</small><small className={state.adminApproved ? 'done' : ''}>Admin {state.adminApproved ? '✓' : '○'}</small>{state.changeRequest?.status === 'pending' && <small className="request">Change request pending</small>}</div><button className="button button-outline" type="button" onClick={() => navigate(`/admin?review=${slug}`)}>Open review</button></article>)}</div>
    </section>
  );
}

export default function PublicationWorkflowBridge() {
  const [version, setVersion] = useState(0);
  const [targets, setTargets] = useState({ actions: null, dashboard: null, dashboardRole: '' });
  const reviewSlug = reviewSlugFromQuery();
  const courseSlug = slugFromTeacherQuery();
  const actor = currentActor();
  const path = window.location.pathname;

  const refresh = useMemo(() => () => setVersion((value) => value + 1), []);

  useEffect(() => {
    let queued = false;
    const scan = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        const actions = document.querySelector('.teacher-assigned-actions');
        const dashboard = document.querySelector('.dashboard-placeholder');
        const directHeading = Array.from(dashboard?.children || []).find((child) => child.tagName === 'H1')?.textContent || '';
        const dashboardRole = directHeading === 'Admin Dashboard' ? 'admin' : directHeading === 'Teacher Dashboard' ? 'teacher' : '';
        setTargets((current) => current.actions === actions && current.dashboard === dashboard && current.dashboardRole === dashboardRole ? current : { actions, dashboard, dashboardRole });
        updateTeacherStatusDom();
        updatePublicVisibility();
      });
    };
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', scan);
    window.addEventListener('bonsai:publication-status-changed', scan);
    scan();
    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', scan);
      window.removeEventListener('bonsai:publication-status-changed', scan);
    };
  }, [version]);

  useEffect(() => {
    if (!targets.dashboard) return undefined;
    const teacherReviewActive = targets.dashboardRole === 'teacher' && Boolean(reviewSlug);
    const adminReviewActive = targets.dashboardRole === 'admin' && Boolean(reviewSlug);
    targets.dashboard.classList.toggle('publication-review-active', teacherReviewActive);
    targets.dashboard.classList.toggle('admin-publication-review-active', adminReviewActive);
    return () => {
      targets.dashboard?.classList.remove('publication-review-active');
      targets.dashboard?.classList.remove('admin-publication-review-active');
    };
  }, [reviewSlug, targets.dashboard, targets.dashboardRole]);

  const reviewButton = path === '/teacher' && targets.actions && courseSlug && !reviewSlug
    ? createPortal(<button className="button button-outline publication-review-entry" type="button" onClick={() => navigate(`/teacher?review=${courseSlug}&course=${courseSlug}`)}>Review & Publication</button>, targets.actions)
    : null;

  const reviewPage = targets.dashboard && reviewSlug && ((path === '/teacher' && targets.dashboardRole === 'teacher') || (path === '/admin' && targets.dashboardRole === 'admin'))
    ? createPortal(<ReviewPublicationPage slug={reviewSlug} actor={actor} onChanged={refresh} />, targets.dashboard)
    : null;

  const adminQueue = targets.dashboard && path === '/admin' && targets.dashboardRole === 'admin' && !reviewSlug
    ? createPortal(<AdminPublicationQueue key={version} />, targets.dashboard)
    : null;

  return <>{reviewButton}{reviewPage}{adminQueue}</>;
}
