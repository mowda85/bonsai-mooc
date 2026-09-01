import pilotActivity from '../content/pilot-course/activity.json';

export const PROTOTYPE_ACTIVITY_STORAGE_KEY = 'bonsai-mooc.prototype.activities.v1';

const PILOT_COURSE_SLUG = 'information-systems-knowledge-dissemination';
const PILOT_UNIT_TWO_ID = 'pilot-unit-2';

const PILOT_ACTIVITY_FALLBACK = {
  ...pilotActivity,
  source: 'pilot-content',
};

function readStoredActivities() {
  if (typeof window === 'undefined') return [];
  try {
    const value = window.sessionStorage.getItem(PROTOTYPE_ACTIVITY_STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getPrototypeActivity(courseSlug, unitId) {
  const stored = readStoredActivities().find((activity) => activity.courseSlug === courseSlug && activity.unitId === unitId);
  if (stored) return stored;
  if (courseSlug === PILOT_COURSE_SLUG && unitId === PILOT_UNIT_TWO_ID) return PILOT_ACTIVITY_FALLBACK;
  return null;
}

export function savePrototypeActivity(activity) {
  const saved = {
    courseSlug: activity.courseSlug,
    unitId: activity.unitId,
    title: activity.title.trim(),
    instructions: activity.instructions.trim(),
    source: 'teacher',
  };
  const current = readStoredActivities();
  const next = [
    ...current.filter((item) => !(item.courseSlug === saved.courseSlug && item.unitId === saved.unitId)),
    saved,
  ];
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(PROTOTYPE_ACTIVITY_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The prototype can still continue in-memory if browser session storage is unavailable.
    }
  }
  return saved;
}
