import { flushSync } from 'react-dom';
import type { ThemeMode } from '../lib/ThemeContext';

/**
 * Troca de tema com uma passagem de scan: uma linha verde, com a nuvem de pontos do
 * LiDAR atrás dela, desce pelo ecrã e revela o tema novo por onde passa.
 *
 * Usa a View Transitions API: o browser fotografa o ecrã antigo, aplicamos o tema
 * novo e animamos a revelação (clip-path) em sincronia com a linha. Sem a API, ou com
 * «reduzir movimento», o tema muda de imediato.
 */
export function applyThemeAttr(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
}

export function switchThemeWithScan(next: ThemeMode, setMode: (m: ThemeMode) => void) {
  const apply = () => { applyThemeAttr(next); flushSync(() => setMode(next)); };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
  if (!doc.startViewTransition || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { apply(); return; }

  // A linha existe só no estado novo, com nome próprio na transição, por isso é animada
  // por cima das duas fotografias. Sai do DOM quando a transição acaba.
  const line = document.createElement('div');
  line.className = 'pf-scanline';
  line.setAttribute('aria-hidden', 'true');
  const t = doc.startViewTransition(() => { document.body.appendChild(line); apply(); });
  t.finished.finally(() => line.remove());
}
