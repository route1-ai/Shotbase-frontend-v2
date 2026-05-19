import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import InfiniteGridBg from './infinite-grid-bg';

describe('InfiniteGridBg', () => {
  it('renders correctly', () => {
    const { container } = render(<InfiniteGridBg />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
