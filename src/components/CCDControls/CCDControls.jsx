import './CCDControls.css';

function CCDControls({
  centerPoints,
  setCenterPoints,
  canGenerate,
  onGenerate,
  totalRuns,
  onExportCSV,
}) {
  return (
    <div className='ccd-controls'>
      <h2>Design CCD</h2>

      <div className='row'>
        <label className='label'>Număr puncte centrale (replici)</label>
        <input
          className='input'
          type='number'
          min='1'
          value={centerPoints}
          onChange={(e) => setCenterPoints(e.target.value)}
        />
      </div>

      <div className='buttons'>
        <button className='btn' onClick={onGenerate} disabled={!canGenerate}>
          Generează CCD
        </button>

        <button
          className='btn secondary'
          onClick={onExportCSV}
          disabled={totalRuns === 0}
        >
          Export CSV
        </button>
      </div>

      <p className='meta'>
        Total probe: <strong>{totalRuns}</strong>
      </p>
    </div>
  );
}

export default CCDControls;
