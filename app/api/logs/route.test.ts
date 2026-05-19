import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('GET /api/logs', () => {
  it('is exported as a function', () => {
    expect(typeof GET).toBe('function');
  });
});
