import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import SignUpPage from './page';

vi.mock('@clerk/nextjs', () => ({
  SignUp: () => <div data-testid="signup-mock" />,
}));

describe('SignUp Page', () => {
  it('renders correctly', () => {
    const { container } = render(<SignUpPage />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
