import { useEffect, useState } from 'react';
import { fetchCloudAnimals, getCachedCloudAnimals, type CloudAnimal } from '../lib/api';
import { listRecords, countPendingSync } from '../lib/storage';

// Rebanho da nuvem: mostra o que está em cache e atualiza em segundo plano, como na app.
export function useHerd() {
  const [animals, setAnimals] = useState<CloudAnimal[] | null>(null);
  const [pending, setPending] = useState(0);
  useEffect(() => {
    let alive = true;
    getCachedCloudAnimals().then((c) => { if (alive && c.length) setAnimals(c); });
    fetchCloudAnimals().then((a) => { if (alive) setAnimals(a); }).catch(() => { if (alive) setAnimals((x) => x ?? []); });
    listRecords().then((r) => { if (alive) setPending(countPendingSync(r)); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  return { animals, pending };
}
export type Herd = ReturnType<typeof useHerd>;

export const fmtW = (w: number | null) => (w && w > 0 ? Math.round(w) : null);
