import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { POST } from './route';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

vi.mock('svix', () => ({
  Webhook: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

describe('Clerk Webhook POST handler', () => {
  let mockVerify: Mock;
  let mockInsert: Mock;
  let mockFrom: Mock;
  let mockFetch: Mock;

  beforeEach(() => {
    mockVerify = vi.fn();
    (Webhook as unknown as Mock).mockImplementation(function() {
      return { verify: mockVerify };
    });

    mockInsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
    (createClient as unknown as Mock).mockReturnValue({
      from: mockFrom,
    });

    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(''),
    });
    global.fetch = mockFetch;

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    process.env.CLERK_WEBHOOK_SECRET = 'test-secret';
    process.env.UNKEY_ROOT_KEY = 'test-unkey-root';
    process.env.UNKEY_API_ID = 'test-unkey-api';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for invalid webhook payload', async () => {
    mockVerify.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        'svix-id': 'test-id',
        'svix-timestamp': 'test-timestamp',
        'svix-signature': 'test-signature',
      },
      body: 'invalid-payload',
    });

    const response = await POST(req);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: 'Invalid' });
  });

  it('should return 200 for valid webhook with non-user.created event', async () => {
    mockVerify.mockReturnValue({ type: 'user.updated' });

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        'svix-id': 'test-id',
        'svix-timestamp': 'test-timestamp',
        'svix-signature': 'test-signature',
      },
      body: 'valid-payload',
    });

    const response = await POST(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ received: true });
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should return 500 when Supabase insertion fails for user.created event', async () => {
    mockVerify.mockReturnValue({
      type: 'user.created',
      data: {
        id: 'test-clerk-id',
        email_addresses: [{ email_address: 'test@example.com' }],
      },
    });

    mockInsert.mockResolvedValue({ error: new Error('Database error') });

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        'svix-id': 'test-id',
        'svix-timestamp': 'test-timestamp',
        'svix-signature': 'test-signature',
      },
      body: 'valid-payload',
    });

    // Suppress console.error during this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(req);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Database insertion failed' });
    expect(mockInsert).toHaveBeenCalledWith({
      clerk_id: 'test-clerk-id',
      email: 'test@example.com',
    });
    expect(mockFetch).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should return 200 when Unkey API fetch fails but Supabase succeeds for user.created', async () => {
    mockVerify.mockReturnValue({
      type: 'user.created',
      data: {
        id: 'test-clerk-id',
        email_addresses: [{ email_address: 'test@example.com' }],
      },
    });

    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: vi.fn().mockResolvedValue('Unauthorized'),
    });

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        'svix-id': 'test-id',
        'svix-timestamp': 'test-timestamp',
        'svix-signature': 'test-signature',
      },
      body: 'valid-payload',
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ received: true });

    expect(mockInsert).toHaveBeenCalledWith({
      clerk_id: 'test-clerk-id',
      email: 'test@example.com',
    });

    expect(mockFetch).toHaveBeenCalledWith('https://api.unkey.dev/v1/keys.createKey', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-unkey-root',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiId: 'test-unkey-api',
        name: 'Default',
        ownerId: 'test-clerk-id',
        meta: { plan: 'free' },
      }),
    });

    expect(consoleSpy).toHaveBeenCalledWith('Unkey API error:', 401, 'Unauthorized');

    consoleSpy.mockRestore();
  });

  it('should return 200 and handle fetch throw error when Unkey API fails', async () => {
    mockVerify.mockReturnValue({
      type: 'user.created',
      data: {
        id: 'test-clerk-id',
        email_addresses: [{ email_address: 'test@example.com' }],
      },
    });

    const fetchError = new Error('Network error');
    mockFetch.mockRejectedValue(fetchError);

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        'svix-id': 'test-id',
        'svix-timestamp': 'test-timestamp',
        'svix-signature': 'test-signature',
      },
      body: 'valid-payload',
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ received: true });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch Unkey API:', fetchError);

    consoleSpy.mockRestore();
  });

  it('should return 200 when both Supabase and Unkey API requests succeed for user.created', async () => {
    mockVerify.mockReturnValue({
      type: 'user.created',
      data: {
        id: 'test-clerk-id',
        email_addresses: [{ email_address: 'test@example.com' }],
      },
    });

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        'svix-id': 'test-id',
        'svix-timestamp': 'test-timestamp',
        'svix-signature': 'test-signature',
      },
      body: 'valid-payload',
    });

    const response = await POST(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ received: true });

    expect(mockInsert).toHaveBeenCalledWith({
      clerk_id: 'test-clerk-id',
      email: 'test@example.com',
    });

    expect(mockFetch).toHaveBeenCalledWith('https://api.unkey.dev/v1/keys.createKey', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-unkey-root',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiId: 'test-unkey-api',
        name: 'Default',
        ownerId: 'test-clerk-id',
        meta: { plan: 'free' },
      }),
    });
  });
});
