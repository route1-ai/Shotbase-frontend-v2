import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import Layout from './layout';

vi.mock('next/navigation', () => ({
  usePathname: () => '/account/profile',
}));

describe('Account Layout', () => {
  it('renders correctly', () => {
    const { container } = render(<Layout><div data-testid="child">Child</div></Layout>);
    expect(container.firstChild).toBeInTheDocument();
  });
});
