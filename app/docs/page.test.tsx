import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import DocsPage from './page';

describe('Docs Page', () => {
  it('renders correctly', () => {
    const { container } = render(<DocsPage />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
