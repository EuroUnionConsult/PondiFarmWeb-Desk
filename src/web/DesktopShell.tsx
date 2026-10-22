import React, { useCallback, useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import { useAuth } from '../lib/AuthContext';
import { listPeople } from '../lib/orgs';
import { initials, loadProfile, type Profile } from '../lib/profile';
import { PROFILE_SAVED } from './ProfilePage';
import AnalyticsPage from './AnalyticsPage';
import SettingsPage from './SettingsPage';
import ProfilePage from './ProfilePage';
import HomePage from './HomePage';
import HerdPage from './HerdPage';
import { useHerd } from './herd';
import { ChartIcon, DesktopIcon, GearIcon, HerdIcon, HomeIcon } from './icons';

const ICON = Asset.fromModule(require('../../assets/icon.png')).uri;
export type Page = 'home' | 'herd' | 'analytics' | 'settings' | 'profile';

export default function DesktopShell({ onRequestMobile, shellRef }: { onRequestMobile: () => void; shellRef?: React.Ref<HTMLDivElement> }) {
  const { user } = useAuth();
  const [page, setPage] = useState<Page>('home');
  const [selected, setSelected] = useState<string | null>(null);
  const [members, setMembers] = useState<number | null>(null);
  const herd = useHerd();
  const openAnimal = (id?: string) => { if (id) setSelected(id); setPage('herd'); };
  const goSettings = useCallback(() => setPage('settings'), []);
  useEffect(() => {
    if (user?.membershipStatus === 'active' && user.organizationId) listPeople(user.organizationId).then((p) => setMembers(p.length)).catch(() => {});
  }, [user?.organizationId, user?.membershipStatus]);
  const nav = (p: Page, label: string, Icon: React.FC) => (
    <button className={page === p ? 'on w6' : 'w6'} aria-current={page === p ? 'page' : undefined} onClick={() => setPage(p)} title={label}><Icon /><span className="lbl">{label}</span></button>);
  // O nome editado no Perfil fica no browser (como na app); o rodapé mostra-o também.
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    const read = () => { void loadProfile(user?.id).then(setProfile); };
    read(); window.addEventListener(PROFILE_SAVED, read);
    return () => window.removeEventListener(PROFILE_SAVED, read);
  }, [user?.id]);
  const shownName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : user?.name;
  const ini = initials(profile, user?.name) || '?';
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
            <div className="pf-av w7">{ini}</div><div className="nmb" style={{ minWidth: 0 }}><div className="n w7">{shownName || 'Your profile'}</div><div className="e">{user?.email}</div></div></button>
          <button className="pf-dev" onClick={onRequestMobile} aria-label="Desktop version. Switch to mobile version"><DesktopIcon /><span className="tip w6">Desktop version</span></button>
        </div>
      </aside>
      <main className="pf-main">
        {/* key={page}: cada troca de página reinicia a animação de entrada (pf-pagein). */}
        <div className="pf-pagein" key={page}>
          {page === 'home' && <HomePage herd={herd} members={members} openAnimal={openAnimal} goHerd={() => setPage('herd')} goAnalytics={() => setPage('analytics')} />}
          {page === 'herd' && <HerdPage herd={herd} selected={selected} setSelected={setSelected} />}
          {page === 'analytics' && <AnalyticsPage herd={herd} openAnimal={openAnimal} />}
          {page === 'settings' && <SettingsPage />}
          {page === 'profile' && <ProfilePage goSettings={goSettings} />}
        </div>
      </main>
    </div>
  );
}
