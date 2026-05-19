import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { MacbookScroll } from './macbook-scroll';

describe('MacbookScroll', () => {
  it('renders correctly', () => {
    const { container } = render(<MacbookScroll />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
