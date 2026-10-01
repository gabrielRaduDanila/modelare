import { describe, expect, it } from 'vitest';

import pkg from '../../package.json';
import { APP_VERSION } from './version';

describe('APP_VERSION', () => {
  it('matches the version declared in package.json', () => {
    expect(APP_VERSION).toBe(pkg.version);
  });

  it('is a plain semantic version string', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
