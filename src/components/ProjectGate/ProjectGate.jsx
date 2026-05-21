import { useMemo, useState } from 'react';
import './ProjectGate.css';

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString();
}

function ProjectGate({ projects, onCreate, onOpen, onDelete }) {
  const [mode, setMode] = useState(projects.length ? 'open' : 'new');
  const [newName, setNewName] = useState('Optimizare emulsie');
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? '');

  const selected = useMemo(
    () => projects.find((p) => p.id === selectedId),
    [projects, selectedId],
  );

  return (
    <div className='pg-wrap'>
      <h2 className='pg-title'>Alege proiectul</h2>

      {projects.length > 0 && (
        <div className='pg-tabs'>
          <button
            className={mode === 'open' ? 'pg-tab active' : 'pg-tab'}
            onClick={() => setMode('open')}
          >
            Deschide existent
          </button>
          <button
            className={mode === 'new' ? 'pg-tab active' : 'pg-tab'}
            onClick={() => setMode('new')}
          >
            Creează nou
          </button>
        </div>
      )}

      {mode === 'open' && projects.length > 0 ? (
        <div className='pg-card'>
          <label className='pg-label'>Proiect salvat:</label>
          <select
            className='pg-select'
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {selected && (
            <p className='pg-meta'>
              Ultima modificare:{' '}
              <strong>{formatDate(selected.updatedAt)}</strong>
            </p>
          )}
          <div className='pg-actions'>
            <button
              className='pg-primary'
              onClick={() => onOpen(selectedId)}
              disabled={!selectedId}
            >
              Deschide proiect
            </button>

            <button
              className='pg-danger'
              onClick={() => {
                if (!selectedId) return;
                const ok = window.confirm(
                  'Sigur vrei să ștergi acest proiect?',
                );
                if (ok) onDelete(selectedId);
              }}
              disabled={!selectedId}
              title='Șterge proiectul selectat'
            >
              Șterge proiect
            </button>
          </div>
        </div>
      ) : (
        <div className='pg-card'>
          <label className='pg-label'>Nume proiect:</label>
          <input
            className='pg-input'
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder='Ex: Emulsie U/A – lot 1'
          />
          <button
            className='pg-primary'
            onClick={() => onCreate(newName.trim() || 'Proiect nou')}
          >
            Creează proiect
          </button>
        </div>
      )}
    </div>
  );
}

export default ProjectGate;
