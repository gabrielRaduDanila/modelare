import './DiagnosticsTable.css';

function fmt(v, d = 4) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(d) : '—';
}

function DiagnosticsTable({ title, data }) {
  if (!data) return null;

  return (
    <div className='dt-wrap'>
      <h3 className='dt-title'>{title}</h3>

      <div className='dt-scroll'>
        <table className='dt-table'>
          <thead>
            <tr>
              <th>Nr. Exp</th>
              <th>Ymăs</th>
              <th>Ycalc</th>
              <th>(Y−Ycalc)²</th>
              <th>(Y−Ymed)²</th>
              <th>A (%)</th>
            </tr>
          </thead>

          <tbody>
            {data.rows.map((r) => (
              <tr key={r.run}>
                <td>{r.run}</td>
                <td>{fmt(r.yMas, 4)}</td>
                <td>{fmt(r.yCalc, 4)}</td>
                <td>{fmt(r.err2, 4)}</td>
                <td>{fmt(r.dev2, 4)}</td>
                <td>{fmt(r.A, 4)}</td>
              </tr>
            ))}

            <tr className='dt-total'>
              <td>
                <strong>Total</strong>
              </td>
              <td>
                <strong>{fmt(data.totalYMas, 4)}</strong>
              </td>
              <td>
                <strong>{fmt(data.totalYCalc, 4)}</strong>
              </td>
              <td colSpan={3}></td>
            </tr>

            <tr className='dt-total'>
              <td>
                <strong>Medie</strong>
              </td>
              <td>
                <strong>{fmt(data.meanYMas, 4)}</strong>
              </td>
              <td>
                <strong>{fmt(data.meanYCalc, 4)}</strong>
              </td>
              <td colSpan={3}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DiagnosticsTable;
