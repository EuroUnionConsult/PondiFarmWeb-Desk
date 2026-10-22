import React, { useMemo, useState } from 'react';
import type { CloudAnimal } from '../lib/api';
import { WEIGHT_MODEL_VERSION } from '../lib/weightModel';
import { fmtW, type Herd } from './herd';
import { Breeds, Histogram, Kpi, Pills, Ring, SkelChart, SkelKpis, SkelRows, mean, median, pos, topBreeds, weights } from './charts';

function Coverage({ withW, total }: { withW: number; total: number }) {
  const pct = total ? Math.round((withW / total) * 100) : 0;
  return (
    <div className="pf-card pf-kpi pf-cov">
      <div><div className="pf-k w7">With an estimate</div>
        <div className="v w8">{withW}<small className="w6">/ {total}</small></div>
        <div className="pf-sub">animals with a weight</div></div>
      <Ring pct={pct} label={`${pct}% of the herd has a weight`} />
    </div>
  );
}

function Scatter({ animals }: { animals: CloudAnimal[] }) {
  const pts = animals.map((a) => ({ x: pos(a.bodyLengthCm), y: fmtW(a.weightKg), name: a.name })).filter((p): p is { x: number; y: number; name: string } => p.x !== null && p.y !== null);
  const [tip, setTip] = useState<string | null>(null);
  if (pts.length < 2) return <div className="pf-empty">Body length and weight appear here together once there are at least two measured animals.</div>;
  const W = 520, H = 220, P = 34;
  const x0 = Math.min(...pts.map((p) => p.x)), x1 = Math.max(...pts.map((p) => p.x)), y0 = Math.min(...pts.map((p) => p.y)), y1 = Math.max(...pts.map((p) => p.y));
  const sx = (x: number) => P + ((x - x0) / (x1 - x0 || 1)) * (W - 2 * P), sy = (y: number) => H - P - ((y - y0) / (y1 - y0 || 1)) * (H - 2 * P);
  return (
    <>
      <div className="pf-hist-tip">{tip ?? 'Each dot is an animal: body length against estimated weight'}</div>
      <svg className="pf-scatter" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Body length against estimated weight">
        <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="var(--line)" /><line x1={P} y1={P} x2={P} y2={H - P} stroke="var(--line)" />
        <text x={P} y={H - 10} className="ax">{Math.round(x0)} cm</text><text x={W - P} y={H - 10} className="ax" textAnchor="end">{Math.round(x1)} cm</text>
        <text x={P - 6} y={P + 4} className="ax" textAnchor="end">{y1}</text><text x={P - 6} y={H - P} className="ax" textAnchor="end">{y0}</text>
        {pts.map((p, i) => (
          <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={6} style={{ animationDelay: `${i * 25}ms` }}
            onMouseEnter={() => setTip(`${p.name}: ${Math.round(p.x)} cm · ${p.y} kg`)} onMouseLeave={() => setTip(null)} />))}
      </svg>
    </>
  );
}

export default function AnalyticsPage({ herd, openAnimal }: { herd: Herd; openAnimal: (id: string) => void }) {
  const all = herd.animals ?? [];
  const breeds = useMemo(() => topBreeds(all), [all]);
  const [breed, setBreed] = useState<string>('all');
  const animals = breed === 'all' ? all : all.filter((a) => a.breed === breed);
  const ws = weights(animals);
  const avg = mean(ws), med = median(ws);
  const len = mean(animals.map((a) => pos(a.bodyLengthCm)).filter((v): v is number => v !== null));
  const height = mean(animals.map((a) => pos(a.withersHeightCm)).filter((v): v is number => v !== null));
  const heaviest = [...animals].filter((a) => fmtW(a.weightKg) !== null).sort((a, b) => (b.weightKg ?? 0) - (a.weightKg ?? 0)).slice(0, 5);

  return (
    <div className="pf-page">
      <div className="pf-top">
        <div><h1 className="w8">Analytics</h1>
          <div className="pf-sub">{herd.animals === null ? 'Loading the herd…' : `${animals.length} animals · ${ws.length} with an estimated weight`}</div></div>
        {breeds.length > 1 && <Pills label="Filter by breed" value={breed} onChange={setBreed}
          options={[{ id: 'all', label: 'All breeds' }, ...breeds.map((x) => ({ id: x, label: x }))]} />}
      </div>

      {herd.animals === null ? <SkelKpis /> : (
      <div className="pf-kpis" key={breed}>
        <Kpi label="Mean weight" value={avg} unit="kg" note={ws.length ? `from ${ws.length} estimates` : 'no estimates yet'} />
        <Kpi label="Median weight" value={med} unit="kg" note="half the herd is above this" />
        <Kpi label="Heaviest" value={ws.length ? Math.max(...ws) : null} unit="kg" note={ws.length ? `lightest ${Math.min(...ws)} kg` : '—'} />
        <Coverage withW={ws.length} total={animals.length} />
      </div>)}

      <div className="pf-row">
        <div style={{ flex: 1.45, minWidth: 0 }}><div className="pf-sect w6">Weight distribution</div>
          <div className="pf-card pf-pad">{herd.animals === null ? <SkelChart h={210} /> : <Histogram key={breed} ws={ws} avg={avg} />}</div></div>
        <div style={{ flex: 1, minWidth: 0 }}><div className="pf-sect w6">By breed</div>
          <div className="pf-card pf-pad">{herd.animals === null ? <SkelRows n={4} right={false} /> : <Breeds key={breed} animals={animals} />}</div></div>
      </div>

      <div className="pf-row">
        <div style={{ flex: 1.45, minWidth: 0 }}><div className="pf-sect w6">Body length and weight</div>
          <div className="pf-card pf-pad">
            <div className="pf-mini"><div><span>Mean body length</span><b className="w8">{len ?? '—'}{len !== null && <small> cm</small>}</b></div>
              <div><span>Mean withers height</span><b className="w8">{height ?? '—'}{height !== null && <small> cm</small>}</b></div></div>
            <Scatter key={breed} animals={animals} /></div></div>
        <div style={{ flex: 1, minWidth: 0 }}><div className="pf-sect w6">Heaviest animals</div>
          <div className="pf-card pf-list">
            {heaviest.map((a, i) => (
              <button key={a.id} className="it" onClick={() => openAnimal(a.id)}>
                <div className="pf-rank w7">{i + 1}</div>
                <div className="t"><span className="w6" style={{ display: 'inline', fontSize: 15, color: 'var(--label)', margin: 0 }}>{a.name}</span><span>{[a.breed, a.tagCode].filter(Boolean).join(' · ')}</span></div>
                <div className="w w8">{fmtW(a.weightKg)}<span className="w6">kg</span></div>
              </button>))}
            {herd.animals === null ? <SkelRows n={5} /> : !heaviest.length && <div className="pf-empty">No estimated weights yet.</div>}
          </div></div>
      </div>
      <p className="pf-foot">Weights are estimated by the PondiFarm model ({WEIGHT_MODEL_VERSION}). They are experimental and not validated against a scale.</p>
    </div>
  );
}
