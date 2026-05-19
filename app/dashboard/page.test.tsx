import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import DashboardPage from './page';

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ isLoaded: true, user: { id: 'user_123', emailAddresses: [{ emailAddress: 'test@example.com' }] } }),
  useClerk: () => ({ signOut: vi.fn() }),
  UserButton: () => <div>UserButton</div>,
}));

vi.mock('lucide-react', () => ({
  LayoutDashboard: () => <div>Icon</div>,
  Key: () => <div>Icon</div>,
  Settings: () => <div>Icon</div>,
  Plus: () => <div>Icon</div>,
  LogOut: () => <div>Icon</div>,
  Menu: () => <div>Icon</div>,
  Search: () => <div>Icon</div>,
  Bell: () => <div>Icon</div>,
  User: () => <div>Icon</div>,
  Home: () => <div>Icon</div>,
  ChevronDown: () => <div>Icon</div>,
  MoreVertical: () => <div>Icon</div>,
  Activity: () => <div>Icon</div>,
  Eye: () => <div>Icon</div>,
  EyeOff: () => <div>Icon</div>,
  Trash2: () => <div>Icon</div>,
  Copy: () => <div>Icon</div>,
  CheckCircle2: () => <div>Icon</div>,
}));

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [] })
  })
) as any;

describe('Dashboard Page', () => {
  it('renders correctly', () => {
    const { container } = render(<DashboardPage />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
