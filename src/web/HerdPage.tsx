import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchAnimalScans, fetchScanMesh, type CloudAnimal, type MeshFormat, type ScanPoint } from '../lib/api';
import { fmtW, type Herd } from './herd';
import { Pills, Skel, SkelRows, mean, pos, topBreeds, useCountUp, weights } from './charts';
import { CloudIcon, PhoneIcon, SearchIcon } from './icons';
import { useTheme } from '../lib/ThemeContext';
import ScanViewer from './ScanViewer';

type Sort = 'name' | 'heavy' | 'light';
const SORTS: { id: Sort; label: string }[] = [{ id: 'name', label: 'Name' }, { id: 'heavy', label: 'Heaviest' }, { id: 'light', label: 'Lightest' }];
const cm = (v: number | null) => (pos(v) ? `${Math.round(v as number)} cm` : '—');

/** Valor do animal numa barra entre o mínimo e o máximo do rebanho, com a média marcada. */
function Compare({ label, value, all, unit }: { label: string; value: number | null; all: number[]; unit: string }) {
  if (!all.length) return null;
  const lo = Math.round(Math.min(...all)), hi = Math.round(Math.max(...all)), avg = mean(all) ?? lo, span = hi - lo || 1;
  const at = value === null ? null : ((value - lo) / span) * 100;
  return (
    <div className="pf-cmp">
      <div className="l"><span>{label}</span><span className="w6">{value === null ? '—' : `${Math.round(value)} ${unit}`}</span></div>
      <div className="track"><span className="avg" style={{ left: `${((avg - lo) / span) * 100}%` }} title={`Herd mean ${avg} ${unit}`} />
        {at !== null && <span className="dot" style={{ left: `${at}%` }} />}</div>
      <div className="ax"><span>{lo}</span><span>mean {avg}</span><span>{hi}</span></div>
    </div>
  );
}

// Histórico já pedido nesta sessão: voltar a um animal não repete o pedido.
const historyCache = new Map<string, ScanPoint[]>();
const fmtDate = (t: number) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** Evolução do peso estimado ao longo dos scans do animal. */
function WeightHistory({ id }: { id: string }) {
  const [pts, setPts] = useState<ScanPoint[] | null>(historyCache.get(id) ?? null);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    if (historyCache.has(id)) return;
    let alive = true;
    fetchAnimalScans(id).then((p) => { historyCache.set(id, p); if (alive) setPts(p); }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [id]);
  if (failed) return <div className="pf-sub">The scan history could not be loaded.</div>;
  if (pts === null) return <Skel h={130} r={12} />;
  const ws = pts.filter((p): p is ScanPoint & { weightKg: number } => p.weightKg !== null && p.weightKg > 0);
  if (ws.length < 2) return <div className="pf-sub">{ws.length === 1 ? `One scan so far (${fmtDate(ws[0].at)}). The trend appears after the next scan.` : 'No scans with a weight yet.'}</div>;
  const W = 340, H = 130, PX = 10, PY = 16;
  const t0 = ws[0].at, t1 = ws[ws.length - 1].at, lo = Math.min(...ws.map((p) => p.weightKg)), hi = Math.max(...ws.map((p) => p.weightKg));
  const x = (t: number) => PX + ((t - t0) / (t1 - t0 || 1)) * (W - 2 * PX), y = (w: number) => H - PY - ((w - lo) / (hi - lo || 1)) * (H - 2 * PY);
  const line = ws.map((p, i) => `${i ? 'L' : 'M'}${x(p.at).toFixed(1)} ${y(p.weightKg).toFixed(1)}`).join(' ');
  const area = `${line} L${x(t1).toFixed(1)} ${H - 4} L${x(t0).toFixed(1)} ${H - 4} Z`;
  const diff = Math.round(ws[ws.length - 1].weightKg - ws[0].weightKg);
  const h = hover !== null ? ws[hover] : null;
  return (
    <div className="pf-hist2">
      <div className="top"><span className={`pf-delta w6 ${diff >= 0 ? 'up' : 'down'}`}>{diff >= 0 ? '+' : '−'}{Math.abs(diff)} kg since {fmtDate(t0)}</span>
        <span className="pf-sub" style={{ margin: 0 }}>{h ? `${fmtDate(h.at)} · ${Math.round(h.weightKg)} kg` : `${ws.length} scans`}</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} className="pf-wline" role="img" aria-label={`Weight from ${Math.round(ws[0].weightKg)} to ${Math.round(ws[ws.length - 1].weightKg)} kg over ${ws.length} scans`} onMouseLeave={() => setHover(null)}>
        <defs><linearGradient id="pf-wfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--green)" stopOpacity=".28" /><stop offset="1" stopColor="var(--green)" stopOpacity="0" /></linearGradient></defs>
        <path d={area} fill="url(#pf-wfill)" className="ar" />
        <path d={line} fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" pathLength={1} className="ln" />
        {ws.map((p, i) => (
          <g key={i} onMouseEnter={() => setHover(i)}>
            <circle cx={x(p.at)} cy={y(p.weightKg)} r={14} fill="transparent" />
            <circle cx={x(p.at)} cy={y(p.weightKg)} r={i === ws.length - 1 || i === hover ? 5 : 3.5} className={`pt${i === hover ? ' on' : ''}`} style={{ animationDelay: `${300 + i * 60}ms` }} />
          </g>))}
      </svg>
      <div className="pf-hist-axis"><span>{fmtDate(t0)}</span><span>{fmtDate(t1)}</span></div>
    </div>
  );
}

/**
 * De onde vem o modelo 3D do último scan: da API, quando o app já o enviou
 * (hasMesh). `pf-demo-mesh` (localStorage) serve só a pré-visualização local.
 */
function meshSourceFor(a: CloudAnimal): (() => Promise<{ format: MeshFormat; data: ArrayBuffer }>) | null {
  if (a.hasMesh && a.latestScanId) { const id = a.latestScanId; return () => fetchScanMesh(id); }
  let demo: string | null = null;
  try { demo = localStorage.getItem('pf-demo-mesh'); } catch { /* sem storage */ }
  if (!demo) return null;
  const url = demo;
  return async () => ({ format: (url.split('.').pop() ?? 'glb').toLowerCase() as MeshFormat, data: await (await fetch(url)).arrayBuffer() });
}

function Scan3D({ a }: { a: CloudAnimal }) {
  const { mode } = useTheme();
  const load = useMemo(() => meshSourceFor(a), [a.id, a.hasMesh, a.latestScanId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (load) return <ScanViewer load={load} dark={mode === 'dark'} />;
  return (
    <div className="pf-3d-empty"><PhoneIcon /><div><b className="w6">The 3D model is on the iPhone</b>
      <span>This scan has no 3D model in the cloud yet. It is sent automatically the next time the iPhone that captured it syncs (app version with 3D upload).</span></div></div>
  );
}

function Sheet({ a, herd }: { a: CloudAnimal; herd: CloudAnimal[] }) {
  const w = fmtW(a.weightKg);
  const shown = useCountUp(w);
  const ws = weights(herd), avg = mean(ws);
  const diff = w !== null && avg !== null ? w - avg : null;
  // Percentagem dos OUTROS animais com peso que este supera (ele próprio não conta).
  const others = Math.max(0, ws.length - 1);
  const heavierPct = w !== null && others ? Math.round((ws.filter((x) => x < w).length / others) * 100) : null;
  const lighterPct = w !== null && others ? Math.round((ws.filter((x) => x > w).length / others) * 100) : null;
  const rank = heavierPct === null || lighterPct === null ? ''
    : lighterPct === 0 ? ' · the heaviest in the herd'
    : heavierPct === 0 ? ' · the lightest in the herd'
    : diff !== null && diff >= 0 ? ` · heavier than ${heavierPct}% of the herd` : ` · lighter than ${lighterPct}% of the herd`;
  const lens = herd.map((x) => pos(x.bodyLengthCm)).filter((v): v is number => v !== null);
  const hts = herd.map((x) => pos(x.withersHeightCm)).filter((v): v is number => v !== null);
  return (
    <aside className="pf-card pf-sheet pf-sheetin" aria-label={`${a.name} details`}>
      <div className="w8" style={{ fontSize: 26, letterSpacing: -.5 }}>{a.name}</div>
      <div className="pf-tags">
        {a.breed && <span className="pf-tag w6">{a.breed}</span>}
        {a.tagCode && <span className="pf-tag w6">Tag {a.tagCode}</span>}
        <span className="pf-badge w7"><span style={{ width: 14, display: 'inline-flex' }}><CloudIcon /></span>Synced</span>
      </div>
      <div className="pf-est"><span className="lbl w7">Estimated weight</span><span className="exp w7">Experimental</span>
        <div className="num w8">{w !== null ? <>≈ {shown} <small className="w6">kg</small></> : '—'}</div>
        {diff !== null && (
          <div className={`pf-delta w6 ${diff >= 0 ? 'up' : 'down'}`}>{diff === 0 ? 'Same as the herd mean' : `${diff > 0 ? '+' : '−'}${Math.abs(diff)} kg vs the herd mean`}{rank}</div>)}
        <p>Experimental estimate, not validated against a scale</p></div>
      <div className="pf-sect w6" style={{ marginLeft: 2 }}>3D scan</div>
      <Scan3D a={a} />
      <div className="pf-sect w6" style={{ marginLeft: 2 }}>Weight over time</div>
      <WeightHistory id={a.id} />
      <div className="pf-sect w6" style={{ marginLeft: 2 }}>Compared with the herd</div>
      <Compare label="Weight" value={w} all={ws} unit="kg" />
      <Compare label="Body length" value={pos(a.bodyLengthCm)} all={lens} unit="cm" />
      <Compare label="Withers height" value={pos(a.withersHeightCm)} all={hts} unit="cm" />
      {a.notes ? <><div className="pf-sect w6" style={{ marginLeft: 2 }}>Notes</div><div className="pf-sub">{a.notes}</div></> : null}
    </aside>
  );
}

export default function HerdPage({ herd, selected, setSelected }: { herd: Herd; selected: string | null; setSelected: (id: string) => void }) {
  const all = herd.animals ?? [];
  const [q, setQ] = useState('');
  const [breed, setBreed] = useState('all');
  const [sort, setSort] = useState<Sort>('name');
  const breeds = useMemo(() => topBreeds(all), [all]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    let xs = breed === 'all' ? all : all.filter((a) => a.breed === breed);
    if (s) xs = xs.filter((a) => [a.name, a.breed, a.tagCode].some((v) => (v ?? '').toLowerCase().includes(s)));
    const w = (a: CloudAnimal) => fmtW(a.weightKg);
    if (sort === 'name') return [...xs].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    return [...xs].sort((a, b) => { const x = w(a), y = w(b); if (x === null) return 1; if (y === null) return -1; return sort === 'heavy' ? y - x : x - y; });
  }, [all, q, breed, sort]);
  // Com um filtro ativo, a ficha mostra sempre um animal da lista visível.
  const a = list.find((x) => x.id === selected) ?? list[0];
  const maxW = Math.max(1, ...weights(all));
  const listRef = useRef<HTMLDivElement>(null);

  // Setas ↑/↓ mudam de animal e a linha escolhida fica à vista. Só a navegação por
  // teclado faz scroll: um clique, um filtro ou uma ordenação nunca mexem na página.
  const byKey = useRef(false);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    byKey.current = true;
    const i = Math.max(0, list.findIndex((x) => x.id === a?.id));
    const n = list[Math.min(list.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))];
    if (n) setSelected(n.id);
  };
  useEffect(() => {
    if (!byKey.current) return;
    byKey.current = false;
    listRef.current?.querySelector('.sel')?.scrollIntoView({ block: 'nearest' });
  }, [a?.id]);

  return (
    <div className="pf-page">
      <div className="pf-top">
        <div><h1 className="w8">Herd</h1>
          <div className="pf-sub">{herd.animals === null ? 'Loading the herd…' : `${list.length === all.length ? all.length : `${list.length} of ${all.length}`} animals · ${weights(all).length} with an estimated weight`}</div></div>
        <label className="pf-search"><SearchIcon /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, tag or breed" aria-label="Search the herd" /></label>
      </div>
      <div className="pf-toolbar">
        {breeds.length > 1 && <Pills label="Filter by breed" value={breed} onChange={setBreed} options={[{ id: 'all', label: 'All breeds' }, ...breeds.map((x) => ({ id: x, label: x }))]} />}
        <div className="pf-sortlbl">Sort by</div>
        <Pills label="Sort the herd" value={sort} onChange={setSort} options={SORTS} />
      </div>
      <div className="pf-row pf-split" style={{ alignItems: 'flex-start', marginTop: 16 }}>
        <div className="pf-card pf-table" style={{ flex: 1, minWidth: 0 }} ref={listRef} tabIndex={0} onKeyDown={onKey} aria-label="Animals. Use the arrow keys to move between them">
          <div className="hd w6"><span>Animal</span><span>Breed</span><span className="r">Body length</span><span className="r">Weight</span></div>
          <div key={`${breed}-${sort}-${q.trim()}`}>
            {list.map((x, i) => { const w = fmtW(x.weightKg); return (
              <button key={x.id} className={`tr${a?.id === x.id ? ' sel' : ''}${i < 18 ? ' pf-rise' : ''}`} style={i < 18 ? { animationDelay: `${i * 22}ms` } : undefined}
                onClick={() => setSelected(x.id)} aria-current={a?.id === x.id || undefined} tabIndex={-1}>
                <span className="nm" title={[x.name, x.tagCode, x.breed].filter(Boolean).join(' · ')}><b className="w6">{x.name}</b><small>{x.tagCode || '—'}<span className="brs">{x.breed ? ` · ${x.breed}` : ''}</span></small></span>
                <span className="br">{x.breed || '—'}</span>
                <span className="r">{cm(x.bodyLengthCm)}</span>
                <span className="r wt"><b className="w8">{w ?? '—'}</b>{w !== null && <small>kg</small>}
                  <i style={{ width: `${w !== null ? (w / maxW) * 100 : 0}%` }} /></span>
              </button>); })}
          </div>
          {herd.animals === null ? <SkelRows n={9} /> : !list.length && <div className="pf-empty">No animals match this search.</div>}
        </div>
        {a ? <Sheet key={a.id} a={a} herd={all} /> : herd.animals === null && (
          <aside className="pf-card pf-sheet" aria-hidden="true"><Skel w={160} h={26} /><Skel w={220} h={22} style={{ marginTop: 12 }} />
            <Skel h={150} r={16} style={{ marginTop: 18 }} /><Skel w={180} h={12} style={{ marginTop: 22 }} /><Skel h={40} style={{ marginTop: 12 }} /><Skel h={40} style={{ marginTop: 12 }} /></aside>)}
      </div>
    </div>
  );
}
