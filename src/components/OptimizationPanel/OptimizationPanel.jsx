import { useMemo, useState } from 'react';
import './OptimizationPanel.css';
import { optimizeDesirability2Factors } from '../../utils/desirability';

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function fmt(v) {
  if (v == null || !Number.isFinite(v)) return '-';
  return v.toFixed(4);
}

function OptimizationPanel({ modelY1, modelY2, x1Min, x1Max, x2Min, x2Max }) {
  // ținte/limite pentru desirability (maximizare)
  const [y1Low, setY1Low] = useState('');
  const [y1High, setY1High] = useState('');
  const [y2Low, setY2Low] = useState('');
  const [y2High, setY2High] = useState('');

  // weights (opțional)
  const [w1, setW1] = useState(1);
  const [w2, setW2] = useState(1);

  // pas grilă
  const [step, setStep] = useState(0.05);

  const ready =
    modelY1 &&
    modelY2 &&
    num(x1Min) != null &&
    num(x1Max) != null &&
    num(x2Min) != null &&
    num(x2Max) != null &&
    num(y1Low) != null &&
    num(y1High) != null &&
    num(y2Low) != null &&
    num(y2High) != null &&
    num(y1Low) < num(y1High) &&
    num(y2Low) < num(y2High);

  const best = useMemo(() => {
    if (!ready) return null;

    return optimizeDesirability2Factors({
      modelY1,
      modelY2,
      x1Min: num(x1Min),
      x1Max: num(x1Max),
      x2Min: num(x2Min),
      x2Max: num(x2Max),
      y1Low: num(y1Low),
      y1High: num(y1High),
      y2Low: num(y2Low),
      y2High: num(y2High),
      w1: num(w1) ?? 1,
      w2: num(w2) ?? 1,
      step: num(step) ?? 0.05,
    });
  }, [
    ready,
    modelY1,
    modelY2,
    x1Min,
    x1Max,
    x2Min,
    x2Max,
    y1Low,
    y1High,
    y2Low,
    y2High,
    w1,
    w2,
    step,
  ]);

  return (
    <div className='opt-panel'>
      <h2>Optimizare multi-răspuns (Desirability)</h2>

      <p className='hint'>
        Setează intervalele dorite pentru răspunsuri (low → high). Aplicația
        maximizează simultan y₁ și y₂.
      </p>

      <div className='grid'>
        <div className='card'>
          <h3>y₁ Stabilitate</h3>
          <label>
            Low
            <input
              type='number'
              value={y1Low}
              onChange={(e) => setY1Low(e.target.value)}
            />
          </label>
          <label>
            High
            <input
              type='number'
              value={y1High}
              onChange={(e) => setY1High(e.target.value)}
            />
          </label>
          <label>
            Weight (w₁)
            <input
              type='number'
              min='0.1'
              step='0.1'
              value={w1}
              onChange={(e) => setW1(e.target.value)}
            />
          </label>
        </div>

        <div className='card'>
          <h3>y₂ Eliberare</h3>
          <label>
            Low
            <input
              type='number'
              value={y2Low}
              onChange={(e) => setY2Low(e.target.value)}
            />
          </label>
          <label>
            High
            <input
              type='number'
              value={y2High}
              onChange={(e) => setY2High(e.target.value)}
            />
          </label>
          <label>
            Weight (w₂)
            <input
              type='number'
              min='0.1'
              step='0.1'
              value={w2}
              onChange={(e) => setW2(e.target.value)}
            />
          </label>
        </div>

        <div className='card'>
          <h3>Setări căutare</h3>
          <label>
            Grid step (ex: 0.05)
            <input
              type='number'
              min='0.01'
              step='0.01'
              value={step}
              onChange={(e) => setStep(e.target.value)}
            />
          </label>
          <p className='small'>
            Pas mai mic = rezultat mai precis, dar mai lent.
          </p>
        </div>
      </div>

      {!ready && (
        <div className='warn'>
          Completează: y₁ low/high, y₂ low/high și asigură-te că există modele
          (minim 6 valori pentru y₁ și y₂).
        </div>
      )}

      {ready && best && (
        <div className='result'>
          <h3>Rezultat optim</h3>

          <div className='result-grid'>
            <div>
              <h4>Factori (real)</h4>
              <p>
                <strong>x₁:</strong> {fmt(best.x1_real)}
              </p>
              <p>
                <strong>x₂:</strong> {fmt(best.x2_real)}
              </p>
            </div>

            <div>
              <h4>Predicții</h4>
              <p>
                <strong>ŷ₁:</strong> {fmt(best.y1_hat)}
              </p>
              <p>
                <strong>ŷ₂:</strong> {fmt(best.y2_hat)}
              </p>
            </div>

            <div>
              <h4>Dorință</h4>
              <p>
                <strong>d₁:</strong> {fmt(best.d1)}
              </p>
              <p>
                <strong>d₂:</strong> {fmt(best.d2)}
              </p>
              <p>
                <strong>D:</strong> {fmt(best.D)}
              </p>
            </div>
          </div>

          <details className='details'>
            <summary>Detalii (valori codate)</summary>
            <p>
              <strong>x₁ cod:</strong> {fmt(best.x1_coded)}
            </p>
            <p>
              <strong>x₂ cod:</strong> {fmt(best.x2_coded)}
            </p>
          </details>
        </div>
      )}
    </div>
  );
}

export default OptimizationPanel;
