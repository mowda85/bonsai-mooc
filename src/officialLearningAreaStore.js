import { BONSAI_CATEGORIES } from './courseArchitecture.js';

const STORAGE_KEY = 'bonsai-mooc.prototype.official-learning-categories.v2';

export const DEFAULT_CATEGORIES = BONSAI_CATEGORIES.map((category) => ({
  id: category.slug,
  name: category.name,
  active: true,
  kind: 'category',
}));

// Legacy exports remain so existing bridge imports keep working while the UI uses Category terminology.
export const FOUNDATION_AREA = {
  id: 'information-systems-knowledge-dissemination',
  name: 'Information Systems & Knowledge Dissemination',
  active: true,
  kind: 'category',
  note: 'Official BONSAI course category',
};

export const DEFAULT_SPECIALIZATION_TRACKS = DEFAULT_CATEGORIES;

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `category-${Date.now()}`;
}

function normalizeCategories(value) {
  if (!Array.isArray(value)) return DEFAULT_CATEGORIES.map((item) => ({ ...item }));
  return value
    .filter((item) => item && typeof item === 'object' && String(item.name || '').trim())
    .map((item, index) => ({
      id: String(item.id || slugify(item.name) || `category-${index + 1}`),
      name: String(item.name).trim(),
      active: item.active !== false,
      kind: 'category',
    }));
}

export function getOfficialCategories() {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || 'null');
    return normalizeCategories(parsed);
  } catch {
    return DEFAULT_CATEGORIES.map((item) => ({ ...item }));
  }
}

export function saveOfficialCategories(categories) {
  const normalized = normalizeCategories(categories);
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Keep the prototype usable when browser storage is restricted.
  }
  window.dispatchEvent(new CustomEvent('bonsai:official-learning-areas-changed', {
    detail: { categories: normalized, tracks: normalized },
  }));
  return normalized;
}

export function createOfficialCategory(name) {
  const cleanName = String(name || '').trim();
  if (!cleanName) return getOfficialCategories();
  const current = getOfficialCategories();
  let id = slugify(cleanName);
  let suffix = 2;
  while (current.some((category) => category.id === id)) {
    id = `${slugify(cleanName)}-${suffix}`;
    suffix += 1;
  }
  return saveOfficialCategories([...current, { id, name: cleanName, active: true, kind: 'category' }]);
}

export function updateOfficialCategory(id, patch) {
  return saveOfficialCategories(getOfficialCategories().map((category) => category.id === id
    ? { ...category, ...patch, kind: 'category', name: patch.name == null ? category.name : String(patch.name).trim() || category.name }
    : category));
}

export function moveOfficialCategory(id, direction) {
  const current = getOfficialCategories();
  const index = current.findIndex((category) => category.id === id);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= current.length) return current;
  const next = [...current];
  [next[index], next[target]] = [next[target], next[index]];
  return saveOfficialCategories(next);
}

export function deleteOfficialCategory(id) {
  return saveOfficialCategories(getOfficialCategories().filter((category) => category.id !== id));
}

export function getTeacherOfficialLearningAreas() {
  return getOfficialCategories()
    .filter((category) => category.active)
    .map((category) => ({ name: category.name, note: 'Official category' }));
}

// Backward-compatible function names used by existing prototype bridges/components.
export const getOfficialTracks = getOfficialCategories;
export const saveOfficialTracks = saveOfficialCategories;
export const createOfficialTrack = createOfficialCategory;
export const updateOfficialTrack = updateOfficialCategory;
export const moveOfficialTrack = moveOfficialCategory;
export const deleteOfficialTrack = deleteOfficialCategory;
