import Plot from 'react-plotly.js';
import './ResponseContour2D.css';

function calcY(model, x1, x2) {
  if (!model) return null;

  const { b0, b1, b2, b11, b22, b12 } = model;

  return b0 + b1 * x1 + b2 * x2 + b11 * x1 * x1 + b22 * x2 * x2 + b12 * x1 * x2;
}

function ResponseContour2D({ title, model }) {
  if (!model) return null;

  const steps = 40;
  const min = -1.5;
  const max = 1.5;

  const x1 = [];
  const x2 = [];
  const z = [];

  for (let i = 0; i < steps; i++) {
    x1.push(min + (i / (steps - 1)) * (max - min));
    x2.push(min + (i / (steps - 1)) * (max - min));
  }

  for (let i = 0; i < x2.length; i++) {
    const row = [];
    for (let j = 0; j < x1.length; j++) {
      row.push(calcY(model, x1[j], x2[i]));
    }
    z.push(row);
  }

  return (
    <div className='contour-container'>
      <h3 className='contour-title'>{title}</h3>

      <Plot
        className='contour-plot'
        data={[
          {
            x: x1,
            y: x2,
            z: z,
            type: 'contour',
            colorscale: 'Viridis',
            contours: {
              coloring: 'heatmap',
              showlabels: true,
            },
          },
        ]}
        layout={{
          autosize: true,
          xaxis: { title: 'x₁ (codificat)' },
          yaxis: { title: 'x₂ (codificat)' },
          margin: { t: 40, l: 60, r: 30, b: 60 },
        }}
        useResizeHandler={true}
      />
    </div>
  );
}

export default ResponseContour2D;
