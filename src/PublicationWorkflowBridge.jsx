import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  getCoursePublicationStatus,
  getNextPublicationAction,
  isCoursePublished,
  prototypePublicationDefaults,
  prototypePublicationTitles,
  setCoursePublicationStatus,
  workflowStatuses,
} from './coursePublicationStore.js';

const titleToSlug = Object.fromEntries(Object.entries(prototypePublicationTitles).map(([slug, title]) => [title, slug]));

function slugFromTeacherQuery() {
  const query = new URLSearchParams(window.location.search);
  return query.get('review') || query.get('course') || '';
}

function reviewSlugFromQuery() {
  return new URLSearchParams(window.location.search).get('review') || '';
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
  const slug = titleToSlug[title] || new URLSearchParams(window.location.search).get('course');
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

function ReviewPublicationPage({ slug, onChanged }) {
  const context = getTeacherCourseContext(slug);
  const [status, setStatus] = useState(() => getCoursePublicationStatus(slug, context.fallbackStatus));
  const currentIndex = workflowStatuses.indexOf(status);
  const nextAction = getNextPublicationAction(status);

  function transition() {
    if (!nextAction) return;
    setCoursePublicationStatus(slug, nextAction.nextStatus);
    setStatus(nextAction.nextStatus);
    onChanged();
  }

  return (
    <main className="teacher-publication-page">
      <section className="teacher-publication-hero">
        <button className="back-link" type="button" onClick={() => navigate(`/teacher?course=${slug}`)}><span aria-hidden="true">←</span> Back to Assigned Course</button>
        <div className="teacher-breadcrumb"><span>Teacher Dashboard</span><b>/</b><span>{context.title}</span><b>/</b><strong>Review & Publication</strong></div>
        <div className="teacher-publication-hero-grid">
          <div>
            <div className="teacher-hero-badges"><span className="pill">Review & Publication</span><span className="teacher-kicker-badge">KAN-37</span></div>
            <h1>{context.title}</h1>
            <p>Move this course through the prototype review workflow. Status changes are stored for this browser session and control learner-facing course discovery.</p>
          </div>
          <aside className={`teacher-publication-status teacher-publication-status-${status.toLowerCase().replaceAll(' ', '-')}`}><span>Current status</span><strong>{status}</strong><small>{status === 'Published' ? 'Visible on learner-facing discovery screens.' : 'Not visible on learner-facing discovery screens.'}</small></aside>
        </div>
      </section>

      <section className="teacher-publication-body">
        <section className="teacher-publication-main-card">
          <span className="section-kicker">Course workflow</span>
          <h2>Draft → Under Review → Approved → Published</h2>
          <p>Only the action valid for the current status is available. This prototype does not include rejection, revision, unpublish or real reviewer authorization.</p>
          <div className="teacher-publication-steps" aria-label={`Current course status: ${status}`}>
            {workflowStatuses.map((item, index) => (
              <div key={item} className={`${index <= currentIndex ? 'reached' : ''} ${index === currentIndex ? 'current' : ''}`}>
                <span>{index < currentIndex ? '✓' : index + 1}</span>
                <div><strong>{item}</strong><small>{item === 'Under Review' ? 'Review stage' : item === 'Approved' ? 'Ready to publish' : item === 'Published' ? 'Learner-visible' : 'Teacher draft'}</small></div>
              </div>
            ))}
          </div>
        </section>

        <aside className="teacher-publication-side-stack">
          <section className="teacher-publication-action-card">
            <span className="section-kicker">Next action</span>
            {nextAction ? (
              <>
                <h2>{nextAction.label}</h2>
                <p>{nextAction.note}</p>
                {status === 'Under Review' && <div className="teacher-publication-reviewer-note"><strong>Prototype reviewer/admin stand-in</strong><span>This button simulates approval only; real role authorization is outside KAN-37.</span></div>}
                <button className="button button-primary" type="button" onClick={transition}>{nextAction.label} →</button>
              </>
            ) : (
              <>
                <h2>Course is Published</h2>
                <p>No further publication transition is available in this prototype workflow.</p>
                <div className="teacher-publication-live-note">✓ Learner discovery visibility enabled</div>
              </>
            )}
          </section>

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

export default function PublicationWorkflowBridge() {
  const [version, setVersion] = useState(0);
  const [targets, setTargets] = useState({ actions: null, dashboard: null });
  const reviewSlug = reviewSlugFromQuery();
  const courseSlug = slugFromTeacherQuery();

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
        setTargets((current) => current.actions === actions && current.dashboard === dashboard ? current : { actions, dashboard });
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
    targets.dashboard.classList.toggle('publication-review-active', Boolean(reviewSlug));
    return () => targets.dashboard?.classList.remove('publication-review-active');
  }, [reviewSlug, targets.dashboard]);

  const reviewButton = targets.actions && courseSlug && !reviewSlug
    ? createPortal(<button className="button button-outline publication-review-entry" type="button" onClick={() => navigate(`/teacher?review=${courseSlug}&course=${courseSlug}`)}>Review & Publication</button>, targets.actions)
    : null;

  const reviewPage = targets.dashboard && reviewSlug
    ? createPortal(<ReviewPublicationPage slug={reviewSlug} onChanged={refresh} />, targets.dashboard)
    : null;

  return <>{reviewButton}{reviewPage}</>;
}
