import { predictY2Factors } from './statsTests';

function isValidNumber(v) {
  const n = Number(v);
  return Number.isFinite(n);
}

export function correlation2Factors({ runs, responseKey, model }) {
  if (!model) return null;

  const data = runs
    .filter((r) => isValidNumber(r?.responses?.[responseKey]))
    .map((r) => ({
      x1: Number(r.x1_coded),
      x2: Number(r.x2_coded),
      y: Number(r.responses[responseKey]),
    }));

  const n = data.length;
  const p = 6;
  if (n <= p) return null;

  const yBar = data.reduce((s, r) => s + r.y, 0) / n;

  let SS_T = 0;
  let SS_E = 0;

  for (const r of data) {
    const yHat = predictY2Factors(model, r.x1, r.x2);
    SS_T += (r.y - yBar) ** 2;
    SS_E += (r.y - yHat) ** 2;
  }

  const R2 = SS_T > 0 ? 1 - SS_E / SS_T : null;
  const R = R2 != null && R2 >= 0 ? Math.sqrt(R2) : null;

  const R2_adj = SS_T > 0 ? 1 - SS_E / (n - p) / (SS_T / (n - 1)) : null;

  return {
    n,
    R,
    R2,
    R2_adj,
  };
}
