import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import Page from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

describe('Home Page', () => {
  it('renders correctly', () => {
    const { container } = render(<Page />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
