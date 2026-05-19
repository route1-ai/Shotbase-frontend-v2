import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import BillingPage from './page';

describe('Billing Page', () => {
  it('renders correctly', () => {
    const { container } = render(<BillingPage />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
