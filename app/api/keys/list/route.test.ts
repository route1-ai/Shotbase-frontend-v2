import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './route';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

describe('GET /api/keys/list', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = {
      ...originalEnv,
      UNKEY_API_ID: 'test_api_id',
      UNKEY_ROOT_KEY: 'test_root_key',
    };
    // Silence console.error for expected error logs
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 401 when user is not authenticated', async () => {
    const { auth } = await import('@clerk/nextjs/server');
    (auth as any).mockResolvedValue({ userId: null });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should fetch keys from Unkey successfully', async () => {
    const { auth } = await import('@clerk/nextjs/server');
    (auth as any).mockResolvedValue({ userId: 'user_123' });

    const mockUnkeyResponse = {
      keys: [
        { id: 'key_1', name: 'Test Key' }
      ]
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUnkeyResponse),
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockUnkeyResponse);

    // Verify fetch was called with correct URL and headers
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.unkey.dev/v1/apis.listKeys?apiId=test_api_id&ownerId=user_123',
      { headers: { 'Authorization': 'Bearer test_root_key' } }
    );
  });

  it('should return error when Unkey API responds with non-ok status', async () => {
    const { auth } = await import('@clerk/nextjs/server');
    (auth as any).mockResolvedValue({ userId: 'user_123' });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad Request'),
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Failed to fetch keys from Unkey' });
    expect(console.error).toHaveBeenCalledWith('Unkey API error:', 400, 'Bad Request');
  });

  it('should return 500 when fetch throws an error', async () => {
    const { auth } = await import('@clerk/nextjs/server');
    (auth as any).mockResolvedValue({ userId: 'user_123' });

    const networkError = new Error('Network failure');
    global.fetch = vi.fn().mockRejectedValue(networkError);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal Server Error' });
    expect(console.error).toHaveBeenCalledWith('Failed to fetch Unkey API:', networkError);
  });
});
