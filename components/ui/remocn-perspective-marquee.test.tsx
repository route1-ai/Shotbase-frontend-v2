import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { PerspectiveMarquee } from './remocn-perspective-marquee';

vi.mock('remotion', () => ({
  useCurrentFrame: () => 1,
  interpolate: () => 0,
  random: () => 0,
}));

describe('PerspectiveMarquee', () => {
  it('renders correctly', () => {
    const { container } = render(<PerspectiveMarquee />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
