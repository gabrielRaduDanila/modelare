import Plot from 'react-plotly.js';
import './ResponseSurface3D.css';
import { calcY } from '../../utils/model';

function buildGrid(model, alpha = Math.sqrt(2), steps = 35) {
  const xs = [];
  const ys = [];
  const zs = [];

  for (let i = 0; i < steps; i++) {
    const x = -alpha + (2 * alpha * i) / (steps - 1);
    xs.push(x);
  }
  for (let j = 0; j < steps; j++) {
    const y = -alpha + (2 * alpha * j) / (steps - 1);
    ys.push(y);
  }

  for (let j = 0; j < steps; j++) {
    const row = [];
    for (let i = 0; i < steps; i++) {
      // const x1 = xs[i];
      // const x2 = ys[j];
      row.push(calcY(model, xs[i], ys[j]));
    }
    zs.push(row);
  }

  return { xs, ys, zs };
}

function ResponseSurface3D({ title, model }) {
  if (!model) return null;

  const alpha = Math.sqrt(2);
  const { xs, ys, zs } = buildGrid(model, alpha, 35);

  return (
    <div className='surface'>
      <h3>{title}</h3>

      <Plot
        data={[
          {
            type: 'surface',
            x: xs,
            y: ys,
            z: zs,
          },
        ]}
        layout={{
          autosize: true,
          height: 520,
          margin: { l: 0, r: 0, b: 0, t: 30 },
          scene: {
            xaxis: { title: 'x₁ (codificat)' },
            yaxis: { title: 'x₂ (codificat)' },
            zaxis: { title: 'Răspuns (predicție)' },
          },
        }}
        style={{ width: '100%' }}
      />
      <p className='note'>
        * Suprafața este în spațiul codificat (−α…+α), α = √2.
      </p>
    </div>
  );
}

export default ResponseSurface3D;
