import './FactorsForm.css';

function FactorsForm({
  x1Min,
  x1Max,
  setX1Min,
  setX1Max,
  x2Min,
  x2Max,
  setX2Min,
  setX2Max,
}) {
  return (
    <div className='factors-form'>
      <h2>Variabile independente (x)</h2>

      <h3>
        x<sub>1</sub>
      </h3>
      <div className='form-group'>
        <label>Minim</label>
        <input
          type='number'
          value={x1Min}
          onChange={(e) => setX1Min(e.target.value)}
        />
      </div>

      <div className='form-group'>
        <label>Maxim</label>
        <input
          type='number'
          value={x1Max}
          onChange={(e) => setX1Max(e.target.value)}
        />
      </div>

      <h3>
        x<sub>2</sub>
      </h3>
      <div className='form-group'>
        <label>Minim</label>
        <input
          type='number'
          value={x2Min}
          onChange={(e) => setX2Min(e.target.value)}
        />
      </div>

      <div className='form-group'>
        <label>Maxim</label>
        <input
          type='number'
          value={x2Max}
          onChange={(e) => setX2Max(e.target.value)}
        />
      </div>

      <div className='values'>
        <strong>Intervale definite:</strong>
        <p>
          x₁: {x1Min} → {x1Max}
        </p>
        <p>
          x₂: {x2Min} → {x2Max}
        </p>
      </div>
    </div>
  );
}

export default FactorsForm;
