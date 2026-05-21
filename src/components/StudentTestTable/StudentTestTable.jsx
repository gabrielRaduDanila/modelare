import './StudentTestTable.css';

function fmt(v, d = 4) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(d) : '—';
}

function StudentTestTable({ title, result }) {
  if (!result) return null;

  return (
    <div className='st-wrap'>
      <h3 className='st-title'>{title}</h3>

      <div className='st-meta'>
        <span>
          df = <strong>{result.df}</strong>
        </span>
        <span>
          tCrit (α={result.alpha}) = <strong>{fmt(result.tCrit, 4)}</strong>
        </span>
      </div>

      <div className='st-scroll'>
        <table className='st-table'>
          <thead>
            <tr>
              <th>Coeficient</th>
              <th>b</th>
              <th>SE(b)</th>
              <th>t</th>
              <th>p-value</th>
              <th>Semnificativ?</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.name}>
                <td>{r.label}</td>
                <td>{fmt(r.b, 4)}</td>
                <td>{fmt(r.se, 4)}</td>
                <td>{fmt(r.t, 4)}</td>
                <td>{fmt(r.pValue, 6)}</td>
                <td>{r.significant ? 'DA' : 'NU'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentTestTable;
