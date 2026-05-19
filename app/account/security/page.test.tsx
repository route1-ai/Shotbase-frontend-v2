import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import SecurityPage from './page';

vi.mock('@clerk/nextjs', () => ({
  useClerk: () => ({ signOut: vi.fn() }),
}));

vi.mock('lucide-react', () => ({
  Smartphone: () => <div>Icon</div>,
  KeyRound: () => <div>Icon</div>,
  Shield: () => <div>Icon</div>,
  AlertTriangle: () => <div>Icon</div>,
}));

describe('Security Page', () => {
  it('renders correctly', () => {
    const { container } = render(<SecurityPage />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
