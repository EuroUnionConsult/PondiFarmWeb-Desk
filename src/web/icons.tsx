import React from 'react';

// Ícones de traço simples, no estilo dos Ionicons usados na app.
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
export const HomeIcon = () => <svg viewBox="0 0 24 24" {...P}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>;
export const HerdIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="9" r="2.3" /><circle cx="10" cy="5" r="2.3" /><circle cx="14" cy="5" r="2.3" /><circle cx="18" cy="9" r="2.3" />
    <path d="M12 11c-3 0-6 3.6-6 6.3C6 19.6 8 20 9.6 19.5c1-.3 1.6-.7 2.4-.7s1.4.4 2.4.7c1.6.5 3.6.1 3.6-2.2C18 14.6 15 11 12 11z" /></svg>);
export const ChartIcon = () => <svg viewBox="0 0 24 24" {...P}><path d="M4 20h16M7 16v-5M12 16V6M17 16v-8" /></svg>;
export const GearIcon = () => <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="3.2" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></svg>;
export const DesktopIcon = () => <svg viewBox="0 0 24 24" {...P}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>;
export const PhoneIcon = () => <svg viewBox="0 0 24 24" {...P}><rect x="6.5" y="2.5" width="11" height="19" rx="2.6" /><path d="M10.5 18.5h3" /></svg>;
export const CloudIcon = () => <svg viewBox="0 0 24 24" {...P}><path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 10a4 4 0 0 1-.5 8z" /></svg>;
export const SearchIcon = () => <svg viewBox="0 0 24 24" width="18" {...P} strokeWidth={2.2}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>;
export const Chevron = () => <svg className="pf-chev" viewBox="0 0 24 24" {...P} strokeWidth={2.4}><path d="m9 6 6 6-6 6" /></svg>;
