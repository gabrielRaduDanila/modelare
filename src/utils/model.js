// src/utils/model.js

// y = b0 + b1 x1 + b2 x2 + b11 x1^2 + b22 x2^2 + b12 x1 x2
export function calcY(model, x1, x2) {
  if (!model) return null;

  const { b0, b1, b2, b11, b22, b12 } = model;

  const y =
    b0 + b1 * x1 + b2 * x2 + b11 * x1 ** 2 + b22 * x2 ** 2 + b12 * (x1 * x2);

  return y;
}
