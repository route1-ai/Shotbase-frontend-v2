import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import * as Module from './liquid-glass-button';

// The module might be exporting liquidbuttonVariants, LiquidButton, GlassFilter, MetalButton, etc.
// Let's render what we have. It turns out "default" export doesn't exist, we should use what is exported.
describe('MetalButton', () => {
  it('renders correctly', () => {
    // Assuming MetalButton is exported based on the cat output
    render(<Module.MetalButton>Glass Button</Module.MetalButton>);
    expect(screen.getByRole('button')).toHaveTextContent(/glass button/i);
  });
});
