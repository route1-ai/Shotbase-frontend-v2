import { describe, it, expect } from 'vitest';
import { POST } from './route';

describe('POST /api/keys/create', () => {
  it('is exported as a function', () => {
    expect(typeof POST).toBe('function');
  });
});
