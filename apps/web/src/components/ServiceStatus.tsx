import { useEffect, useState } from 'react';
import { getHealth } from '../api/health';

type Status = 'checking' | 'available' | 'unavailable';

const LABELS: Record<Status, string> = {
  checking: 'Verificando el servicio…',
  available: 'Servicio disponible',
  unavailable: 'Servicio no disponible en este momento',
};

export function ServiceStatus() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    const controller = new AbortController();
    getHealth(controller.signal)
      .then((report) => setStatus(report.status === 'ok' ? 'available' : 'unavailable'))
      .catch(() => {
        if (!controller.signal.aborted) setStatus('unavailable');
      });
    return () => controller.abort();
  }, []);

  return (
    <p className="service-status" role="status" data-status={status}>
      {LABELS[status]}
    </p>
  );
}
