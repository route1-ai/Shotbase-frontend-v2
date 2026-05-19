import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import AnimatedShaderHero from './animated-shader-hero';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe('AnimatedShaderHero', () => {
  it('renders correctly', () => {
    const { container } = render(<AnimatedShaderHero headline={{line1: "Test", line2: "Headline"}} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
