const STORAGE_KEY = 'bonsai-mooc.prototype.course-requirements.v1';

function emptyRequirements() {
  return { externalPrerequisites: [], internalDependencies: [] };
}

function normalizeExternal(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object' && String(item.title || item.label || '').trim())
    .map((item, index) => ({
      id: String(item.id || `external-${index + 1}`),
      title: String(item.title || item.label || '').trim(),
      description: String(item.description || '').trim(),
      level: item.level === 'required' ? 'required' : 'recommended',
    }));
}

function normalizeInternal(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object' && String(item.targetId || '').trim())
    .map((item, index) => ({
      id: String(item.id || `internal-${index + 1}`),
      targetType: ['course', 'unit', 'lesson', 'activity', 'assessment'].includes(item.targetType) ? item.targetType : 'course',
      targetId: String(item.targetId || '').trim(),
      targetLabel: String(item.targetLabel || item.targetId || '').trim(),
      rule: item.rule === 'pass' ? 'pass' : 'complete',
      required: item.required !== false,
    }));
}

function normalizeRequirements(value) {
  return {
    externalPrerequisites: normalizeExternal(value?.externalPrerequisites),
    internalDependencies: normalizeInternal(value?.internalDependencies),
  };
}

function readAll() {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(value) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Keep the prototype usable when browser storage is restricted.
  }
}

export function getCourseRequirements(courseSlug) {
  if (!courseSlug) return emptyRequirements();
  return normalizeRequirements(readAll()[courseSlug]);
}

export function saveCourseRequirements(courseSlug, requirements) {
  if (!courseSlug) return normalizeRequirements(requirements);
  const normalized = normalizeRequirements(requirements);
  const next = { ...readAll(), [courseSlug]: normalized };
  writeAll(next);
  window.dispatchEvent(new CustomEvent('bonsai:course-requirements-changed', {
    detail: { courseSlug, requirements: normalized },
  }));
  return normalized;
}

export function mergeCourseRequirements(course) {
  if (!course?.slug) return { ...course, ...emptyRequirements() };
  const persisted = getCourseRequirements(course.slug);
  const hasPersisted = persisted.externalPrerequisites.length || persisted.internalDependencies.length;
  return {
    ...course,
    externalPrerequisites: hasPersisted ? persisted.externalPrerequisites : normalizeExternal(course.externalPrerequisites),
    internalDependencies: hasPersisted ? persisted.internalDependencies : normalizeInternal(course.internalDependencies),
  };
}

export function dependencyStatus(course, learnerState = {}) {
  const normalized = mergeCourseRequirements(course);
  const completedCourses = new Set(learnerState.completedCourseSlugs || []);
  const unmetRequired = normalized.internalDependencies.filter((dependency) => {
    if (!dependency.required) return false;
    if (dependency.targetType !== 'course') return false;
    return !completedCourses.has(dependency.targetId);
  });
  return { locked: unmetRequired.length > 0, unmetRequired, course: normalized };
}
