// src/components/CCDTable/CCDTable.jsx
import './CCDTable.css';

function CCDTable({ runs, responseDefs, onChangeY }) {
  return (
    <div className='ccdTableWrap'>
      <h2>Tabel CCD</h2>

      <div className='tableScroll'>
        <table className='ccdTable'>
          <thead>
            <tr>
              <th>Run</th>
              <th>Tip</th>
              <th>x₁ (cod)</th>
              <th>x₂ (cod)</th>
              <th>x₁ (real)</th>
              <th>x₂ (real)</th>

              {/* ✅ coloane y dinamice */}
              {responseDefs.map((r) => (
                <th key={r.key}>
                  {r.label} ({r.key})
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {runs.map((row) => (
              <tr key={row.run}>
                <td>{row.run}</td>
                <td>{row.type}</td>
                <td>{Number(row.x1_coded).toFixed(4)}</td>
                <td>{Number(row.x2_coded).toFixed(4)}</td>
                <td>{Number(row.x1_real).toFixed(4)}</td>
                <td>{Number(row.x2_real).toFixed(4)}</td>

                {/* ✅ inputuri y dinamice */}
                {responseDefs.map((rDef) => (
                  <td key={rDef.key}>
                    <input
                      className='yInput'
                      type='number'
                      value={row.responses?.[rDef.key] ?? ''}
                      onChange={(e) =>
                        onChangeY(row.run, rDef.key, e.target.value)
                      }
                      placeholder='—'
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CCDTable;
