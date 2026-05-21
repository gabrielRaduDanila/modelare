// src/utils/statsTests.js
import jstatPkg from 'jstat';
const jStat = jstatPkg?.jStat ?? jstatPkg;

function isValidNumber(v) {
  const n = Number(v);
  return Number.isFinite(n);
}

export function predictY2Factors(model, x1, x2) {
  const { b0, b1, b2, b11, b22, b12 } = model;
  return b0 + b1 * x1 + b2 * x2 + b11 * x1 * x1 + b22 * x2 * x2 + b12 * x1 * x2;
}

// --- helpers matrice ---
function transpose(A) {
  return A[0].map((_, i) => A.map((row) => row[i]));
}
function multiply(A, B) {
  return A.map((row) =>
    B[0].map((_, j) => row.reduce((sum, val, i) => sum + val * B[i][j], 0)),
  );
}
function inverseMatrix(M) {
  const size = M.length;
  const A = M.map((row) => row.slice());
  const I = M.map((row, i) => row.map((_, j) => (i === j ? 1 : 0)));

  for (let i = 0; i < size; i++) {
    const pivot = A[i][i];
    if (!Number.isFinite(pivot) || Math.abs(pivot) < 1e-12) return null;

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

/**
 * Test Student (t) pentru coeficienți + p-value.
 * df = n - p (p=6 coeficienți).
 */
export function studentTest2Factors({
  runs,
  responseKey,
  model,
  alpha = 0.05,
}) {
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

  // X (n x 6)
  const X = data.map((r) => [1, r.x1, r.x2, r.x1 ** 2, r.x2 ** 2, r.x1 * r.x2]);

  // SSE
  let sse = 0;
  for (const r of data) {
    const yhat = predictY2Factors(model, r.x1, r.x2);
    const e = r.y - yhat;
    sse += e * e;
  }

  const df = n - p;
  const mse = sse / df;

  // (X'X)^-1
  const XT = transpose(X);
  const XTX = multiply(XT, X);
  const XTXinv = inverseMatrix(XTX);
  if (!XTXinv) return null;

  // SE(bi) = sqrt(MSE * diag(inv))
  const se = XTXinv.map((row, i) => Math.sqrt(mse * row[i]));

  const coef = [
    { name: 'b0', label: 'b₀', b: Number(model.b0) },
    { name: 'b1', label: 'b₁ (x₁)', b: Number(model.b1) },
    { name: 'b2', label: 'b₂ (x₂)', b: Number(model.b2) },
    { name: 'b11', label: 'b₁₁ (x₁²)', b: Number(model.b11) },
    { name: 'b22', label: 'b₂₂ (x₂²)', b: Number(model.b22) },
    { name: 'b12', label: 'b₁₂ (x₁·x₂)', b: Number(model.b12) },
  ];

  // const tCrit = jStat.studentt.inv(1 - alpha / 2, df);
  // const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));
  let tCrit = null;
  if (jStat?.studentt?.inv) {
    tCrit = jStat.studentt.inv(1 - alpha / 2, df);
  }

  const rows = coef.map((c, i) => {
    const sei = se[i];
    const t = sei > 0 ? c.b / sei : null;

    let pValue = null;
    if (t != null && jStat?.studentt?.cdf) {
      pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));
    }

    const significant =
      t != null && Number.isFinite(tCrit) ? Math.abs(t) >= tCrit : false;

    return { ...c, se: sei, t, pValue, significant };
  });

  if (!Number.isFinite(tCrit)) {
    console.warn('tCrit invalid. Verifică importul jStat.', {
      df,
      alpha,
      tCrit,
      jStat,
    });
  }

  // const rows = coef.map((c, i) => {
  //   const sei = se[i];
  //   const t = sei > 0 ? c.b / sei : null;
  //   const pValue =
  //     t == null ? null : 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));
  //   const significant = t != null ? Math.abs(t) >= tCrit : false;

  //   return { ...c, se: sei, t, pValue, significant };
  // });

  return { n, df, mse, tCrit, alpha, rows };
}

/**
 * Test Fischer–Snedecor pentru concordanță/adecvare ca în lucrare:
 * Fc = s_conc^2 / s0^2 și condiția Fc <= Ftab (alpha=0.05) :contentReference[oaicite:3]{index=3}
 *
 * - s0^2: dispersia reproductibilității în punctele centrale (x1=0,x2=0) :contentReference[oaicite:4]{index=4}
 * - s_conc^2: dispersia de concordanță (SSE/(n-p))
 * - df_num = n-p
 * - df_den = n0-1  (n0 = nr puncte centrale)
 */
export function fisherConcordance2Factors({
  runs,
  responseKey,
  model,
  alpha = 0.05,
}) {
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

  // center points (cod 0,0)
  const centers = data.filter((r) => r.x1 === 0 && r.x2 === 0);
  const n0 = centers.length;
  if (n0 < 2) return null; // ai nevoie de replici în centru

  const y0bar = centers.reduce((s, r) => s + r.y, 0) / n0;

  // s0^2 = 1/(n0-1) Σ(yi0 - y0bar)^2 (dispersia reproductibilității) :contentReference[oaicite:5]{index=5}
  let ss0 = 0;
  for (const r of centers) {
    const d = r.y - y0bar;
    ss0 += d * d;
  }
  const df_den = n0 - 1;
  const s0sq = ss0 / df_den;

  // SSE total
  let sse = 0;
  for (const r of data) {
    const yhat = predictY2Factors(model, r.x1, r.x2);
    const e = r.y - yhat;
    sse += e * e;
  }

  // s_conc^2 = SSE/(n-p)
  const df_num = n - p;
  const sConcSq = sse / df_num;

  const Fc = sConcSq / s0sq;

  // Ftab = F_{1-alpha}(df_num, df_den)
  const Ftab = jStat.centralF.inv(1 - alpha, df_num, df_den);

  const adequate = Fc <= Ftab; // condiția din lucrare :contentReference[oaicite:6]{index=6}

  return {
    n,
    p,
    n0,
    y0bar,
    df_num,
    df_den,
    s0sq,
    sConcSq,
    Fc,
    Ftab,
    alpha,
    adequate,
  };
}

export function buildDiagnosticsTable2Factors({ runs, responseKey, model }) {
  if (!model) return null;

  const rowsBase = runs
    .filter((r) => isValidNumber(r?.responses?.[responseKey]))
    .map((r) => ({
      run: r.run,
      x1: Number(r.x1_coded),
      x2: Number(r.x2_coded),
      yMas: Number(r.responses[responseKey]),
    }));

  if (rowsBase.length === 0) return null;

  const yMed = rowsBase.reduce((s, r) => s + r.yMas, 0) / rowsBase.length;
  const rows = rowsBase.map((r) => {
    const yCalc = predictY2Factors(model, r.x1, r.x2);
    const diff = r.yMas - yCalc;
    const err2 = diff * diff;
    const dev2 = (r.yMas - yMed) ** 2;
    const A = r.yMas !== 0 ? (Math.abs(diff) / Math.abs(r.yMas)) * 100 : null;

    return {
      run: r.run,
      yMas: r.yMas,
      yCalc,
      err2,
      dev2,
      A,
    };
  });

  const totalYMas = rows.reduce((s, r) => s + r.yMas, 0);
  const totalYCalc = rows.reduce((s, r) => s + r.yCalc, 0);

  return {
    yMed,
    totalYMas,
    totalYCalc,
    meanYMas: totalYMas / rows.length,
    meanYCalc: totalYCalc / rows.length,
    rows,
  };
}
