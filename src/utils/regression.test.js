import { describe, expect, it } from 'vitest';

import { generateCCD2FactorsRotatable } from './ccd';
import { quadraticRegression2Factors } from './regression';

const PAPER_Y = [
  7.4894, 8.6894, 45.3758, 47.4689, 5.9526, 6.7345, 20.6893, 75.2644, 5.5478,
  5.3454, 4.9856, 5.1853, 5.7397,
];

function buildRuns(yValues, centerPoints) {
  const runs = generateCCD2FactorsRotatable({
    x1Min: 1,
    x1Max: 2,
    x2Min: 1,
    x2Max: 3,
    centerPoints,
    responseKeys: ['y1'],
  });

  const factorialAndAxial = yValues.slice(0, 8);
  const centerValues = yValues.slice(8);
  const y = runs.map((r, i) =>
    i < 8
      ? factorialAndAxial[i]
      : centerValues[(i - 8) % centerValues.length],
  );

  return runs.map((r, i) => ({
    ...r,
    responses: { y1: String(y[i]) },
  }));
}

// Reference least-squares solver, independent of the implementation under test.
function referenceLeastSquares(runs, responseKey) {
  const rows = runs.map((r) => ({
    x: [
      1,
      r.x1_coded,
      r.x2_coded,
      r.x1_coded ** 2,
      r.x2_coded ** 2,
      r.x1_coded * r.x2_coded,
    ],
    y: Number(r.responses[responseKey]),
  }));

  const p = 6;
  const aug = Array.from({ length: p }, (_, i) => {
    const row = Array.from({ length: p }, (_, j) =>
      rows.reduce((s, r) => s + r.x[i] * r.x[j], 0),
    );
    row.push(rows.reduce((s, r) => s + r.x[i] * r.y, 0));
    return row;
  });

  for (let c = 0; c < p; c++) {
    let pivot = c;
    for (let r = c + 1; r < p; r++) {
      if (Math.abs(aug[r][c]) > Math.abs(aug[pivot][c])) pivot = r;
    }
    [aug[c], aug[pivot]] = [aug[pivot], aug[c]];

    const d = aug[c][c];
    for (let j = c; j <= p; j++) aug[c][j] /= d;

    for (let r = 0; r < p; r++) {
      if (r === c) continue;
      const f = aug[r][c];
      for (let j = c; j <= p; j++) aug[r][j] -= f * aug[c][j];
    }
  }

  const b = aug.map((r) => r[p]);
  return { b0: b[0], b1: b[1], b2: b[2], b11: b[3], b22: b[4], b12: b[5] };
}

describe('quadraticRegression2Factors', () => {
  it('reproduces the published coefficients for 5 center points', () => {
    const model = quadraticRegression2Factors(buildRuns(PAPER_Y, 5), 'y1');

    expect(model.b0).toBeCloseTo(5.3608, 4);
    expect(model.b1).toBeCloseTo(0.5499, 4);
    expect(model.b2).toBeCloseTo(19.2308, 4);
    expect(model.b11).toBeCloseTo(0.5153, 4);
    expect(model.b22).toBeCloseTo(21.332, 3);
    expect(model.b12).toBeCloseTo(0.2233, 4);
  });

  it.each([3, 4, 5, 6, 8])(
    'matches an independent least-squares fit with %i center points',
    (centerPoints) => {
      const runs = buildRuns(PAPER_Y, centerPoints);
      const model = quadraticRegression2Factors(runs, 'y1');
      const expected = referenceLeastSquares(runs, 'y1');

      for (const key of ['b0', 'b1', 'b2', 'b11', 'b22', 'b12']) {
        expect(model[key]).toBeCloseTo(expected[key], 9);
      }
    },
  );

  it('fits an exactly quadratic response without residual error', () => {
    const truth = (x1, x2) =>
      2 + 3 * x1 - 1.5 * x2 + 0.75 * x1 ** 2 - 0.25 * x2 ** 2 + 1.25 * x1 * x2;

    const base = generateCCD2FactorsRotatable({
      x1Min: 1,
      x1Max: 2,
      x2Min: 1,
      x2Max: 3,
      centerPoints: 3,
      responseKeys: ['y1'],
    });

    const runs = base.map((r) => ({
      ...r,
      responses: { y1: String(truth(r.x1_coded, r.x2_coded)) },
    }));

    const model = quadraticRegression2Factors(runs, 'y1');

    expect(model.b0).toBeCloseTo(2, 9);
    expect(model.b1).toBeCloseTo(3, 9);
    expect(model.b2).toBeCloseTo(-1.5, 9);
    expect(model.b11).toBeCloseTo(0.75, 9);
    expect(model.b22).toBeCloseTo(-0.25, 9);
    expect(model.b12).toBeCloseTo(1.25, 9);
  });

  it('ignores runs with empty or non-numeric responses', () => {
    const runs = buildRuns(PAPER_Y, 5);
    const withBlank = runs.map((r, i) =>
      i === 12 ? { ...r, responses: { y1: '' } } : r,
    );

    const model = quadraticRegression2Factors(withBlank, 'y1');
    const expected = referenceLeastSquares(withBlank.slice(0, 12), 'y1');

    for (const key of ['b0', 'b1', 'b2', 'b11', 'b22', 'b12']) {
      expect(model[key]).toBeCloseTo(expected[key], 9);
    }
  });

  it('returns null when there are fewer runs than coefficients', () => {
    const runs = buildRuns(PAPER_Y, 5).slice(0, 5);
    expect(quadraticRegression2Factors(runs, 'y1')).toBeNull();
  });

  it('returns null when the design is rank deficient', () => {
    const runs = buildRuns(PAPER_Y, 5).map((r) => ({
      ...r,
      x1_coded: 0,
      x2_coded: 0,
    }));

    expect(quadraticRegression2Factors(runs, 'y1')).toBeNull();
  });
});

describe('generateCCD2FactorsRotatable', () => {
  it('places the axial points of x1 at 0.793 and 2.207 for a 1-2% range', () => {
    const runs = generateCCD2FactorsRotatable({
      x1Min: 1,
      x1Max: 2,
      x2Min: 1,
      x2Max: 3,
      centerPoints: 5,
      responseKeys: ['y1'],
    });

    const axial = runs.filter((r) => r.type === 'axial');
    expect(axial[0].x1_real).toBeCloseTo(0.793, 3);
    expect(axial[1].x1_real).toBeCloseTo(2.207, 3);
  });
});
