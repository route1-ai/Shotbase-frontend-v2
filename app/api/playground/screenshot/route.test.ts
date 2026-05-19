import { describe, it, expect } from 'vitest';
import { POST } from './route';

describe('POST /api/playground/screenshot', () => {
  it('is exported as a function', () => {
    expect(typeof POST).toBe('function');
  });
});
