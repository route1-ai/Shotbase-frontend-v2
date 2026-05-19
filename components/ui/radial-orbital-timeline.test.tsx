import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import RadialOrbitalTimeline from './radial-orbital-timeline';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
    circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
    path: ({ children, ...props }: any) => <path {...props}>{children}</path>,
    img: ({ children, ...props }: any) => <img {...props} />,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('RadialOrbitalTimeline', () => {
  it('renders correctly', () => {
    const { container } = render(<RadialOrbitalTimeline timelineData={[]} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
