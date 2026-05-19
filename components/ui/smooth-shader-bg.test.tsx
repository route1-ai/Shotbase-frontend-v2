import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { SmoothShaderBg } from './smooth-shader-bg';

describe('SmoothShaderBg', () => {
  it('renders correctly', () => {
    const { container } = render(<SmoothShaderBg />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
