import { describe, expect, it } from 'vitest';

import { generateCCD2FactorsRotatable } from './ccd';
import { quadraticRegression2Factors } from './regression';
import { correlation2Factors } from './correlation';
import { formatPValue } from './format';
import {
  buildDiagnosticsTable2Factors,
  fisherConcordance2Factors,
  studentTest2Factors,
} from './statsTests';

// Published data set: 2 factors, x1 1-2 %, x2 1-3 %, 5 center points.
const PAPER_Y = [
  7.4894, 8.6894, 45.3758, 47.4689, 5.9526, 6.7345, 20.6893, 75.2644, 5.5478,
  5.3454, 4.9856, 5.1853, 5.7397,
];

const runs = generateCCD2FactorsRotatable({
  x1Min: 1,
  x1Max: 2,
  x2Min: 1,
  x2Max: 3,
  centerPoints: 5,
  responseKeys: ['y1'],
}).map((r, i) => ({ ...r, responses: { y1: String(PAPER_Y[i]) } }));

const model = quadraticRegression2Factors(runs, 'y1');

describe('published data set', () => {
  it('generates the axial points at the published real values', () => {
    const axial = runs.filter((r) => r.type === 'axial');

    expect(axial.map((r) => Number(r.x1_real.toFixed(3)))).toEqual([
      0.793, 2.207, 1.5, 1.5,
    ]);
    expect(axial.map((r) => Number(r.x2_real.toFixed(3)))).toEqual([
      2, 2, 0.586, 3.414,
    ]);
  });

  it('reproduces the published regression coefficients', () => {
    expect(model.b0).toBeCloseTo(5.3608, 4);
    expect(model.b1).toBeCloseTo(0.5499, 4);
    expect(model.b2).toBeCloseTo(19.2308, 4);
    expect(model.b11).toBeCloseTo(0.5153, 4);
    expect(model.b22).toBeCloseTo(21.332, 3);
    expect(model.b12).toBeCloseTo(0.2233, 4);
  });

  it('reproduces the published standard errors and the Student test', () => {
    const st = studentTest2Factors({
      runs,
      responseKey: 'y1',
      model,
      alpha: 0.05,
    });

    expect(st.df).toBe(7);
    expect(st.rows.map((r) => Number(r.se.toFixed(4)))).toEqual([
      0.169, 0.1336, 0.1336, 0.1433, 0.1433, 0.189,
    ]);

    const b12 = st.rows.find((r) => r.name === 'b12');
    expect(b12.pValue).toBeCloseTo(0.276, 3);
    expect(formatPValue(b12.pValue)).toBe('0.276');
    expect(b12.significant).toBe(false);

    const others = st.rows.filter((r) => r.name !== 'b12');
    expect(others.every((r) => r.significant)).toBe(true);

    expect(
      Object.fromEntries(st.rows.map((r) => [r.name, formatPValue(r.pValue)])),
    ).toEqual({
      b0: '< 0.001',
      b1: '0.004',
      b2: '< 0.001',
      b11: '0.009',
      b22: '< 0.001',
      b12: '0.276',
    });
  });

  it('reproduces the published Fisher adequacy test', () => {
    const fisher = fisherConcordance2Factors({
      runs,
      responseKey: 'y1',
      model,
      alpha: 0.05,
    });

    expect(fisher.Fc).toBeCloseTo(1.6308, 4);
    expect(fisher.Ftab).toBeCloseTo(6.0942, 4);
    expect(fisher.adequate).toBe(true);
  });

  it('reproduces the published coefficients of determination', () => {
    const { R2, R2_adj } = correlation2Factors({
      runs,
      responseKey: 'y1',
      model,
    });

    expect(R2).toBeCloseTo(0.9998, 4);
    expect(R2_adj).toBeCloseTo(0.9997, 4);
  });

  it('builds a diagnostics table consistent with the fitted model', () => {
    const diag = buildDiagnosticsTable2Factors({
      runs,
      responseKey: 'y1',
      model,
    });

    expect(diag.rows).toHaveLength(13);
    expect(diag.meanYMas).toBeCloseTo(diag.meanYCalc, 6);

    const sse = diag.rows.reduce((s, r) => s + r.err2, 0);
    const sst = diag.rows.reduce((s, r) => s + r.dev2, 0);
    expect(1 - sse / sst).toBeCloseTo(0.9998, 4);

    for (const r of diag.rows) {
      expect(r.A).toBeCloseTo(
        (Math.abs(r.yMas - r.yCalc) / Math.abs(r.yMas)) * 100,
        9,
      );
    }
  });
});
