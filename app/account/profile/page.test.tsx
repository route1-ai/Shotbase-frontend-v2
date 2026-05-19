import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import ProfilePage from './page';

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ isLoaded: true, user: { id: 'user_123', emailAddresses: [{ emailAddress: 'test@example.com' }] } }),
}));

describe('Profile Page', () => {
  it('renders correctly', () => {
    const { container } = render(<ProfilePage />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
