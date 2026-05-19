import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import GridBackground from './grid-background';
import React from 'react';

describe('GridBackground', () => {
  it('renders correctly', () => {
    const { container } = render(<GridBackground />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
