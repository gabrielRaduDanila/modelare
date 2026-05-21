// src/utils/studentTest.js

// --- helpers matrice ---
function transpose(A) {
  return A[0].map((_, i) => A.map((row) => row[i]));
}

function multiply(A, B) {
  return A.map((row) =>
    B[0].map((_, j) => row.reduce((sum, val, i) => sum + val * B[i][j], 0))
  );
}

// inversare matrice NxN (Gauss-Jordan)
function inverseMatrix(M) {
  const size = M.length;
  const A = M.map((row) => row.slice());
  const I = M.map((row, i) => row.map((_, j) => (i === j ? 1 : 0)));

  for (let i = 0; i < size; i++) {
    let pivot = A[i][i];
    if (Math.abs(pivot) < 1e-12) return null;

    for (let j = 0; j < size; j++) {
      A[i][j] /= pivot;
      I[i][j] /= pivot;
    }

    for (let k = 0; k < size; k++) {
      if (k === i) continue;
      const f = A[k][i];
      for (let j = 0; j < size; j++) {
        A[k][j] -= f * A[i][j];
        I[k][j] -= f * I[i][j];
      }
    }
  }
  return I;
}

function isValidNumber(v) {
  const n = Number(v);
  return Number.isFinite(n);
}

// yhat cu ecuația ta
function calcY(model, x1, x2) {
  const { b0, b1, b2, b11, b22, b12 } = model;
  return (
    b0 + b1 * x1 + b2 * x2 + b11 * x1 ** 2 + b22 * x2 ** 2 + b12 * (x1 * x2)
  );
}

/**
 * Test Student pentru coeficienții modelului quadratic (2 factori).
 * Rulează pe x1_coded, x2_coded și y din runs.responses[responseKey].
 *
 * Returnează: df, mse, rmse și pentru fiecare coeficient: b, se, t.
 * (p-value îl putem adăuga imediat după, dacă vrei)
 */
export function studentTest2Factors(runs, responseKey, model) {
  if (!model) return null;

  const valid = runs
    .filter((r) => isValidNumber(r?.responses?.[responseKey]))
    .map((r) => ({
      x1: Number(r.x1_coded),
      x2: Number(r.x2_coded),
      y: Number(r.responses[responseKey]),
    }));

  const n = valid.length;
  const p = 6;
  if (n <= p) return null;

  // X matrix (n x 6)
  const X = valid.map((r) => [
    1,
    r.x1,
    r.x2,
    r.x1 ** 2,
    r.x2 ** 2,
    r.x1 * r.x2,
  ]);

  // const y = valid.map((r) => r.y);

  // SSE din modelul ales (paper sau matrix) - important să fie consistent cu predicția
  let sse = 0;
  for (const r of valid) {
    const yhat = calcY(model, r.x1, r.x2);
    const err = r.y - yhat;
    sse += err * err;
  }

  const df = n - p;
  const mse = sse / df;
  const rmse = Math.sqrt(mse);

  // (X'X)^-1
  const XT = transpose(X);
  const XTX = multiply(XT, X);
  const XTXinv = inverseMatrix(XTX);
  if (!XTXinv) return null;

  // SE(bi) = sqrt(MSE * diag((X'X)^-1))
  const diag = XTXinv.map((row, i) => row[i]);
  const se = diag.map((d) => Math.sqrt(mse * d));

  const coef = [
    { name: 'b0', label: 'b₀', b: Number(model.b0) },
    { name: 'b1', label: 'b₁ (x₁)', b: Number(model.b1) },
    { name: 'b2', label: 'b₂ (x₂)', b: Number(model.b2) },
    { name: 'b11', label: 'b₁₁ (x₁²)', b: Number(model.b11) },
    { name: 'b22', label: 'b₂₂ (x₂²)', b: Number(model.b22) },
    { name: 'b12', label: 'b₁₂ (x₁·x₂)', b: Number(model.b12) },
  ];

  const rows = coef.map((c, i) => {
    const sei = se[i];
    const ti = sei > 0 ? c.b / sei : null;
    return { ...c, se: sei, t: ti };
  });

  return { n, p, df, mse, rmse, rows };
}
