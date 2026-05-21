import { calcY } from './model';

// src/utils/anova.js

// Ecuația modelului (exact cum ai cerut):
// y = b0 + b1*x1 + b2*x2 + b11*x1^2 + b22*x2^2 + b12*x1*x2
// function calcY(model, x1, x2) {
//   if (!model) return null;

//   const n = {
//     b0: Number(model.b0),
//     b1: Number(model.b1),
//     b2: Number(model.b2),
//     b11: Number(model.b11),
//     b22: Number(model.b22),
//     b12: Number(model.b12),
//   };

// dacă vreun coeficient e NaN -> model invalid
//   if (!Object.values(n).every((v) => Number.isFinite(v))) return null;

//   return (
//     n.b0 +
//     n.b1 * x1 +
//     n.b2 * x2 +
//     n.b11 * (x1 ** 2) +
//     n.b22 * (x2 ** 2) +
//     n.b12 * (x1 * x2)
//   );
// }

function isValidNumber(value) {
  const n = Number(value);
  return Number.isFinite(n);
}

/**
 * ANOVA / calitate potrivire pentru model quadratic (2 factori).
 * Calculează:
 * - SST, SSE, SSR
 * - R^2
 * - MSE, RMSE
 * - dfE (grade de libertate eroare)
 *
 * runs: array de rulari CCD (cu x1_coded, x2_coded, y1/y2)
 * responseKey: 'y1' sau 'y2'
 * model: { b0, b1, b2, b11, b22, b12 }
 */
export function anovaQuadratic2Factors(runs, responseKey, model) {
  if (!Array.isArray(runs) || !responseKey || !model) return null;

  // date valide pentru răspuns
  const valid = runs
    .filter((r) => isValidNumber(r?.[responseKey]))
    .map((r) => ({
      x1: Number(r.x1_coded),
      x2: Number(r.x2_coded),
      y: Number(r[responseKey]),
    }));

  const n = valid.length;
  const p = 6; // număr coeficienți (b0,b1,b2,b11,b22,b12)

  // trebuie minim n > p ca să ai dfE > 0
  if (n <= p) return null;

  const yMean = valid.reduce((s, r) => s + r.y, 0) / n;

  let sse = 0;
  let sst = 0;

  for (const r of valid) {
    const yHat = calcY(model, r.x1, r.x2);
    if (yHat == null) return null;

    const err = r.y - yHat;
    sse += err * err;

    const dev = r.y - yMean;
    sst += dev * dev;
  }

  const ssr = sst - sse;

  // R^2 (dacă SST=0 -> toate y sunt identice)
  const r2 = sst === 0 ? 1 : 1 - sse / sst;

  const dfE = n - p;
  const mse = sse / dfE;
  const rmse = Math.sqrt(mse);

  return {
    n, // număr observații
    p, // parametri
    sst,
    ssr,
    sse,
    r2,
    dfE,
    mse,
    rmse,
  };
}

/**
 * Bonus util: generează un "tabel ca în lucrare"
 * cu y_masurat, y_calculat, (y-yc)^2.
 * Îl poți folosi pentru un tabel în UI (Tabelul 3).
 */
export function buildYcalcTable(runs, responseKey, model) {
  if (!Array.isArray(runs) || !responseKey || !model) return [];

  return runs.map((r) => {
    const y = isValidNumber(r?.[responseKey]) ? Number(r[responseKey]) : null;
    const yCalc = calcY(model, Number(r.x1_coded), Number(r.x2_coded));

    const err2 =
      y != null && yCalc != null && Number.isFinite(yCalc)
        ? (y - yCalc) ** 2
        : null;

    return {
      run: r.run,
      type: r.type,
      x1_coded: r.x1_coded,
      x2_coded: r.x2_coded,
      y,
      yCalc,
      err2,
    };
  });
}
