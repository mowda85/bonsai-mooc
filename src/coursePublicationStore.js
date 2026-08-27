const STORAGE_KEY = 'bonsai-mooc.prototype.course-publication.v1';

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

export function getCoursePublicationStatus(slug, fallback = 'Published') {
  if (!slug) return fallback;
  const stored = readStore()[slug];
  return stored || prototypePublicationDefaults[slug] || fallback;
}

export function setCoursePublicationStatus(slug, status) {
  if (!slug || !workflowStatuses.includes(status)) return null;
  const next = { ...readStore(), [slug]: status };
  writeStore(next);
  window.dispatchEvent(new CustomEvent('bonsai:publication-status-changed', { detail: { slug, status } }));
  return status;
}

export function isCoursePublished(slug) {
  return getCoursePublicationStatus(slug, 'Published') === 'Published';
}

export function getNextPublicationAction(status) {
  if (status === 'Draft') return { label: 'Submit for Review', nextStatus: 'Under Review', note: 'Send the course into the prototype review stage.' };
  if (status === 'Under Review') return { label: 'Approve', nextStatus: 'Approved', note: 'Prototype reviewer/admin stand-in: approve the reviewed course.' };
  if (status === 'Approved') return { label: 'Publish', nextStatus: 'Published', note: 'Make the approved course visible on learner-facing discovery screens.' };
  return null;
}
