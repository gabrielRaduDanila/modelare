export function predict2Factors(model, x1c, x2c) {
  if (!model) return null;
  const { b0, b1, b2, b11, b22, b12 } = model;

  return (
    b0 +
    b1 * x1c +
    b2 * x2c +
    b11 * x1c ** 2 +
    b22 * x2c ** 2 +
    b12 * (x1c * x2c)
  );
}

export function desirabilityMax(y, low, high, weight = 1) {
  if (y == null || Number.isNaN(y)) return 0;

  if (y <= low) return 0;
  if (y >= high) return 1;

  const t = (y - low) / (high - low);
  return t ** weight;
}

// dorință totală: geometric mean
export function overallDesirability(dValues) {
  const n = dValues.length;
  if (n === 0) return 0;
  if (dValues.some((d) => d <= 0)) return 0;

  const prod = dValues.reduce((acc, d) => acc * d, 1);
  return prod ** (1 / n);
}

// decode din codificat în real
export function decodeFromCoded(xCoded, min, max) {
  const center = (min + max) / 2;
  const delta = (max - min) / 2;
  return center + xCoded * delta;
}

/**
 * Caută maximul lui D pe o grilă în spațiul codificat.
 * domain: [-alpha, alpha] pentru fiecare factor (CCD rotabil).
 */
export function optimizeDesirability2Factors({
  modelY1,
  modelY2,
  x1Min,
  x1Max,
  x2Min,
  x2Max,
  y1Low,
  y1High,
  y2Low,
  y2High,
  w1 = 1,
  w2 = 1,
  step = 0.05,
}) {
  const alpha = Math.sqrt(2);

  let best = null;

  for (let x1c = -alpha; x1c <= alpha + 1e-9; x1c += step) {
    for (let x2c = -alpha; x2c <= alpha + 1e-9; x2c += step) {
      const y1hat = predict2Factors(modelY1, x1c, x2c);
      const y2hat = predict2Factors(modelY2, x1c, x2c);

      const d1 = desirabilityMax(y1hat, y1Low, y1High, w1);
      const d2 = desirabilityMax(y2hat, y2Low, y2High, w2);
      const D = overallDesirability([d1, d2]);

      if (!best || D > best.D) {
        best = {
          x1_coded: x1c,
          x2_coded: x2c,
          x1_real: decodeFromCoded(x1c, x1Min, x1Max),
          x2_real: decodeFromCoded(x2c, x2Min, x2Max),
          y1_hat: y1hat,
          y2_hat: y2hat,
          d1,
          d2,
          D,
        };
      }
    }
  }

  return best;
}
