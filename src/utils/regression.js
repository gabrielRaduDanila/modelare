const COEFFICIENT_COUNT = 6;

function designRow(x1, x2) {
  return [1, x1, x2, x1 * x1, x2 * x2, x1 * x2];
}

// Gauss-Jordan with partial pivoting on the augmented normal-equation matrix.
function solve(augmented) {
  const size = augmented.length;

  for (let col = 0; col < size; col++) {
    let pivot = col;
    for (let row = col + 1; row < size; row++) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[pivot][col])) {
        pivot = row;
      }
    }

    const pivotValue = augmented[pivot][col];
    if (!Number.isFinite(pivotValue) || Math.abs(pivotValue) < 1e-10) {
      return null;
    }

    [augmented[col], augmented[pivot]] = [augmented[pivot], augmented[col]];

    for (let j = col; j <= size; j++) augmented[col][j] /= pivotValue;

    for (let row = 0; row < size; row++) {
      if (row === col) continue;
      const factor = augmented[row][col];
      if (factor === 0) continue;
      for (let j = col; j <= size; j++) {
        augmented[row][j] -= factor * augmented[col][j];
      }
    }
  }

  return augmented.map((row) => row[size]);
}

/**
 * Second-order model y = b0 + b1·x1 + b2·x2 + b11·x1² + b22·x2² + b12·x1·x2
 * fitted by ordinary least squares, b = (XᵀX)⁻¹Xᵀy, on the coded factors.
 *
 * Works for any number of center-point replicates, unlike the closed-form
 * coefficients tabulated for the 13-run rotatable design.
 */
export function quadraticRegression2Factors(runs, responseKey) {
  const data = (runs ?? [])
    .filter((r) => {
      if (!r) return false;
      const value = r.responses?.[responseKey];
      return value !== '' && value != null && Number.isFinite(Number(value));
    })
    .map((r) => ({
      row: designRow(Number(r.x1_coded), Number(r.x2_coded)),
      y: Number(r.responses[responseKey]),
    }));

  if (data.length < COEFFICIENT_COUNT) return null;

  const augmented = Array.from({ length: COEFFICIENT_COUNT }, (_, i) => {
    const normalRow = Array.from({ length: COEFFICIENT_COUNT }, (_, j) =>
      data.reduce((sum, d) => sum + d.row[i] * d.row[j], 0),
    );
    normalRow.push(data.reduce((sum, d) => sum + d.row[i] * d.y, 0));
    return normalRow;
  });

  const b = solve(augmented);
  if (!b || b.some((v) => !Number.isFinite(v))) return null;

  return { b0: b[0], b1: b[1], b2: b[2], b11: b[3], b22: b[4], b12: b[5] };
}
