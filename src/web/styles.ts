// Estilos da versão desktop (só web). Os tokens são os da app (src/lib/theme.ts, Identidade visual v1.0).
export const CSS = `
:root { --navy:#1B3A57; --green:#2D7D46; --greenL:#E8F2EB; --orange:#C2611F; --ground:#F2F4F6; --card:#FFFFFF; --muted:#6B7785; --line:#E6E9ED; --label:#1C2530; }
.pf * { box-sizing: border-box; }
.pf { font-family: Inter_400Regular, Inter, -apple-system, system-ui, sans-serif; color: var(--label); }
.pf b, .pf strong, .pf .w7 { font-family: Inter_700Bold, Inter, system-ui, sans-serif; font-weight: 700; }
.pf .w6 { font-family: Inter_600SemiBold, Inter, system-ui, sans-serif; font-weight: 600; }
.pf .w8 { font-family: Inter_800ExtraBold, Inter, system-ui, sans-serif; font-weight: 800; }
.pf button { font: inherit; cursor: pointer; }
.pf button:focus-visible, .pf a:focus-visible, .pf input:focus-visible { outline: 3px solid rgba(45,125,70,.45); outline-offset: 2px; }
.pf-ground { position: fixed; inset: 0; background: var(--ground); overflow: hidden; }
.pf-ground:before { content: ""; position: absolute; width: 760px; height: 760px; border-radius: 50%; background: rgba(45,125,70,.09); right: -200px; top: -260px; }
.pf-ground:after { content: ""; position: absolute; width: 560px; height: 560px; border-radius: 50%; background: rgba(194,97,31,.07); left: 120px; bottom: -330px; }

/* ---------- shell ---------- */
.pf-app { position: absolute; inset: 0; display: flex; }
.pf-side { width: 248px; flex: none; padding: 28px 18px 22px; display: flex; flex-direction: column; background: rgba(255,255,255,.72); border-right: 1px solid var(--line); position: relative; z-index: 2; }
.pf-brand { display: flex; align-items: center; gap: 10px; padding: 0 8px 26px; }
.pf-brand img { width: 34px; height: 34px; border-radius: 9px; }
.pf-word { font-size: 23px; letter-spacing: -.5px; color: var(--navy); } .pf-word span { color: var(--green); }
.pf-nav button { width: 100%; display: flex; align-items: center; gap: 12px; padding: 11px 12px; border: 0; background: none; border-radius: 12px; font-size: 15.5px; color: #3B4754; margin-bottom: 3px; text-align: left; }
.pf-nav button:hover { background: rgba(27,58,87,.05); }
.pf-nav button.on { background: var(--greenL); color: var(--green); }
.pf-nav svg { width: 21px; height: 21px; flex: none; }
.pf-org { margin-top: auto; padding: 12px; border-radius: 14px; background: var(--card); border: 1px solid var(--line); font-size: 13px; color: var(--muted); }
.pf-org b { display: block; color: var(--label); font-size: 14.5px; margin-top: 2px; }
.pf-role { display: inline-block; margin-top: 8px; font-size: 12px; color: var(--green); background: var(--greenL); padding: 3px 9px; border-radius: 8px; }
.pf-role.pending { color: #9C4C16; background: rgba(194,97,31,.12); }
.pf-me { display: flex; align-items: center; gap: 10px; padding: 14px 4px 0; }
.pf-me .who { border: 0; background: none; display: flex; align-items: center; gap: 10px; padding: 0; text-align: left; min-width: 0; flex: 1; }
.pf-av { width: 40px; height: 40px; border-radius: 50%; background: var(--green); color: #fff; font-size: 15px; display: flex; align-items: center; justify-content: center; flex: none; }
.pf-me .n { font-size: 14.5px; color: var(--label); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pf-me .e { font-size: 12.5px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; }
.pf-dev { width: 40px; height: 40px; flex: none; border-radius: 12px; border: 1px solid var(--line); background: var(--card); display: flex; align-items: center; justify-content: center; color: var(--navy); position: relative; }
.pf-dev:hover { border-color: var(--green); color: var(--green); }
.pf-dev svg { width: 21px; height: 21px; }
.pf-dev .tip { position: absolute; left: 50%; bottom: 50px; transform: translateX(-50%); white-space: nowrap; background: var(--navy); color: #fff; font-size: 12.5px; padding: 6px 10px; border-radius: 8px; opacity: 0; pointer-events: none; transition: opacity .15s; }
.pf-dev:hover .tip, .pf-dev:focus-visible .tip { opacity: 1; }
.pf-main { flex: 1; position: relative; overflow: auto; }
.pf-page { padding: 34px 40px 40px; position: relative; z-index: 1; max-width: 1280px; }
.pf h1 { font-size: 34px; letter-spacing: -.8px; margin: 0; color: var(--label); }
.pf-sub { color: var(--muted); font-size: 14.5px; margin-top: 4px; }
.pf-row { display: flex; gap: 20px; margin-top: 26px; }
.pf-card { background: var(--card); border-radius: 20px; border: 1px solid var(--line); }
.pf-hero { flex: 1.25; padding: 26px 28px; display: flex; align-items: center; justify-content: space-between; }
.pf-k { font-size: 14px; color: var(--green); }
.pf-big { font-size: 64px; letter-spacing: -2px; margin-top: 4px; line-height: 1.05; } .pf-big small { font-size: 26px; letter-spacing: 0; color: #3B4754; margin-left: 6px; }
.pf-ring { width: 118px; height: 118px; border-radius: 50%; border: 11px solid var(--green); display: flex; flex-direction: column; align-items: center; justify-content: center; flex: none; }
.pf-ring b { font-size: 24px; } .pf-ring span { font-size: 11px; color: var(--muted); letter-spacing: .5px; }
.pf-stats { flex: 1; display: grid; grid-template-columns: 1fr 1fr; }
.pf-stat { padding: 20px 22px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); } .pf-stat:nth-child(2n) { border-right: 0; } .pf-stat:nth-child(n+3) { border-bottom: 0; }
.pf-stat b { font-size: 30px; letter-spacing: -.6px; } .pf-stat span { display: block; font-size: 13px; color: var(--muted); margin-top: 2px; }
.pf-sect { font-size: 13px; color: var(--muted); margin: 26px 0 10px 6px; letter-spacing: .3px; }
.pf-list .it { width: 100%; display: flex; align-items: center; gap: 14px; padding: 13px 18px; border: 0; border-bottom: 1px solid var(--line); background: none; font-size: 15px; text-align: left; color: var(--label); }
.pf-list .it:last-child { border-bottom: 0; } .pf-list .it:hover { background: #F7FAF8; } .pf-list .it.sel { background: #EFF6F1; }
.pf-ico { width: 34px; height: 34px; border-radius: 10px; background: var(--greenL); display: flex; align-items: center; justify-content: center; color: var(--green); flex: none; } .pf-ico svg { width: 18px; height: 18px; }
.pf-list .t span { display: block; font-size: 12.5px; color: var(--muted); margin-top: 1px; }
.pf-list .w { margin-left: auto; text-align: right; font-size: 17px; } .pf-list .w span { display: block; font-size: 11px; color: var(--muted); }
.pf-chev { color: #B3BBC4; width: 16px; flex: none; }
.pf-bars { display: flex; align-items: flex-end; gap: 10px; height: 170px; padding: 18px 22px 0; }
.pf-bars i { flex: 1; background: var(--green); border-radius: 6px 6px 0 0; opacity: .85; min-height: 3px; } .pf-bars i.m { background: var(--navy); opacity: .9; }
.pf-axis { display: flex; gap: 10px; padding: 8px 22px 16px; font-size: 11.5px; color: var(--muted); } .pf-axis span { flex: 1; text-align: center; }
.pf-note { display: flex; gap: 10px; align-items: center; padding: 14px 18px; font-size: 13.5px; color: #3B4754; } .pf-note svg { color: var(--navy); width: 20px; flex: none; }
.pf-top { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.pf-search { display: flex; align-items: center; gap: 10px; padding: 0 14px; border-radius: 12px; background: rgba(118,118,128,.12); color: var(--muted); width: 380px; }
.pf-search input { border: 0; background: none; font: inherit; font-size: 14.5px; padding: 11px 0; flex: 1; outline: none; color: var(--label); }
.pf-sheet { width: 430px; flex: none; padding: 24px; align-self: flex-start; position: sticky; top: 24px; }
.pf-badge { display: inline-flex; gap: 6px; align-items: center; font-size: 12px; color: var(--green); background: var(--greenL); padding: 4px 10px; border-radius: 8px; }
.pf-est { margin-top: 18px; border-radius: 16px; border: 1px solid var(--line); padding: 18px 20px; }
.pf-est .lbl { font-size: 13px; color: var(--green); } .pf-est .exp { font-size: 12px; color: #9C4C16; background: rgba(194,97,31,.12); padding: 2px 8px; border-radius: 6px; margin-left: 6px; }
.pf-est .num { font-size: 52px; letter-spacing: -1.5px; margin-top: 6px; } .pf-est .num small { font-size: 22px; color: #3B4754; }
.pf-est p { font-size: 13px; color: var(--muted); margin: 6px 0 0; }
.pf-kv div { display: flex; justify-content: space-between; padding: 11px 2px; border-bottom: 1px solid var(--line); font-size: 14.5px; } .pf-kv div span:last-child { color: #3B4754; }
.pf-empty { padding: 40px 24px; text-align: center; color: var(--muted); font-size: 14.5px; }
.pf-embed { position: relative; max-width: 760px; margin: 0 auto; height: 100%; }

/* ---------- login ---------- */
.pf-login { position: fixed; inset: 0; display: flex; }
.pf-lp { flex: 1.1; position: relative; overflow: hidden; background: #122434; color: #fff; padding: 56px 64px; display: flex; flex-direction: column; }
.pf-lp img.c { position: absolute; left: 50%; top: 46%; width: 760px; max-width: 120%; transform: translate(-50%, -50%); }
.pf-lbrand { position: relative; z-index: 1; align-self: flex-start; display: flex; align-items: center; gap: 12px; background: #F2F4F6; padding: 10px 18px 10px 10px; border-radius: 18px; box-shadow: 0 10px 30px rgba(0,0,0,.25); }
.pf-lbrand img { width: 46px; height: 46px; border-radius: 12px; } .pf-lbrand .pf-word { font-size: 28px; }
.pf-lp h2 { margin-top: auto; font-size: 46px; letter-spacing: -1.4px; line-height: 1.05; position: relative; }
.pf-lp p { position: relative; margin-top: 14px; color: #B9C7D4; font-size: 17px; max-width: 440px; line-height: 1.5; }
.pf-rp { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.pf-form { width: 400px; position: relative; z-index: 1; }
.pf-seg { display: flex; background: rgba(118,118,128,.12); border-radius: 12px; padding: 3px; margin: 26px 0 8px; }
.pf-seg button { flex: 1; border: 0; background: none; padding: 10px; font-size: 15px; color: #3B4754; border-radius: 10px; } .pf-seg button.on { background: #fff; color: var(--label); box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.pf-f label { display: block; font-size: 13.5px; color: #3B4754; margin: 14px 0 7px; }
.pf-f input { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #D5DAE0; background: #fff; font: inherit; font-size: 15px; color: var(--label); }
.pf-btn { padding: 11px 18px; border-radius: 12px; font-size: 14.5px; border: 0; }
.pf-btn.g { background: var(--green); color: #fff; } .pf-btn.g:hover { background: #276E3D; } .pf-btn.g:disabled { opacity: .6; cursor: default; }
.pf-btn.l { background: #fff; color: var(--navy); border: 1px solid var(--line); }
.pf-form .pf-btn.g { width: 100%; padding: 15px; margin-top: 22px; font-size: 16px; }
.pf-small { font-size: 13px; color: var(--muted); margin-top: 16px; text-align: center; line-height: 1.5; }
.pf-err { margin-top: 14px; color: #B42318; font-size: 13.5px; }

/* ---------- diálogo ---------- */
.pf-scrim { position: fixed; inset: 0; background: rgba(18,36,52,.34); z-index: 50; display: flex; align-items: center; justify-content: center; animation: pfFade .18s ease-out; }
.pf-dlg { width: 420px; background: #fff; border-radius: 22px; padding: 26px 26px 20px; box-shadow: 0 30px 70px rgba(18,36,52,.3); text-align: center; animation: pfPop .26s cubic-bezier(.2,.9,.3,1.2); }
.pf-dlg .di { width: 66px; height: 66px; margin: 0 auto 14px; border-radius: 18px; background: var(--greenL); color: var(--green); display: flex; align-items: center; justify-content: center; } .pf-dlg .di svg { width: 34px; height: 34px; }
.pf-dlg h3 { font-size: 21px; letter-spacing: -.3px; margin: 0; } .pf-dlg p { font-size: 14.5px; color: var(--muted); margin: 8px 0 0; line-height: 1.45; }
.pf-dlg .acts { display: flex; gap: 10px; margin-top: 22px; } .pf-dlg .acts .pf-btn { flex: 1; padding: 13px; }
@keyframes pfFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes pfPop { from { opacity: 0; transform: scale(.94) } to { opacity: 1; transform: scale(1) } }

/* ---------- modo mobile ---------- */
.pf-phoneStage { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
.pf-bezel { position: relative; border-radius: 64px; background: #0E1620; padding: 14px; box-shadow: 0 46px 90px rgba(27,58,87,.3); flex: none; }
.pf-screen { position: relative; width: 392px; height: 852px; border-radius: 50px; overflow: hidden; background: var(--ground); transform: translateZ(0); }
.pf-back { position: fixed; right: 36px; top: 30px; display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--muted); z-index: 5; border: 0; background: none; padding: 0; }
.pf-back .pf-dev { pointer-events: none; }
.pf-caption { position: fixed; left: 0; right: 0; bottom: 20px; text-align: center; font-size: 13.5px; color: var(--muted); }
`;
