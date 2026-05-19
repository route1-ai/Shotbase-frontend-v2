import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LenisProvider } from './lenis-provider';
import React from 'react';

describe('LenisProvider', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <LenisProvider>
        <div>Test Child</div>
      </LenisProvider>
    );
    expect(getByText('Test Child')).toBeInTheDocument();
  });
});
