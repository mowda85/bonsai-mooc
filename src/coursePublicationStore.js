const STORAGE_KEY = 'bonsai-mooc.prototype.course-publication.v5';
const LEGACY_KEYS = [
  'bonsai-mooc.prototype.course-publication.v4',
  'bonsai-mooc.prototype.course-publication.v3',
];

export const workflowStatuses = ['Draft', 'Under Review', 'Approved', 'Published'];

export const prototypePublicationDefaults = {
  'flood-crisis-management-estuarine-areas': 'Published',
  'information-systems-knowledge-dissemination': 'Published',
  'dike-stability-lagrangian-numerical-modelling': 'Under Review',
  'vegetation-management': 'Draft',
  'flood-risk-management-preparedness': 'Approved',
};

export const prototypePublicationTitles = {
  'flood-crisis-management-estuarine-areas': 'Flood Crisis Management in Estuarine Areas',
  'information-systems-knowledge-dissemination': 'Information Systems and Knowledge Dissemination',
  'dike-stability-lagrangian-numerical-modelling': 'Dike Stability: Lagrangian Methods and Numerical Modeling',
  'vegetation-management': 'Vegetation and Management',
  'flood-risk-management-preparedness': 'Flood Risk Management / Preparedness',
};

function nowIso() {
  return new Date().toISOString();
}

function normalizeStatus(value, fallback = 'Draft') {
  return workflowStatuses.includes(value) ? value : fallback;
}

function normalizeChangeRequest(value) {
  if (!value || typeof value !== 'object') return null;
  const text = String(value.text || '').trim();
  if (!text) return null;
  return { text, status: value.status === 'approved' ? 'approved' : 'pending' };
}

function normalizeChanges(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({ scope: String(item.scope || 'Content'), label: String(item.label || 'Content update') }));
}

function makePending(status = 'Draft', options = {}) {
  const normalized = normalizeStatus(status, 'Draft');
  const reviewed = normalized === 'Approved';
  return {
    version: Number.isFinite(options.version) && options.version > 0 ? Number(options.version) : 1,
    basedOnVersion: Number.isFinite(options.basedOnVersion) && options.basedOnVersion > 0 ? Number(options.basedOnVersion) : null,
    status: normalized === 'Published' ? 'Approved' : normalized,
    leadAuthorApproved: options.leadAuthorApproved == null ? reviewed : Boolean(options.leadAuthorApproved),
    adminApproved: options.adminApproved == null ? reviewed : Boolean(options.adminApproved),
    changeRequest: normalizeChangeRequest(options.changeRequest),
    changes: normalizeChanges(options.changes),
    createdAt: options.createdAt || null,
    updatedAt: options.updatedAt || null,
  };
}

function makeLive(version = 1, options = {}) {
  return {
    version: Number.isFinite(version) && version > 0 ? Number(version) : 1,
    status: 'Published',
    publishedAt: options.publishedAt || null,
    publishedBy: options.publishedBy || 'prototype',
  };
}

function canonicalDefaultFor(slug, fallback = 'Published') {
  const status = normalizeStatus(prototypePublicationDefaults[slug] || fallback, 'Published');
  return status === 'Published' ? { live: makeLive(1), pending: null } : { live: null, pending: makePending(status) };
}

function readJson(key) {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(key) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(next) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Keep the prototype usable if browser storage is unavailable.
  }
}

function normalizeLive(value) {
  if (!value || typeof value !== 'object') return null;
  return makeLive(value.version, value);
}

function normalizePending(value, fallbackStatus = 'Draft', fallbackVersion = 1, basedOnVersion = null) {
  if (!value || typeof value !== 'object') return makePending(fallbackStatus, { version: fallbackVersion, basedOnVersion });
  return makePending(value.status || fallbackStatus, {
    ...value,
    version: Number.isFinite(value.version) && value.version > 0 ? Number(value.version) : fallbackVersion,
    basedOnVersion: value.basedOnVersion ?? basedOnVersion,
  });
}

function legacyToCanonical(slug, value, fallback = 'Published') {
  const defaultModel = canonicalDefaultFor(slug, fallback);
  if (!value || typeof value !== 'object') return defaultModel;
  const status = normalizeStatus(value.status, defaultModel.live ? 'Published' : defaultModel.pending?.status || 'Draft');
  if (status === 'Published') {
    return {
      live: makeLive(1, { publishedAt: value.publishedAt || null, publishedBy: value.publishedBy || 'prototype' }),
      pending: value.revision && typeof value.revision === 'object' ? normalizePending(value.revision, 'Draft', 2, 1) : null,
    };
  }
  return {
    live: null,
    pending: normalizePending({
      status,
      leadAuthorApproved: value.leadAuthorApproved,
      adminApproved: value.adminApproved,
      changeRequest: value.changeRequest,
      changes: value.changes,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    }, status, 1, null),
  };
}

function normalizeCanonical(slug, value, fallback = 'Published') {
  if (!value || typeof value !== 'object') return canonicalDefaultFor(slug, fallback);
  if (!Object.prototype.hasOwnProperty.call(value, 'live') && !Object.prototype.hasOwnProperty.call(value, 'pending')) {
    return legacyToCanonical(slug, value, fallback);
  }
  const live = normalizeLive(value.live);
  let pending = null;
  if (value.pending && typeof value.pending === 'object') {
    const fallbackVersion = live ? live.version + 1 : 1;
    pending = normalizePending(value.pending, 'Draft', fallbackVersion, live?.version || null);
    if (live) {
      pending.version = Math.max(pending.version, live.version + 1);
      pending.basedOnVersion = live.version;
    } else {
      pending.basedOnVersion = null;
    }
  }
  if (!live && !pending) return canonicalDefaultFor(slug, fallback);
  return { live, pending };
}

function readStore() {
  const current = readJson(STORAGE_KEY);
  if (Object.keys(current).length) return current;
  for (const key of LEGACY_KEYS) {
    const legacy = readJson(key);
    if (!Object.keys(legacy).length) continue;
    const migrated = Object.fromEntries(
      Object.entries(legacy).map(([slug, value]) => [slug, normalizeCanonical(slug, value, prototypePublicationDefaults[slug] || 'Published')]),
    );
    writeStore(migrated);
    return migrated;
  }
  return {};
}

function compatibilityState(model) {
  if (model.live) {
    const revision = model.pending ? { ...model.pending } : null;
    return {
      status: 'Published',
      leadAuthorApproved: true,
      adminApproved: true,
      changeRequest: null,
      revision,
      liveVersion: { ...model.live },
      workflowVersion: revision?.version || model.live.version,
    };
  }
  const pending = model.pending || makePending('Draft');
  return { ...pending, revision: null, liveVersion: null, workflowVersion: pending.version };
}

function saveCourseModel(slug, model) {
  const normalized = normalizeCanonical(slug, model, 'Draft');
  if (slug) writeStore({ ...readStore(), [slug]: normalized });
  const state = compatibilityState(normalized);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bonsai:publication-status-changed', { detail: { slug, state, model: normalized } }));
  }
  return state;
}

function updatePending(model, patch) {
  if (!model.pending) return model;
  return { ...model, pending: { ...model.pending, ...patch, updatedAt: nowIso() } };
}

export function getCourseWorkflowModel(slug, fallback = 'Published') {
  if (!slug) return canonicalDefaultFor(slug, fallback);
  return normalizeCanonical(slug, readStore()[slug], fallback);
}

export function getCoursePublicationState(slug, fallback = 'Published') {
  return compatibilityState(getCourseWorkflowModel(slug, fallback));
}

export function getCoursePublicationStatus(slug, fallback = 'Published') {
  return getCoursePublicationState(slug, fallback).status;
}

export function getActiveCourseWorkflowState(slug, fallback = 'Published') {
  const state = getCoursePublicationState(slug, fallback);
  return state.revision || state;
}

export function getCoursePublicationDisplayStatus(slug, fallback = 'Published') {
  const state = getCoursePublicationState(slug, fallback);
  return state.revision ? `Published · Update ${state.revision.status}` : state.status;
}

export function getPublishedCourseVersion(slug, fallback = 'Published') {
  return getCourseWorkflowModel(slug, fallback).live?.version || null;
}

export function getPendingCourseRevision(slug, fallback = 'Published') {
  const pending = getCourseWorkflowModel(slug, fallback).pending;
  return pending ? { ...pending } : null;
}

export function registerCourseContentChange(slug, scope = 'Content', label = 'Content update', fallback = 'Draft') {
  const current = getCourseWorkflowModel(slug, fallback);
  const nextChange = { scope: String(scope || 'Content'), label: String(label || 'Content update') };
  const existing = current.pending;
  const changes = [...(existing?.changes || [])];
  if (!changes.some((item) => item.scope === nextChange.scope && item.label === nextChange.label)) changes.push(nextChange);
  const timestamp = nowIso();
  if (current.live) {
    const pending = existing || makePending('Draft', { version: current.live.version + 1, basedOnVersion: current.live.version, createdAt: timestamp });
    return saveCourseModel(slug, {
      live: current.live,
      pending: {
        ...pending,
        version: current.live.version + 1,
        basedOnVersion: current.live.version,
        status: 'Draft',
        leadAuthorApproved: false,
        adminApproved: false,
        changeRequest: null,
        changes,
        createdAt: pending.createdAt || timestamp,
        updatedAt: timestamp,
      },
    });
  }
  const pending = existing || makePending('Draft', { version: 1, createdAt: timestamp });
  return saveCourseModel(slug, {
    live: null,
    pending: {
      ...pending,
      status: 'Draft',
      leadAuthorApproved: false,
      adminApproved: false,
      changeRequest: null,
      changes,
      createdAt: pending.createdAt || timestamp,
      updatedAt: timestamp,
    },
  });
}

export function submitCourseForReview(slug) {
  const current = getCourseWorkflowModel(slug, 'Draft');
  if (!current.pending || current.pending.status !== 'Draft') return compatibilityState(current);
  return saveCourseModel(slug, updatePending(current, { status: 'Under Review', leadAuthorApproved: false, adminApproved: false, changeRequest: null }));
}

export function requestCoauthorChange(slug, text) {
  const current = getCourseWorkflowModel(slug, 'Draft');
  const requestText = String(text || '').trim();
  if (!current.pending || current.pending.status !== 'Under Review' || !requestText) return compatibilityState(current);
  return saveCourseModel(slug, updatePending(current, { leadAuthorApproved: false, changeRequest: { text: requestText, status: 'pending' } }));
}

export function approveCoauthorChange(slug) {
  const current = getCourseWorkflowModel(slug, 'Draft');
  if (!current.pending || current.pending.status !== 'Under Review' || current.pending.changeRequest?.status !== 'pending') return compatibilityState(current);
  return saveCourseModel(slug, updatePending(current, { changeRequest: { ...current.pending.changeRequest, status: 'approved' } }));
}

export function approveCourseReview(slug, actor) {
  const current = getCourseWorkflowModel(slug, 'Draft');
  const active = current.pending;
  if (!active || active.status !== 'Under Review' || !['leadAuthor', 'admin'].includes(actor)) return compatibilityState(current);
  if (active.changeRequest?.status === 'pending') return compatibilityState(current);
  const leadAuthorApproved = actor === 'leadAuthor' ? true : active.leadAuthorApproved;
  const adminApproved = actor === 'admin' ? true : active.adminApproved;
  return saveCourseModel(slug, updatePending(current, {
    leadAuthorApproved,
    adminApproved,
    status: leadAuthorApproved && adminApproved ? 'Approved' : 'Under Review',
  }));
}

export function publishCourse(slug, actor) {
  const current = getCourseWorkflowModel(slug, 'Draft');
  const active = current.pending;
  if (!active || active.status !== 'Approved' || !['leadAuthor', 'admin'].includes(actor)) return compatibilityState(current);
  return saveCourseModel(slug, {
    live: makeLive(active.version, { publishedAt: nowIso(), publishedBy: actor }),
    pending: null,
  });
}

export function isCoursePublished(slug) {
  return Boolean(getCourseWorkflowModel(slug, 'Published').live);
}
