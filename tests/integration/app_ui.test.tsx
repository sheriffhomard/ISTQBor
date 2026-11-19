import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '../../src/i18n/index';
import App from '../../src/App';

// Mock Recharts ResponsiveContainer for jsdom environment
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 600, height: 200 }}>{children}</div>
    ),
  };
});

describe('ISTQB Academy UI Integration', () => {
  it('renders dashboard, switches language FR/EN, and navigates between core modules', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Tableau de bord/i })).toBeInTheDocument();
    });

    // Switch to English
    fireEvent.click(screen.getByRole('button', { name: 'en' }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Dashboard/i })).toBeInTheDocument();
    });

    // Navigate to Certifications Catalogue
    fireEvent.click(screen.getByRole('button', { name: /Certifications/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /ISTQB Certification Catalogue/i }),
      ).toBeInTheDocument();
    });

    // Navigate to Glossary
    fireEvent.click(screen.getByRole('button', { name: /Glossary/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Bilingual ISTQB Glossary/i }),
      ).toBeInTheDocument();
    });
  });
});
