const INDEX_KEY = 'ccd_projects_index_v1';
const PROJECT_PREFIX = 'ccd_project_v1:';

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function listProjects() {
  const idx = safeParse(localStorage.getItem(INDEX_KEY), []);
  // idx = [{ id, name, updatedAt }]
  return Array.isArray(idx) ? idx : [];
}

export function createProject(name) {
  const id = crypto?.randomUUID?.() ?? String(Date.now());
  const now = Date.now();

  const idx = listProjects();
  const nextIdx = [{ id, name, updatedAt: now }, ...idx];
  localStorage.setItem(INDEX_KEY, JSON.stringify(nextIdx));

  // proiectul în sine îl creezi ulterior cu saveProject
  return { id, name };
}

export function renameProject(id, newName) {
  const idx = listProjects().map((p) =>
    p.id === id ? { ...p, name: newName, updatedAt: Date.now() } : p,
  );
  localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
}

export function deleteProject(id) {
  const idx = listProjects().filter((p) => p.id !== id);
  localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
  localStorage.removeItem(PROJECT_PREFIX + id);
}

export function loadProject(id) {
  const raw = localStorage.getItem(PROJECT_PREFIX + id);
  return raw ? safeParse(raw, null) : null;
}

export function saveProject(id, data) {
  const now = Date.now();
  localStorage.setItem(
    PROJECT_PREFIX + id,
    JSON.stringify({ ...data, updatedAt: now }),
  );

  // update index updatedAt
  const idx = listProjects();
  const found = idx.find((p) => p.id === id);
  let nextIdx;

  if (found) {
    nextIdx = idx.map((p) => (p.id === id ? { ...p, updatedAt: now } : p));
  } else {
    // dacă cumva indexul lipsește
    const name = data?.name ?? 'Proiect fără nume';
    nextIdx = [{ id, name, updatedAt: now }, ...idx];
  }

  localStorage.setItem(INDEX_KEY, JSON.stringify(nextIdx));
}
