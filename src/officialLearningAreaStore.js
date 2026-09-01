const STORAGE_KEY = 'bonsai-mooc.prototype.official-learning-areas.v1';

export const FOUNDATION_AREA = {
  id: 'foundation',
  name: 'Foundation',
  active: true,
  kind: 'foundation',
  note: 'Required common core · governed separately from specialization tracks',
};

export const DEFAULT_SPECIALIZATION_TRACKS = [
  { id: 'dike-stability-erosion', name: 'Dike Stability and Erosion', active: true },
  { id: 'animal-activities-burrows', name: 'Animal Activities and Burrows', active: true },
  { id: 'vegetation-nature-based-solutions', name: 'Vegetation and Nature-based Solutions', active: true },
  { id: 'flood-risk-emergency-management', name: 'Flood Risk and Emergency Management', active: true },
];

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `track-${Date.now()}`;
}

function normalizeTracks(value) {
  if (!Array.isArray(value)) return DEFAULT_SPECIALIZATION_TRACKS.map((item) => ({ ...item }));
  return value
    .filter((item) => item && typeof item === 'object' && String(item.name || '').trim())
    .map((item, index) => ({
      id: String(item.id || slugify(item.name) || `track-${index + 1}`),
      name: String(item.name).trim(),
      active: item.active !== false,
    }));
}

export function getOfficialTracks() {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || 'null');
    return normalizeTracks(parsed);
  } catch {
    return DEFAULT_SPECIALIZATION_TRACKS.map((item) => ({ ...item }));
  }
}

export function saveOfficialTracks(tracks) {
  const normalized = normalizeTracks(tracks);
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Keep the prototype usable when browser storage is restricted.
  }
  window.dispatchEvent(new CustomEvent('bonsai:official-learning-areas-changed', { detail: { tracks: normalized } }));
  return normalized;
}

export function createOfficialTrack(name) {
  const cleanName = String(name || '').trim();
  if (!cleanName) return getOfficialTracks();
  const current = getOfficialTracks();
  let id = slugify(cleanName);
  let suffix = 2;
  while (current.some((track) => track.id === id)) {
    id = `${slugify(cleanName)}-${suffix}`;
    suffix += 1;
  }
  return saveOfficialTracks([...current, { id, name: cleanName, active: true }]);
}

export function updateOfficialTrack(id, patch) {
  return saveOfficialTracks(getOfficialTracks().map((track) => track.id === id
    ? { ...track, ...patch, name: patch.name == null ? track.name : String(patch.name).trim() || track.name }
    : track));
}

export function moveOfficialTrack(id, direction) {
  const current = getOfficialTracks();
  const index = current.findIndex((track) => track.id === id);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= current.length) return current;
  const next = [...current];
  [next[index], next[target]] = [next[target], next[index]];
  return saveOfficialTracks(next);
}

export function deleteOfficialTrack(id) {
  return saveOfficialTracks(getOfficialTracks().filter((track) => track.id !== id));
}

export function getTeacherOfficialLearningAreas() {
  return [
    { name: FOUNDATION_AREA.name, note: 'Required common core · not a specialization track' },
    ...getOfficialTracks()
      .filter((track) => track.active)
      .map((track) => ({ name: track.name, note: 'Specialization track' })),
  ];
}
