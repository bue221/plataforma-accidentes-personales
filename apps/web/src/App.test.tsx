import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App (smoke)', () => {
  afterEach(cleanup);

  it('renders the landing with both entry points and the service status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ status: 'ok', checks: { database: 'up' } })),
    );

    renderAt('/');

    expect(screen.getByRole('link', { name: 'Registrar un accidente' }).getAttribute('href')).toBe(
      '/accidentes/nuevo',
    );
    expect(
      screen.getByRole('link', { name: 'Ingresar para consultar mis accidentes' }),
    ).toBeTruthy();
    expect(await screen.findByText('Servicio disponible')).toBeTruthy();
  });

  it('reports the service as unavailable when the API cannot be reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('network down');
      }),
    );

    renderAt('/');

    expect(await screen.findByText('Servicio no disponible en este momento')).toBeTruthy();
  });
});
