import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('GET /api/keys/list', () => {
  it('is exported as a function', () => {
    expect(typeof GET).toBe('function');
  });
});
