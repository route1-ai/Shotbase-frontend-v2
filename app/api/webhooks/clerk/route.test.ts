import { describe, it, expect } from 'vitest';
import { POST } from './route';

describe('POST /api/webhooks/clerk', () => {
  it('is exported as a function', () => {
    expect(typeof POST).toBe('function');
  });
});
