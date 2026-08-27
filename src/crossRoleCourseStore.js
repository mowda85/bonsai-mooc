const CONTENT_KEY = 'bonsai-mooc.prototype.cross-role-content.v1';
const RESULTS_KEY = 'bonsai-mooc.prototype.learner-results.v1';

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.sessionStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the prototype usable when session storage is unavailable.
  }
}

function emptyContentRecord() {
  return { live: null, pending: { course: null, units: [], quizzes: {} } };
}

function normalizeContentRecord(value) {
  if (!value || typeof value !== 'object') return emptyContentRecord();
  return {
    live: value.live && typeof value.live === 'object'
      ? {
          version: Number(value.live.version) || 1,
          course: value.live.course && typeof value.live.course === 'object' ? value.live.course : null,
          units: Array.isArray(value.live.units) ? value.live.units : [],
          quizzes: value.live.quizzes && typeof value.live.quizzes === 'object' ? value.live.quizzes : {},
          publishedAt: value.live.publishedAt || null,
        }
      : null,
    pending: value.pending && typeof value.pending === 'object'
      ? {
          course: value.pending.course && typeof value.pending.course === 'object' ? value.pending.course : null,
          units: Array.isArray(value.pending.units) ? value.pending.units : [],
          quizzes: value.pending.quizzes && typeof value.pending.quizzes === 'object' ? value.pending.quizzes : {},
        }
      : { course: null, units: [], quizzes: {} },
  };
}

function readContentStore() {
  const value = readJson(CONTENT_KEY, {});
  return value && typeof value === 'object' ? value : {};
}

function saveContentRecord(slug, record) {
  if (!slug) return null;
  const store = readContentStore();
  const next = normalizeContentRecord(record);
  store[slug] = next;
  writeJson(CONTENT_KEY, store);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bonsai:cross-role-content-changed', { detail: { slug, record: clone(next) } }));
  }
  return clone(next);
}

function currentRecord(slug) {
  return normalizeContentRecord(readContentStore()[slug]);
}

function mergeUnits(base = [], updates = []) {
  const next = base.map((unit) => ({ ...unit }));
  updates.forEach((unit) => {
    const index = next.findIndex((item) => item.id === unit.id);
    if (index >= 0) next[index] = { ...next[index], ...unit };
    else next.push({ ...unit });
  });
  return next;
}

export function getLiveCourseContent(slug) {
  return clone(currentRecord(slug).live);
}

export function getPendingCourseContent(slug) {
  return clone(currentRecord(slug).pending);
}

export function stageCourseMetadata(slug, course) {
  if (!slug || !course) return null;
  const record = currentRecord(slug);
  return saveContentRecord(slug, {
    ...record,
    pending: { ...record.pending, course: { ...(record.pending.course || {}), ...clone(course) } },
  });
}

export function stageUnitContent(slug, unit) {
  if (!slug || !unit?.id) return null;
  const record = currentRecord(slug);
  return saveContentRecord(slug, {
    ...record,
    pending: { ...record.pending, units: mergeUnits(record.pending.units, [clone(unit)]) },
  });
}

export function stageQuizContent(slug, unitId, quiz) {
  if (!slug || !unitId || !quiz) return null;
  const record = currentRecord(slug);
  return saveContentRecord(slug, {
    ...record,
    pending: {
      ...record.pending,
      quizzes: { ...record.pending.quizzes, [unitId]: clone(quiz) },
    },
  });
}

export function publishPendingCourseContent(slug, version = 1) {
  if (!slug) return null;
  const record = currentRecord(slug);
  const pending = record.pending || { course: null, units: [], quizzes: {} };
  const hasPending = Boolean(pending.course || pending.units.length || Object.keys(pending.quizzes).length);
  if (!hasPending) return clone(record);
  const live = record.live || { version: Math.max(1, Number(version) || 1), course: null, units: [], quizzes: {} };
  return saveContentRecord(slug, {
    live: {
      version: Math.max(1, Number(version) || live.version || 1),
      course: pending.course ? { ...(live.course || {}), ...pending.course } : live.course,
      units: mergeUnits(live.units, pending.units),
      quizzes: { ...(live.quizzes || {}), ...(pending.quizzes || {}) },
      publishedAt: new Date().toISOString(),
    },
    pending: { course: null, units: [], quizzes: {} },
  });
}

function readResults() {
  const value = readJson(RESULTS_KEY, []);
  return Array.isArray(value) ? value : [];
}

function saveResults(results) {
  writeJson(RESULTS_KEY, results);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('bonsai:learner-results-changed'));
}

export function getLearnerResultRecords(courseSlug) {
  const records = readResults();
  return clone(courseSlug ? records.filter((item) => item.courseSlug === courseSlug) : records);
}

export function saveLearnerProgressRecord(input) {
  if (!input?.learnerId || !input?.courseSlug) return null;
  const records = readResults();
  const id = `${input.learnerId}:${input.courseSlug}`;
  const existing = records.find((item) => item.id === id) || {};
  const record = {
    ...existing,
    ...clone(input),
    id,
    updatedAt: new Date().toISOString(),
  };
  const next = [...records.filter((item) => item.id !== id), record];
  saveResults(next);
  return clone(record);
}

export function saveLearnerQuizResult({ learnerId, learnerName, courseSlug, score, scoreTotal }) {
  const current = getLearnerResultRecords(courseSlug).find((item) => item.learnerId === learnerId) || {};
  return saveLearnerProgressRecord({
    ...current,
    learnerId,
    learnerName,
    courseSlug,
    quizScore: Number.isFinite(score) ? score : null,
    quizScoreTotal: Number.isFinite(scoreTotal) ? scoreTotal : null,
    quizStatus: 'Submitted',
  });
}
