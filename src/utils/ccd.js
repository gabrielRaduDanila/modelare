function decodeFromCoded(xCoded, min, max) {
  const center = (min + max) / 2;
  const delta = (max - min) / 2;
  return center + xCoded * delta;
}

// Dacă ai "paper-mode" cu alpha=1.414 și decode special, păstrează-l.
// Aici folosesc decodeFromCoded(...) așa cum îl ai deja.

export function generateCCD2FactorsRotatable({
  x1Min,
  x1Max,
  x2Min,
  x2Max,
  centerPoints = 5,
  responseKeys = ['y1', 'y2'],
}) {
  const a = Math.sqrt(2);

  if (
    [x1Min, x1Max, x2Min, x2Max].some((v) => Number.isNaN(v)) ||
    x1Min >= x1Max ||
    x2Min >= x2Max
  ) {
    return [];
  }

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
    const x1 = decodeFromCoded(r.x1c, x1Min, x1Max);
    const x2 = decodeFromCoded(r.x2c, x2Min, x2Max);

    const responses = Object.fromEntries(responseKeys.map((k) => [k, '']));

    return {
      run: idx + 1,
      type: r.type,
      replicateIndex: r.replicateIndex ?? null,
      x1_coded: r.x1c,
      x2_coded: r.x2c,
      x1_real: x1,
      x2_real: x2,
      responses,
    };
  });
}

/**
 * CCD rotabil, 2 factori, ordinul 2.
 * - 4 factoriale
 * - 4 axiale (alpha = sqrt(2))
 * - centerPoints replici în centru (default 5) => total 8 + centerPoints
 */
// export function generateCCD2FactorsRotatable({
//   x1Min,
//   x1Max,
//   x2Min,
//   x2Max,
//   centerPoints = 5,
// }) {
//   const a = 1.414; // paper alpha

//   // Validări simple
//   if (
//     [x1Min, x1Max, x2Min, x2Max].some((v) => Number.isNaN(v)) ||
//     x1Min >= x1Max ||
//     x2Min >= x2Max
//   ) {
//     return [];
//   }

//   // ✅ FACTORIAL: folosește x1c/x2c (nu x1/x2), altfel iese undefined
//   const factorial = [
//     { x1c: -1, x2c: -1, type: 'factorial' },
//     { x1c: 1, x2c: -1, type: 'factorial' },
//     { x1c: -1, x2c: 1, type: 'factorial' },
//     { x1c: 1, x2c: 1, type: 'factorial' },
//   ];

//   const axial = [
//     { x1c: -a, x2c: 0, type: 'axial' },
//     { x1c: a, x2c: 0, type: 'axial' },
//     { x1c: 0, x2c: -a, type: 'axial' },
//     { x1c: 0, x2c: a, type: 'axial' },
//   ];

//   const center = Array.from({ length: centerPoints }, (_, i) => ({
//     x1c: 0,
//     x2c: 0,
//     type: i === 0 ? 'center' : 'center-replicate',
//     replicateIndex: i + 1,
//   }));

//   const codedRuns = [...factorial, ...axial, ...center];

//   // Decode în valori reale
//   const runs = codedRuns.map((r, idx) => {
//     const x1 = decodeFromCodedPaper(r.x1c, x1Min, x1Max, a);
//     const x2 = decodeFromCodedPaper(r.x2c, x2Min, x2Max, a);

//     return {
//       run: idx + 1,
//       type: r.type,
//       replicateIndex: r.replicateIndex ?? null,
//       x1_coded: r.x1c,
//       x2_coded: r.x2c,
//       x1_real: x1,
//       x2_real: x2,
//       y1: '',
//       y2: '',
//     };
//   });

//   return runs;
// }

export function decodeFromCodedPaper(
  xCoded,
  minAtMinusAlpha,
  maxAtPlusAlpha,
  alpha = 1.414,
) {
  const center = (minAtMinusAlpha + maxAtPlusAlpha) / 2;
  const delta = (maxAtPlusAlpha - minAtMinusAlpha) / (2 * alpha);
  return center + xCoded * delta;
}
