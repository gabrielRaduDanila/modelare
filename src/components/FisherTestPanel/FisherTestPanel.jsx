import './FisherTestPanel.css';

function fmt(v, d = 4) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(d) : '—';
}

function FisherTestPanel({ title, result }) {
  if (!result) return null;

  return (
    <div className='ft-wrap'>
      <h3 className='ft-title'>{title}</h3>

      <div className='ft-grid'>
        <div>
          <strong>n0</strong>: {result.n0}
        </div>
        <div>
          <strong>df_num</strong> (n-p): {result.df_num}
        </div>
        <div>
          <strong>df_den</strong> (n0-1): {result.df_den}
        </div>

        <div>
          <strong>s0²</strong>: {fmt(result.s0sq)}
        </div>
        <div>
          <strong>sConc²</strong>: {fmt(result.sConcSq)}
        </div>

        <div>
          <strong>Fc</strong>: {fmt(result.Fc)}
        </div>
        <div>
          <strong>Ftab</strong> (α={result.alpha}): {fmt(result.Ftab)}
        </div>
      </div>

      <p className='ft-concl'>
        Condiție adecvare : <strong>Fc ≤ Ftab</strong>
        <br />
        Rezultat: {result.adequate ? '✅ Model ADECVAT' : '❌ Model NEADECVAT'}
      </p>
    </div>
  );
}

export default FisherTestPanel;
