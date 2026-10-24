import React, { useEffect, useRef, useState } from 'react';
import FarmMap from '../components/FarmMap';
import { useAuth } from '../lib/AuthContext';
import { reversePlace, saveFarmLocation, searchPlaces, useWeather, type Place } from '../lib/weather';

/**
 * Marcar a quinta no computador (só o Líder): a localização deste browser, pesquisa
 * por nome ou código postal, e o pino no mapa para afinar. Guarda-se a ~1 km.
 */
const PORTUGAL = { lat: 39.5, lon: -8.0 };

export default function FarmLocationDialog({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { weather, refresh } = useWeather();
  const start = weather?.location ?? null;
  const [pin, setPin] = useState(start ? { lat: start.lat, lon: start.lon } : PORTUGAL);
  const [label, setLabel] = useState<string | null>(start?.label ?? null);
  const [touched, setTouched] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [busy, setBusy] = useState<'gps' | 'save' | 'search' | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 3) { setResults([]); return; }
    timer.current = setTimeout(() => {
      setBusy('search');
      searchPlaces(q).then(setResults).catch(() => setResults([])).finally(() => setBusy(null));
    }, 450);
  }, [q]);

  const move = (lat: number, lon: number, known?: string | null) => {
    setPin({ lat, lon }); setTouched(true); setErr(null);
    if (known) { setLabel(known); return; }
    setLabel(null);
    reversePlace(lat, lon).then((p) => setLabel(p.label)).catch(() => {});
  };
  const mine = () => {
    if (!navigator.geolocation) { setErr('This browser cannot share its location. Search or move the pin instead.'); return; }
    setBusy('gps'); setErr(null);
    navigator.geolocation.getCurrentPosition(
      (p) => { setBusy(null); move(p.coords.latitude, p.coords.longitude); },
      () => { setBusy(null); setErr('Location permission was not given. Search or move the pin instead.'); },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };
  const save = async () => {
    if (!user?.organizationId) return;
    setBusy('save'); setErr(null);
    try {
      await saveFarmLocation(user.organizationId, { lat: pin.lat, lon: pin.lon, label });
      await refresh();
      onClose();
    } catch (e: any) { setErr(String(e?.message ?? e)); } finally { setBusy(null); }
  };

  return (
    <div className="pf pf-scrim" onClick={onClose}>
      <div className="pf-dlg pf-locdlg" role="dialog" aria-modal="true" aria-labelledby="pf-loc-t" onClick={(e) => e.stopPropagation()}>
        <h3 id="pf-loc-t" className="w8">Farm location</h3>
        <p>Mark the farm once. Everyone in the organization sees its forecast and welfare alerts.</p>
        <div className="pf-locbar">
          <button className="pf-btn g w7" onClick={mine} disabled={busy === 'gps'}>{busy === 'gps' ? 'Locating…' : 'Use my location'}</button>
          <div className="pf-locsearch">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a place or postcode, e.g. 6000-458" aria-label="Search a place or postcode" />
            {results.length > 0 && (
              <div className="pf-locres" role="listbox">
                {results.map((r, i) => <button key={`${r.lat},${r.lon},${i}`} role="option" aria-selected={false} onClick={() => { move(r.lat, r.lon, r.label); setResults([]); setQ(''); }}>{r.label}</button>)}
              </div>)}
          </div>
        </div>
        <FarmMap lat={pin.lat} lon={pin.lon} onChange={(a, b) => move(a, b)} height={340} />
        <div className="pf-locpick"><b className="w7">{label ?? (touched || start ? 'Finding the place name…' : 'No location yet')}</b>
          <span>{pin.lat.toFixed(2)}, {pin.lon.toFixed(2)} · drag the pin or click the map to adjust · saved rounded to about 1 km</span></div>
        {err && <div className="pf-err" role="alert">{err}</div>}
        <div className="acts">
          <button className="pf-btn l w7" onClick={onClose}>Cancel</button>
          <button className="pf-btn g w7" onClick={save} disabled={busy === 'save' || !(touched || start)}>{busy === 'save' ? 'Saving…' : 'Save farm location'}</button>
        </div>
      </div>
    </div>
  );
}
