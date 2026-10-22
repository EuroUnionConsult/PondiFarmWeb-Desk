import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Asset } from 'expo-asset';
import { NavigationContainer, NavigationIndependentTree, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../lib/AuthContext';
import { fetchCloudAnimals, getCachedCloudAnimals, type CloudAnimal } from '../lib/api';
import { listRecords, countPendingSync } from '../lib/storage';
import { listPeople } from '../lib/orgs';
import { initials } from '../lib/profile';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AnimalDetailScreen from '../screens/AnimalDetailScreen';
import { ChartIcon, Chevron, CloudIcon, DesktopIcon, GearIcon, HerdIcon, HomeIcon, PhoneIcon, SearchIcon } from './icons';

const ICON = Asset.fromModule(require('../../assets/icon.png')).uri;
export type Page = 'home' | 'herd' | 'analytics' | 'settings' | 'profile';

// Rebanho da nuvem: mostra o que está em cache e atualiza em segundo plano, como na app.
function useHerd() {
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

const fmtW = (w: number | null) => (w && w > 0 ? Math.round(w) : null);

function Row({ a, sel, onClick }: { a: CloudAnimal; sel?: boolean; onClick: () => void }) {
  const w = fmtW(a.weightKg);
  return (
    <button className={`it${sel ? ' sel' : ''}`} onClick={onClick} aria-current={sel || undefined}>
      <div className="pf-ico"><CloudIcon /></div>
      <div className="t"><span className="w6" style={{ display: 'inline', fontSize: 15, color: 'var(--label)', margin: 0 }}>{a.name}</span><span>{[a.breed, a.tagCode].filter(Boolean).join(' · ')}</span></div>
      <div className="w w8">{w ?? '—'}{w && <span className="w6">kg</span>}</div>
      <Chevron />
    </button>
  );
}

function HomePage({ herd, members, goHerd }: { herd: ReturnType<typeof useHerd>; members: number | null; goHerd: (id?: string) => void }) {
  const { animals, pending } = herd;
  const ws = useMemo(() => (animals ?? []).map((a) => fmtW(a.weightKg)).filter((w): w is number => w !== null), [animals]);
  const mean = ws.length ? Math.round(ws.reduce((s, w) => s + w, 0) / ws.length) : null;
  const lo = ws.length ? Math.min(...ws) : 0, hi = ws.length ? Math.max(...ws) : 0;
  const BINS = 11, step = (hi - lo) / BINS || 1;
  const bins = Array.from({ length: BINS }, (_, i) => ws.filter((w) => w >= lo + i * step && (i === BINS - 1 ? w <= hi : w < lo + (i + 1) * step)).length);
  const top = Math.max(1, ...bins), meanBin = mean === null ? -1 : Math.min(BINS - 1, Math.floor((mean - lo) / step));
  return (
    <div className="pf-page">
      <div className="pf-top"><div><h1 className="w8">Home</h1><div className="pf-sub">Limousine pilot · {animals === null ? 'loading' : 'online'}</div></div></div>
      <div className="pf-row">
        <div className="pf-card pf-hero"><div><div className="pf-k w7">Mean weight</div><div className="pf-big w8">{mean ?? '—'}<small className="w6">kg</small></div>
          <div className="pf-sub">{animals?.length ?? 0} animals in herd · {pending ? `${pending} pending sync` : 'all synced'}</div></div>
          <div className="pf-ring" aria-label={pending ? 'Sync pending' : 'All synced'}><b className="w8">{pending ? '…' : '100%'}</b><span className="w6">SYNCED</span></div></div>
        <div className="pf-card pf-stats">
          <div className="pf-stat"><b className="w8">{animals?.length ?? '—'}</b><span>animals</span></div>
          <div className="pf-stat"><b className="w8">{pending}</b><span>pending sync</span></div>
          <div className="pf-stat"><b className="w8">{ws.length ? `${lo}–${hi}` : '—'}</b><span>weight range (kg)</span></div>
          <div className="pf-stat"><b className="w8">{members ?? '—'}</b><span>team members</span></div>
        </div>
      </div>
      <div className="pf-row">
        <div style={{ flex: 1.25, minWidth: 0 }}><div className="pf-sect w6">Herd by weight</div>
          <div className="pf-card">{ws.length ? (<>
            <div className="pf-bars">{bins.map((v, i) => <i key={i} className={i === meanBin ? 'm' : ''} style={{ height: `${(v / top) * 100}%` }} title={`${v} animals`} />)}</div>
            <div className="pf-axis">{bins.map((_, i) => <span key={i}>{Math.round(lo + i * step)}</span>)}</div></>)
            : <div className="pf-empty">Weights appear here once animals are scanned.</div>}</div></div>
        <div style={{ flex: 1, minWidth: 0 }}><div className="pf-sect w6">Latest records</div>
          <div className="pf-card pf-list">{(animals ?? []).slice(0, 4).map((a) => <Row key={a.id} a={a} onClick={() => goHerd(a.id)} />)}
            {animals && !animals.length && <div className="pf-empty">No animals yet. Records from your team appear here as they sync.</div>}</div>
          <div className="pf-card pf-note" style={{ marginTop: 14 }}><PhoneIcon />New scans are captured with the iPhone app. They appear here as soon as they sync.</div></div>
      </div>
    </div>
  );
}

function HerdPage({ herd, selected, setSelected }: { herd: ReturnType<typeof useHerd>; selected: string | null; setSelected: (id: string) => void }) {
  const [q, setQ] = useState('');
  const all = herd.animals ?? [];
  const list = useMemo(() => { const s = q.trim().toLowerCase();
    return s ? all.filter((a) => [a.name, a.breed, a.tagCode].some((v) => (v ?? '').toLowerCase().includes(s))) : all; }, [all, q]);
  const a = all.find((x) => x.id === selected) ?? list[0];
  const w = a ? fmtW(a.weightKg) : null;
  const cm = (v: number | null) => (v && v > 0 ? `${Math.round(v)} cm` : '—');
  return (
    <div className="pf-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div className="pf-top"><div><h1 className="w8">Herd</h1><div className="pf-sub">{all.length} records · cloud synced</div></div>
        <label className="pf-search"><SearchIcon /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID, breed or category" aria-label="Search the herd" /></label></div>
      <div className="pf-row" style={{ alignItems: 'flex-start' }}>
        <div className="pf-card pf-list" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          {list.map((x) => <Row key={x.id} a={x} sel={a?.id === x.id} onClick={() => setSelected(x.id)} />)}
          {!list.length && <div className="pf-empty">{herd.animals === null ? 'Loading the herd…' : 'No animals match this search.'}</div>}
        </div>
        {a && (
          <aside className="pf-card pf-sheet" aria-label={`${a.name} details`}>
            <div className="w8" style={{ fontSize: 26, letterSpacing: -.5 }}>{a.name}</div>
            <div style={{ marginTop: 8 }}><span className="pf-badge w7"><span style={{ width: 14, display: 'inline-flex' }}><CloudIcon /></span>Synced</span></div>
            <div className="pf-est"><span className="lbl w7">Estimated weight</span><span className="exp w7">Experimental</span>
              <div className="num w8">{w ? <>≈ {w} <small className="w6">kg</small></> : '—'}</div><p>Experimental estimate, not validated against a scale</p></div>
            <div className="pf-sect w6" style={{ marginLeft: 2 }}>Measurements</div>
            <div className="pf-kv"><div><span>Body length</span><span>{cm(a.bodyLengthCm)}</span></div><div><span>Withers height</span><span>{cm(a.withersHeightCm)}</span></div>
              <div><span>Breed</span><span>{a.breed || '—'}</span></div><div><span>Tag</span><span>{a.tagCode || '—'}</span></div></div>
            {a.notes ? <div className="pf-sub" style={{ marginTop: 14 }}>{a.notes}</div> : null}
          </aside>)}
      </div>
    </div>
  );
}

// Análise, Perfil e Definições: os próprios ecrãs da app, numa coluna, com navegação própria.
const Stack = createNativeStackNavigator();
function Embedded({ initial }: { initial: 'Analytics' | 'Profile' | 'Settings' }) {
  return (
    <div className="pf-embed">
      <NavigationIndependentTree>
        <NavigationContainer theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: 'transparent' } }}>
          <View style={{ flex: 1, minHeight: '100vh' as any }}>
            <Stack.Navigator initialRouteName={initial} screenOptions={{ headerShown: false, animation: 'fade' }}>
              <Stack.Screen name="Analytics" component={AnalyticsScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="AnimalDetail" component={AnimalDetailScreen} />
            </Stack.Navigator>
          </View>
        </NavigationContainer>
      </NavigationIndependentTree>
    </div>
  );
}

export default function DesktopShell({ onRequestMobile, shellRef }: { onRequestMobile: () => void; shellRef?: React.Ref<HTMLDivElement> }) {
  const { user } = useAuth();
  const [page, setPage] = useState<Page>('home');
  const [selected, setSelected] = useState<string | null>(null);
  const [members, setMembers] = useState<number | null>(null);
  const herd = useHerd();
  useEffect(() => {
    if (user?.membershipStatus === 'active' && user.organizationId) listPeople(user.organizationId).then((p) => setMembers(p.length)).catch(() => {});
  }, [user?.organizationId, user?.membershipStatus]);
  const nav = (p: Page, label: string, Icon: React.FC) => (
    <button className={page === p ? 'on w6' : 'w6'} aria-current={page === p ? 'page' : undefined} onClick={() => setPage(p)}><Icon />{label}</button>);
  const ini = initials(null, user?.name) || '?';
  const pending = user?.membershipStatus === 'pending';
  return (
    <div className="pf pf-app" ref={shellRef}>
      <div className="pf-ground" />
      <aside className="pf-side">
        <div className="pf-brand"><img src={ICON} alt="" /><div className="pf-word w8">Pondi<span>Farm</span></div></div>
        <nav className="pf-nav" aria-label="Main">{nav('home', 'Home', HomeIcon)}{nav('herd', 'Herd', HerdIcon)}{nav('analytics', 'Analytics', ChartIcon)}{nav('settings', 'Settings', GearIcon)}</nav>
        <div className="pf-org">Organization<b className="w7">{pending ? user?.pendingOrganizationName : user?.organizationName || '—'}</b>
          <span className={`pf-role w7${pending ? ' pending' : ''}`}>{pending ? 'Waiting for approval' : user?.role === 'leader' ? 'Leader' : 'Member'}</span></div>
        <div className="pf-me">
          <button className="who" onClick={() => setPage('profile')} aria-label="Open your profile">
            <div className="pf-av w7">{ini}</div><div style={{ minWidth: 0 }}><div className="n w7">{user?.name || 'Your profile'}</div><div className="e">{user?.email}</div></div></button>
          <button className="pf-dev" onClick={onRequestMobile} aria-label="Desktop version. Switch to mobile version"><DesktopIcon /><span className="tip w6">Desktop version</span></button>
        </div>
      </aside>
      <main className="pf-main">
        {page === 'home' && <HomePage herd={herd} members={members} goHerd={(id) => { if (id) setSelected(id); setPage('herd'); }} />}
        {page === 'herd' && <HerdPage herd={herd} selected={selected} setSelected={setSelected} />}
        {page === 'analytics' && <Embedded key="a" initial="Analytics" />}
        {page === 'settings' && <Embedded key="s" initial="Settings" />}
        {page === 'profile' && <Embedded key="p" initial="Profile" />}
      </main>
    </div>
  );
}
