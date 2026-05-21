import './RegressionResults.css';

function format4(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return n.toFixed(4);
}

function Row({ label, value }) {
  return (
    <div className='row'>
      <span>{label}</span>
      <strong>{format4(value)}</strong>
    </div>
  );
}

function RegressionResults({ title, model }) {
  if (!model) {
    return (
      <div className='regression'>
        <h3>{title}</h3>
        <p>Introduceți minimum 6 valori valide pentru a calcula regresia.</p>
      </div>
    );
  }

  return (
    <div className='regression'>
      <h3>{title}</h3>

      <Row label='b₀' value={model.b0} />
      <Row label='b₁ (x₁)' value={model.b1} />
      <Row label='b₂ (x₂)' value={model.b2} />
      <Row label='b₁₁ (x₁²)' value={model.b11} />
      <Row label='b₂₂ (x₂²)' value={model.b22} />
      <Row label='b₁₂ (x₁·x₂)' value={model.b12} />

      <div className='equation'>
        <p>
          <strong>Ecuația modelului (gradul 2):</strong>
        </p>
        <p>ŷ = b₀ + b₁x₁ + b₂x₂ + b₁₁x₁² + b₂₂x₂² + b₁₂x₁x₂</p>
      </div>
    </div>
  );
}

export default RegressionResults;
