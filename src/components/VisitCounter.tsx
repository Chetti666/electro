'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

export default function VisitCounter() {
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    const counted = localStorage.getItem('visit_counted');

    async function registerVisit() {
      try {
        let res;
        if (!counted) {
          res = await fetch('/api/visits', { method: 'POST' });
          localStorage.setItem('visit_counted', 'true');
        } else {
          res = await fetch('/api/visits');
        }
        const data = await res.json();
        setVisits(data.visits);
      } catch {
        // ignore errors
      }
    }

    registerVisit();
  }, []);

  if (visits === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5">
      <Eye className="w-3.5 h-3.5 text-primary-light" />
      <span>{visits.toLocaleString('es-CL')} visitas</span>
    </span>
  );
}
