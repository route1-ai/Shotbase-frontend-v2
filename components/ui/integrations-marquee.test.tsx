import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import IntegrationsMarquee from './integrations-marquee';

describe('IntegrationsMarquee', () => {
  it('renders correctly', () => {
    const { container } = render(<IntegrationsMarquee />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
