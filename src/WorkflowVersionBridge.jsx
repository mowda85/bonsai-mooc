import { useEffect } from 'react';
import {
  getCoursePublicationState,
  prototypePublicationDefaults,
  prototypePublicationTitles,
} from './coursePublicationStore.js';

const titleToSlug = Object.fromEntries(
  Object.entries(prototypePublicationTitles).map(([slug, title]) => [title, slug]),
);

function query() {
  return new URLSearchParams(window.location.search);
}

function activeTeacherSlug() {
  const params = query();
  return params.get('review') || params.get('course') || '';
}

function slugFromTitle(title) {
  return titleToSlug[String(title || '').trim()] || '';
}

function versionLabel(state) {
  if (state.liveVersion && state.revision) {
    return `Live v${state.liveVersion.version} · Pending v${state.revision.version}`;
  }
  if (state.liveVersion) return `Live v${state.liveVersion.version}`;
  return `Candidate v${state.workflowVersion || 1} · Not yet published`;
}

function upsertVersionBadge(container, state) {
  if (!container) return;
  let badge = container.querySelector('.workflow-version-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'workflow-version-badge';
    container.appendChild(badge);
  }
  const next = versionLabel(state);
  if (badge.textContent !== next) badge.textContent = next;
}

function upsertVersionDetail(container, state) {
  if (!container) return;
  let detail = container.querySelector('.workflow-version-detail');
  if (!detail) {
    detail = document.createElement('small');
    detail.className = 'workflow-version-detail';
    container.appendChild(detail);
  }
  const next = state.revision
    ? `Version model: learner live v${state.liveVersion?.version || 1}; reviewed update v${state.revision.version} is isolated until publication.`
    : state.liveVersion
      ? `Version model: live version v${state.liveVersion.version}.`
      : `Version model: candidate v${state.workflowVersion || 1}; no learner-visible live version exists yet.`;
  if (detail.textContent !== next) detail.textContent = next;
}

function annotateWorkflowVersions() {
  document.querySelectorAll('.teacher-course-row').forEach((row) => {
    const title = row.querySelector('.teacher-course-open')?.textContent;
    const slug = slugFromTitle(title);
    if (!slug) return;
    const state = getCoursePublicationState(slug, prototypePublicationDefaults[slug] || 'Draft');
    upsertVersionBadge(row.querySelector('.teacher-course-name > div:last-child'), state);
  });

  const assigned = document.querySelector('.teacher-assigned-page');
  if (assigned) {
    const title = assigned.querySelector('h1')?.textContent;
    const slug = slugFromTitle(title) || activeTeacherSlug();
    if (slug) {
      const state = getCoursePublicationState(slug, prototypePublicationDefaults[slug] || 'Draft');
      upsertVersionBadge(assigned.querySelector('.teacher-hero-badges'), state);
    }
  }

  const reviewPage = document.querySelector('.teacher-publication-page');
  if (reviewPage) {
    const title = reviewPage.querySelector('h1')?.textContent;
    const slug = slugFromTitle(title) || activeTeacherSlug();
    if (slug) {
      const state = getCoursePublicationState(slug, prototypePublicationDefaults[slug] || 'Draft');
      upsertVersionDetail(reviewPage.querySelector('.teacher-publication-status'), state);
    }
  }
}

export default function WorkflowVersionBridge() {
  useEffect(() => {
    let queued = false;
    const schedule = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        annotateWorkflowVersions();
      });
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', schedule);
    window.addEventListener('bonsai:publication-status-changed', schedule);
    schedule();

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', schedule);
      window.removeEventListener('bonsai:publication-status-changed', schedule);
    };
  }, []);

  return null;
}
