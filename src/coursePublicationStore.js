const STORAGE_KEY = 'bonsai-mooc.prototype.course-publication.v2';

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

function defaultStateFor(slug, fallback = 'Published') {
  const status = prototypePublicationDefaults[slug] || fallback;
  const reviewed = status === 'Approved' || status === 'Published';
  return {
    status,
    leadAuthorApproved: reviewed,
    adminApproved: reviewed,
    changeRequest: null,
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

function normalizeState(slug, value, fallback = 'Published') {
  const base = defaultStateFor(slug, fallback);
  if (!value || typeof value !== 'object') return base;
  return {
    status: workflowStatuses.includes(value.status) ? value.status : base.status,
    leadAuthorApproved: Boolean(value.leadAuthorApproved),
    adminApproved: Boolean(value.adminApproved),
    changeRequest: value.changeRequest && typeof value.changeRequest === 'object'
      ? {
          text: String(value.changeRequest.text || ''),
          status: value.changeRequest.status === 'approved' ? 'approved' : 'pending',
        }
      : null,
  };
}

function saveCourseState(slug, state) {
  if (!slug) return null;
  const next = { ...readStore(), [slug]: state };
  writeStore(next);
  window.dispatchEvent(new CustomEvent('bonsai:publication-status-changed', { detail: { slug, state } }));
  return state;
}

export function getCoursePublicationState(slug, fallback = 'Published') {
  if (!slug) return defaultStateFor(slug, fallback);
  return normalizeState(slug, readStore()[slug], fallback);
}

export function getCoursePublicationStatus(slug, fallback = 'Published') {
  return getCoursePublicationState(slug, fallback).status;
}

export function submitCourseForReview(slug) {
  const current = getCoursePublicationState(slug, 'Draft');
  if (current.status !== 'Draft') return current;
  return saveCourseState(slug, {
    status: 'Under Review',
    leadAuthorApproved: false,
    adminApproved: false,
    changeRequest: null,
  });
}

export function requestCoauthorChange(slug, text) {
  const current = getCoursePublicationState(slug, 'Draft');
  const requestText = String(text || '').trim();
  if (current.status !== 'Under Review' || !requestText) return current;
  return saveCourseState(slug, {
    ...current,
    leadAuthorApproved: false,
    changeRequest: { text: requestText, status: 'pending' },
  });
}

export function approveCoauthorChange(slug) {
  const current = getCoursePublicationState(slug, 'Draft');
  if (current.status !== 'Under Review' || current.changeRequest?.status !== 'pending') return current;
  return saveCourseState(slug, {
    ...current,
    changeRequest: { ...current.changeRequest, status: 'approved' },
  });
}

export function approveCourseReview(slug, actor) {
  const current = getCoursePublicationState(slug, 'Draft');
  if (current.status !== 'Under Review' || !['leadAuthor', 'admin'].includes(actor)) return current;
  if (current.changeRequest?.status === 'pending') return current;

  const next = {
    ...current,
    leadAuthorApproved: actor === 'leadAuthor' ? true : current.leadAuthorApproved,
    adminApproved: actor === 'admin' ? true : current.adminApproved,
  };
  if (next.leadAuthorApproved && next.adminApproved) next.status = 'Approved';
  return saveCourseState(slug, next);
}

export function publishCourse(slug, actor) {
  const current = getCoursePublicationState(slug, 'Draft');
  if (current.status !== 'Approved' || !['leadAuthor', 'admin'].includes(actor)) return current;
  return saveCourseState(slug, { ...current, status: 'Published' });
}

export function isCoursePublished(slug) {
  return getCoursePublicationStatus(slug, 'Published') === 'Published';
}
