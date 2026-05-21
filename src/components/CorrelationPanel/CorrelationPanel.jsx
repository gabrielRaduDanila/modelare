import './CorrelationPanel.css';

function fmt(v, d = 4) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(d) : '—';
}

function CorrelationPanel({ title, result }) {
  if (!result) return null;

  return (
    <div className='cp-wrap'>
      <h3 className='cp-title'>{title}</h3>

      <div className='cp-grid'>
        <div>
          <strong>R</strong> (coef. corelație): {fmt(result.R)}
        </div>
        <div>
          <strong>R²</strong> (determinare): {fmt(result.R2)}
        </div>
        <div>
          <strong>R² adj</strong>: {fmt(result.R2_adj)}
        </div>
        <div>
          <strong>n</strong>: {result.n}
        </div>
      </div>

      <p className='cp-note'>
        R² apropiat de 1 indică o bună concordanță între valorile măsurate și
        cele calculate.
      </p>
    </div>
  );
}

export default CorrelationPanel;
