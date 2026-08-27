const STORAGE_KEY = 'bonsai-mooc.prototype.course-publication.v4';
const LEGACY_STORAGE_KEY = 'bonsai-mooc.prototype.course-publication.v3';

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
  return {
    text,
    status: value.status === 'approved' ? 'approved' : 'pending',
  };
}

function normalizeChanges(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      scope: String(item.scope || 'Content'),
      label: String(item.label || 'Content update'),
    }));
}

function makePending(status = 'Draft', options = {}) {
  const normalizedStatus = normalizeStatus(status, 'Draft');
  const reviewed = normalizedStatus === 'Approved';
  return {
    version: Number.isFinite(options.version) && options.version > 0 ? Number(options.version) : 1,
    basedOnVersion: Number.isFinite(options.basedOnVersion) && options.basedOnVersion > 0 ? Number(options.basedOnVersion) : null,
    status: normalizedStatus === 'Published' ? 'Approved' : normalizedStatus,
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
  if (status === 'Published') {
    return { live: makeLive(1), pending: null };
  }
  return { live: null, pending: makePending(status) };
}

function readJson(key) {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(key) || '{}');
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

function normalizeLive(value) {
  if (!value || typeof value !== 'object') return null;
  return makeLive(value.version, value);
}

function normalizePending(value, fallbackStatus = 'Draft', fallbackVersion = 1, basedOnVersion = null) {
  if (!value || typeof value !== 'object') return makePending(fallbackStatus, { version: fallbackVersion, basedOnVersion });
  const version = Number.isFinite(value.version) && value.version > 0 ? Number(value.version) : fallbackVersion;
  return makePending(value.status || fallbackStatus, {
    ...value,
    version,
    basedOnVersion: value.basedOnVersion ?? basedOnVersion,
  });
}

function legacyToCanonical(slug, value, fallback = 'Published') {
  const defaultModel = canonicalDefaultFor(slug, fallback);
  if (!value || typeof value !== 'object') return defaultModel;
  const status = normalizeStatus(value.status, defaultModel.live ? 'Published' : defaultModel.pending?.status || 'Draft');

  if (status === 'Published') {
    const live = makeLive(1, {
      publishedAt: value.publishedAt || null,
      publishedBy: value.publishedBy || 'prototype',
    });
    const revision = value.revision && typeof value.revision === 'object'
      ? normalizePending(value.revision, 'Draft', 2, 1)
      : null;
    return { live, pending: revision };
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

  const legacy = readJson(LEGACY_STORAGE_KEY);
  if (!Object.keys(legacy).length) return current;

  const migrated = Object.fromEntries(
    Object.entries(legacy).map(([slug, value]) => [slug, legacyToCanonical(slug, value, prototypePublicationDefaults[slug] || 'Published')]),
  );
  writeStore(migrated);
  return migrated;
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
  return {
    ...pending,
    revision: null,
    liveVersion: null,
    workflowVersion: pending.version,
  };
}

function saveCourseModel(slug, model) {
  if (!slug) return compatibilityState(normalizeCanonical(slug, model, 'Draft'));
  const normalized = normalizeCanonical(slug, model, 'Draft');
  const next = { ...readStore(), [slug]: normalized };
  writeStore(next);
  const state = compatibilityState(normalized);
  window.dispatchEvent(new CustomEvent('bonsai:publication-status-changed', {
    detail: { slug, state, model: normalized },
  }));
  return state;
}

function pendingFor(model) {
  return model.pending;
}

function updatePending(model, patch) {
  if (!model.pending) return model;
  return {
    ...model,
    pending: {
      ...model.pending,
      ...patch,
      updatedAt: nowIso(),
    },
  };
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
  const existing = pendingFor(current);
  const changes = [...(existing?.changes || [])];
  if (!changes.some((item) => item.scope === nextChange.scope && item.label === nextChange.label)) changes.push(nextChange);

  if (current.live) {
    const timestamp = nowIso();
    const pending = existing || makePending('Draft', {
      version: current.live.version + 1,
      basedOnVersion: current.live.version,
      createdAt: timestamp,
    });
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

  const timestamp = nowIso();
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
  const active = pendingFor(current);
  if (!active || active.status !== 'Draft') return compatibilityState(current);
  return saveCourseModel(slug, updatePending(current, {
    status: 'Under Review',
    leadAuthorApproved: false,
    adminApproved: false,
    changeRequest: null,
  }));
}

export function requestCoauthorChange(slug, text) {
  const current = getCourseWorkflowModel(slug, 'Draft');
  const active = pendingFor(current);
  const requestText = String(text || '').trim();
  if (!active || active.status !== 'Under Review' || !requestText) return compatibilityState(current);
  return saveCourseModel(slug, updatePending(current, {
    leadAuthorApproved: false,
    changeRequest: { text: requestText, status: 'pending' },
  }));
}

export function approveCoauthorChange(slug) {
  const current = getCourseWorkflowModel(slug, 'Draft');
  const active = pendingFor(current);
  if (!active || active.status !== 'Under Review' || active.changeRequest?.status !== 'pending') return compatibilityState(current);
  return saveCourseModel(slug, updatePending(current, {
    changeRequest: { ...active.changeRequest, status: 'approved' },
  }));
}

export function approveCourseReview(slug, actor) {
  const current = getCourseWorkflowModel(slug, 'Draft');
  const active = pendingFor(current);
  if (!active || active.status !== 'Under Review' || !['leadAuthor', 'admin'].includes(actor)) return compatibilityState(current);
  if (active.changeRequest?.status === 'pending') return compatibilityState(current);

  const nextApproval = {
    leadAuthorApproved: actor === 'leadAuthor' ? true : active.leadAuthorApproved,
    adminApproved: actor === 'admin' ? true : active.adminApproved,
  };
  const nextStatus = nextApproval.leadAuthorApproved && nextApproval.adminApproved ? 'Approved' : 'Under Review';
  return saveCourseModel(slug, updatePending(current, {
    ...nextApproval,
    status: nextStatus,
  }));
}

export function publishCourse(slug, actor) {
  const current = getCourseWorkflowModel(slug, 'Draft');
  const active = pendingFor(current);
  if (!active || active.status !== 'Approved' || !['leadAuthor', 'admin'].includes(actor)) return compatibilityState(current);

  const publishedAt = nowIso();
  return saveCourseModel(slug, {
    live: makeLive(active.version, {
      publishedAt,
      publishedBy: actor,
    }),
    pending: null,
  });
}

export function isCoursePublished(slug) {
  return Boolean(getCourseWorkflowModel(slug, 'Published').live);
}
