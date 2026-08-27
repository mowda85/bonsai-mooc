const STORAGE_KEY = 'bonsai-mooc.prototype.course-publication.v3';

export const workflowStatuses = ['Draft', 'Under Review', 'Approved', 'Published'];

export const prototypePublicationDefaults = {
  'information-systems-knowledge-dissemination': 'Published',
  'dike-stability': 'Under Review',
  'vegetation-management': 'Draft',
  'flood-risk-management': 'Approved',
};

export const prototypePublicationTitles = {
  'information-systems-knowledge-dissemination': 'Information Systems and Knowledge Dissemination',
  'dike-stability': 'Dike Stability',
  'vegetation-management': 'Vegetation Management',
  'flood-risk-management': 'Flood Risk Management',
};

function emptyReviewState(status = 'Draft') {
  const reviewed = status === 'Approved' || status === 'Published';
  return {
    status,
    leadAuthorApproved: reviewed,
    adminApproved: reviewed,
    changeRequest: null,
  };
}

function defaultStateFor(slug, fallback = 'Published') {
  return {
    ...emptyReviewState(prototypePublicationDefaults[slug] || fallback),
    revision: null,
  };
}

function readStore() {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(next) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Prototype storage can fail in restricted browser modes; keep the UI usable.
  }
}

function normalizeChangeRequest(value) {
  if (!value || typeof value !== 'object') return null;
  return {
    text: String(value.text || ''),
    status: value.status === 'approved' ? 'approved' : 'pending',
  };
}

function normalizeReviewState(value, fallbackStatus = 'Draft') {
  const base = emptyReviewState(fallbackStatus);
  if (!value || typeof value !== 'object') return base;
  return {
    status: workflowStatuses.includes(value.status) ? value.status : base.status,
    leadAuthorApproved: Boolean(value.leadAuthorApproved),
    adminApproved: Boolean(value.adminApproved),
    changeRequest: normalizeChangeRequest(value.changeRequest),
  };
}

function normalizeRevision(value) {
  if (!value || typeof value !== 'object') return null;
  const review = normalizeReviewState(value, 'Draft');
  if (review.status === 'Published') return null;
  const changes = Array.isArray(value.changes)
    ? value.changes
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({ scope: String(item.scope || 'Content'), label: String(item.label || 'Content update') }))
    : [];
  return { ...review, changes };
}

function normalizeState(slug, value, fallback = 'Published') {
  const base = defaultStateFor(slug, fallback);
  if (!value || typeof value !== 'object') return base;
  const review = normalizeReviewState(value, base.status);
  return {
    ...review,
    revision: normalizeRevision(value.revision),
  };
}

function saveCourseState(slug, state) {
  if (!slug) return null;
  const next = { ...readStore(), [slug]: state };
  writeStore(next);
  window.dispatchEvent(new CustomEvent('bonsai:publication-status-changed', { detail: { slug, state } }));
  return state;
}

function activeReviewState(state) {
  return state.revision || state;
}

function replaceActiveReview(state, nextReview) {
  if (state.revision) return { ...state, revision: { ...state.revision, ...nextReview } };
  return { ...state, ...nextReview };
}

export function getCoursePublicationState(slug, fallback = 'Published') {
  if (!slug) return defaultStateFor(slug, fallback);
  return normalizeState(slug, readStore()[slug], fallback);
}

export function getCoursePublicationStatus(slug, fallback = 'Published') {
  return getCoursePublicationState(slug, fallback).status;
}

export function getActiveCourseWorkflowState(slug, fallback = 'Published') {
  return activeReviewState(getCoursePublicationState(slug, fallback));
}

export function getCoursePublicationDisplayStatus(slug, fallback = 'Published') {
  const state = getCoursePublicationState(slug, fallback);
  return state.revision ? `Published · Update ${state.revision.status}` : state.status;
}

export function registerCourseContentChange(slug, scope = 'Content', label = 'Content update', fallback = 'Draft') {
  const current = getCoursePublicationState(slug, fallback);
  const nextChange = { scope: String(scope || 'Content'), label: String(label || 'Content update') };

  if (current.status === 'Published') {
    const existingChanges = current.revision?.changes || [];
    const changes = [...existingChanges];
    if (!changes.some((item) => item.scope === nextChange.scope && item.label === nextChange.label)) changes.push(nextChange);
    return saveCourseState(slug, {
      ...current,
      revision: {
        status: 'Draft',
        leadAuthorApproved: false,
        adminApproved: false,
        changeRequest: null,
        changes,
      },
    });
  }

  return saveCourseState(slug, {
    ...current,
    status: 'Draft',
    leadAuthorApproved: false,
    adminApproved: false,
    changeRequest: null,
    revision: null,
  });
}

export function submitCourseForReview(slug) {
  const current = getCoursePublicationState(slug, 'Draft');
  const active = activeReviewState(current);
  if (active.status !== 'Draft') return current;
  return saveCourseState(slug, replaceActiveReview(current, {
    status: 'Under Review',
    leadAuthorApproved: false,
    adminApproved: false,
    changeRequest: null,
  }));
}

export function requestCoauthorChange(slug, text) {
  const current = getCoursePublicationState(slug, 'Draft');
  const active = activeReviewState(current);
  const requestText = String(text || '').trim();
  if (active.status !== 'Under Review' || !requestText) return current;
  return saveCourseState(slug, replaceActiveReview(current, {
    ...active,
    leadAuthorApproved: false,
    changeRequest: { text: requestText, status: 'pending' },
  }));
}

export function approveCoauthorChange(slug) {
  const current = getCoursePublicationState(slug, 'Draft');
  const active = activeReviewState(current);
  if (active.status !== 'Under Review' || active.changeRequest?.status !== 'pending') return current;
  return saveCourseState(slug, replaceActiveReview(current, {
    ...active,
    changeRequest: { ...active.changeRequest, status: 'approved' },
  }));
}

export function approveCourseReview(slug, actor) {
  const current = getCoursePublicationState(slug, 'Draft');
  const active = activeReviewState(current);
  if (active.status !== 'Under Review' || !['leadAuthor', 'admin'].includes(actor)) return current;
  if (active.changeRequest?.status === 'pending') return current;

  const nextReview = {
    ...active,
    leadAuthorApproved: actor === 'leadAuthor' ? true : active.leadAuthorApproved,
    adminApproved: actor === 'admin' ? true : active.adminApproved,
  };
  if (nextReview.leadAuthorApproved && nextReview.adminApproved) nextReview.status = 'Approved';
  return saveCourseState(slug, replaceActiveReview(current, nextReview));
}

export function publishCourse(slug, actor) {
  const current = getCoursePublicationState(slug, 'Draft');
  const active = activeReviewState(current);
  if (active.status !== 'Approved' || !['leadAuthor', 'admin'].includes(actor)) return current;

  if (current.revision) {
    return saveCourseState(slug, {
      ...current,
      status: 'Published',
      leadAuthorApproved: true,
      adminApproved: true,
      changeRequest: null,
      revision: null,
    });
  }

  return saveCourseState(slug, { ...current, status: 'Published' });
}

export function isCoursePublished(slug) {
  return getCoursePublicationState(slug, 'Published').status === 'Published';
}
