import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import PreferencesPage from './page';

describe('Preferences Page', () => {
  it('renders correctly', () => {
    const { container } = render(<PreferencesPage />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
