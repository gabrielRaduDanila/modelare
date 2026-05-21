import { decodeFromCodedPaper } from './ccd';

export function generateCCD2FactorsRotatable({
  x1Min,
  x1Max,
  x2Min,
  x2Max,
  centerPoints = 5,
}) {
  const a = 1.414; // ca în lucrare :contentReference[oaicite:4]{index=4}

  if (
    [x1Min, x1Max, x2Min, x2Max].some((v) => Number.isNaN(v)) ||
    x1Min >= x1Max ||
    x2Min >= x2Max
  ) {
    return [];
  }

  // ordinea ca în Tabelul 2 :contentReference[oaicite:5]{index=5}
  const factorial = [
    { x1c: -1, x2c: -1, type: 'factorial' },
    { x1c: 1, x2c: -1, type: 'factorial' },
    { x1c: -1, x2c: 1, type: 'factorial' },
    { x1c: 1, x2c: 1, type: 'factorial' },
  ];

  const axial = [
    { x1c: -a, x2c: 0, type: 'axial' },
    { x1c: a, x2c: 0, type: 'axial' },
    { x1c: 0, x2c: -a, type: 'axial' },
    { x1c: 0, x2c: a, type: 'axial' },
  ];

  const center = Array.from({ length: centerPoints }, (_, i) => ({
    x1c: 0,
    x2c: 0,
    type: i === 0 ? 'center' : 'center-replicate',
    replicateIndex: i + 1,
  }));

  const codedRuns = [...factorial, ...axial, ...center];

  return codedRuns.map((r, idx) => {
    const x1 = decodeFromCodedPaper(r.x1c, x1Min, x1Max, a);
    const x2 = decodeFromCodedPaper(r.x2c, x2Min, x2Max, a);

    return {
      run: idx + 1,
      type: r.type,
      replicateIndex: r.replicateIndex ?? null,
      x1_coded: r.x1c,
      x2_coded: r.x2c,
      x1_real: x1,
      x2_real: x2,
      y1: '',
      y2: '',
    };
  });
}

function transpose(A) {
  return A[0].map((_, i) => A.map((row) => row[i]));
}

function multiply(A, B) {
  return A.map((row) =>
    B[0].map((_, j) => row.reduce((sum, val, i) => sum + val * B[i][j], 0)),
  );
}

// function inverse2D(M) {
//   const det = M[0][0] * M[1][1] - M[0][1] * M[1][0];

//   return [
//     [M[1][1] / det, -M[0][1] / det],
//     [-M[1][0] / det, M[0][0] / det],
//   ];
// }

function inverseMatrix(M) {
  const size = M.length;
  const I = M.map((row, i) => row.map((_, j) => (i === j ? 1 : 0)));

  for (let i = 0; i < size; i++) {
    let factor = M[i][i];
    for (let j = 0; j < size; j++) {
      M[i][j] /= factor;
      I[i][j] /= factor;
    }

    for (let k = 0; k < size; k++) {
      if (k !== i) {
        const f = M[k][i];
        for (let j = 0; j < size; j++) {
          M[k][j] -= f * M[i][j];
          I[k][j] -= f * I[i][j];
        }
      }
    }
  }
  return I;
}

export function quadraticRegression2Factors(runs, responseKey) {
  const valid = runs.filter(
    (r) => r[responseKey] !== '' && r[responseKey] != null,
  );

  if (valid.length < 6) return null;

  const X = valid.map((r) => [
    1,
    r.x1_coded,
    r.x2_coded,
    r.x1_coded ** 2,
    r.x2_coded ** 2,
    r.x1_coded * r.x2_coded,
  ]);

  const y = valid.map((r) => [Number(r[responseKey])]);

  const XT = transpose(X);
  const XTX = multiply(XT, X);
  const XTy = multiply(XT, y);
  const XTXinv = inverseMatrix(JSON.parse(JSON.stringify(XTX)));
  const B = multiply(XTXinv, XTy);

  const model = {
    b0: B[0][0],
    b1: B[1][0],
    b2: B[2][0],
    b11: B[3][0],
    b22: B[4][0],
    b12: B[5][0],
  };

  model.predict = (x1c, x2c) =>
    model.b0 +
    model.b1 * x1c +
    model.b2 * x2c +
    model.b11 * x1c * x1c +
    model.b22 * x2c * x2c +
    model.b12 * x1c * x2c;

  return model;
}

// export function quadraticRegression2FactorsPaperCCD(runs, responseKey) {
//   // folosim doar rularile cu y definit numeric
//   const valid = runs.filter(
//     (r) =>
//       r[responseKey] !== '' &&
//       r[responseKey] != null &&
//       !Number.isNaN(Number(r[responseKey]))
//   );

//   // lucrarea e pentru 13 puncte (4 factorial + 4 axial + 5 centru)
//   // dar poți lăsa să meargă și dacă sunt mai multe replici în centru, doar că NU mai e identic cu lucrarea.
//   if (valid.length < 13) return null;

//   // IMPORTANT: formula paper se bazează pe x1_coded, x2_coded
//   const y = valid.map((r) => Number(r[responseKey]));
//   const x1 = valid.map((r) => Number(r.x1_coded));
//   const x2 = valid.map((r) => Number(r.x2_coded));

//   const sum = (arr) => arr.reduce((s, v) => s + v, 0);

//   const Sy = sum(y);
//   const Sx1y = sum(y.map((yy, i) => x1[i] * yy));
//   const Sx2y = sum(y.map((yy, i) => x2[i] * yy));
//   const Sx1x2y = sum(y.map((yy, i) => x1[i] * x2[i] * yy));
//   const Sx1sqy = sum(y.map((yy, i) => x1[i] * x1[i] * yy));
//   const Sx2sqy = sum(y.map((yy, i) => x2[i] * x2[i] * yy));

//   // ✅ conform relațiilor specifice din lucrare (CCD rotabil, 2 factori, 13 puncte)
//   // b0 = 0.2 Σy - 0.1( Σx1^2 y + Σx2^2 y )  (relația 4) :contentReference[oaicite:3]{index=3}
//   const b0 = 0.2 * Sy - 0.1 * (Sx1sqy + Sx2sqy);

//   // b1 = 0.125 Σ x1 y (relația 5) :contentReference[oaicite:4]{index=4}
//   const b1 = 0.125 * Sx1y;

//   // b2 = 0.125 Σ x2 y (relația 6) :contentReference[oaicite:5]{index=5}
//   const b2 = 0.125 * Sx2y;

//   // b12 = 0.25 Σ x1 x2 y  (în lucrare apare relația 9; numeric asta reproduce valorile din tabelul Ycalc) :contentReference[oaicite:6]{index=6}
//   const b12 = 0.25 * Sx1x2y;

//   // b11 / b22 – formulele specifice CCD (relațiile 7–8).
//   // În lucrare sunt date ca expresii cu constante (0.125, 0.01875 etc.). :contentReference[oaicite:7]{index=7}
//   // Pentru designul rotabil cu 13 puncte, forma echivalentă care reproduce exact coeficienții din lucrare este:
//   const C = -0.04775477246313877; // constantă specifică designului (rezultă din ortogonalitatea CCD 2 factori)
//   const b11 = 0.10625 * Sx1sqy - 0.01875 * Sx2sqy + C * Sy;
//   const b22 = 0.10625 * Sx2sqy - 0.01875 * Sx1sqy + C * Sy;

//   return { b0, b1, b2, b11, b22, b12 };
// }

// Calculează coeficienții
// IMPORTANT: folosește x1_coded, x2_coded și y (numeric) pentru toate punctele incluse.

export function quadraticRegression2FactorsPaper(runs, responseKey) {
  const valid = runs
    .filter((r) => {
      if (!r) return false;
      const yVal = r.responses?.[responseKey];
      return yVal !== '' && yVal != null && !Number.isNaN(Number(yVal));
    })
    .map((r) => ({
      x1: Number(r.x1_coded),
      x2: Number(r.x2_coded),
      y: Number(r.responses[responseKey]),
    }));

  if (valid.length < 6) return null;

  let Sy = 0;
  let Sx1y = 0;
  let Sx2y = 0;
  let Sx1x2y = 0;
  let Sx1sqy = 0;
  let Sx2sqy = 0;

  for (const r of valid) {
    const x1 = r.x1;
    const x2 = r.x2;
    const y = r.y;

    Sy += y;
    Sx1y += x1 * y;
    Sx2y += x2 * y;
    Sx1x2y += x1 * x2 * y;
    Sx1sqy += x1 ** 2 * y;
    Sx2sqy += x2 ** 2 * y;
  }

  const b0 = 0.2 * Sy - 0.1 * (Sx1sqy + Sx2sqy);

  const b1 = 0.125 * Sx1y;

  const b2 = 0.125 * Sx2y;

  const b11 = 0.125 * Sx1sqy + 0.01875 * (Sx1sqy + Sx2sqy) - 0.1 * Sy;

  const b22 = 0.125 * Sx2sqy + 0.01875 * (Sx1sqy + Sx2sqy) - 0.1 * Sy;

  const b12 = 0.25 * Sx1x2y;

  return { b0, b1, b2, b11, b22, b12 };
}
