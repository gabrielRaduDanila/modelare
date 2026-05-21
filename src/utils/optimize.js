import { calcY } from './model';

// function predict(model, x1, x2) {
//   return (
//     model.b0 +
//     model.b1 * x1 +
//     model.b2 * x2 +
//     model.b11 * x1 * x1 +
//     model.b22 * x2 * x2 +
//     model.b12 * x1 * x2
//   );
// }

function decodeFromCoded(xCoded, min, max) {
  const center = (min + max) / 2;
  const delta = (max - min) / 2;
  return center + xCoded * delta;
}

// desirability pentru maximizare între [low, high]
function dMax(y, low, high) {
  if (y <= low) return 0;
  if (y >= high) return 1;
  return (y - low) / (high - low);
}

export function optimizeDesirability2Factors({
  modelY1,
  modelY2,
  runs,
  x1Min,
  x1Max,
  x2Min,
  x2Max,
  gridSteps = 61,
}) {
  // folosim intervalul observat ca low/high (simplu & ok academic)
  const y1Vals = runs
    .filter((r) => r.y1 !== '' && !Number.isNaN(Number(r.y1)))
    .map((r) => Number(r.y1));
  const y2Vals = runs
    .filter((r) => r.y2 !== '' && !Number.isNaN(Number(r.y2)))
    .map((r) => Number(r.y2));
  const y1Low = Math.min(...y1Vals);
  const y1High = Math.max(...y1Vals);
  const y2Low = Math.min(...y2Vals);
  const y2High = Math.max(...y2Vals);

  // căutare pe grilă în spațiul codat (CCD clasic: [-alpha, alpha])
  const alpha = Math.sqrt(2);
  const minC = -alpha;
  const maxC = alpha;

  let best = null;

  for (let i = 0; i < gridSteps; i++) {
    const x1c = minC + (i * (maxC - minC)) / (gridSteps - 1);
    for (let j = 0; j < gridSteps; j++) {
      const x2c = minC + (j * (maxC - minC)) / (gridSteps - 1);

      const y1p = calcY(modelY1, x1c, x2c);
      const y2p = calcY(modelY2, x1c, x2c);

      const d1 = dMax(y1p, y1Low, y1High);
      const d2 = dMax(y2p, y2Low, y2High);

      const D = Math.sqrt(d1 * d2);

      if (!best || D > best.D) {
        best = {
          D,
          x1_coded: x1c,
          x2_coded: x2c,
          x1_real: decodeFromCoded(x1c, x1Min, x1Max),
          x2_real: decodeFromCoded(x2c, x2Min, x2Max),
          y1_pred: y1p,
          y2_pred: y2p,
        };
      }
    }
  }

  return best;
}
