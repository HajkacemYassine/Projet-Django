import { useState, useEffect, createContext, useContext,useCallback } from "react";

const AuthContext = createContext(null);
const DJANGO_URL = "http://localhost:8000";
const BLOOD_API = "http://localhost:8000/blood-api";  


// ─── Icons ────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20 }) => {
  const icons = {
    blood: (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0C19 10.5 12 2 12 2z"/></svg>),
    heart: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>),
    hospital: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12h6M12 9v6"/></svg>),
    user: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
    users: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>),
    logout: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>),
    eye: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>),
    eyeOff: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>),
    lock: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>),
    mail: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>),
    menu: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>),
    close: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
    check: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>),
    alert: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><triangle points="10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>),
    chart: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>),
    calendar: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>),
    drop: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>),
    plus: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
    arrow: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>),
    shield: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
    clock: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
    location: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>),
  };
  return icons[name] || null;
};

const GROUPES_SANGUINS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

// ─── CSS ──────────────────────────────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --red: #c0392b; --red-dark: #922b21; --red-light: #fadbd8; --red-mid: #e74c3c;
    --blue: #2980b9; --blue-light: #d6eaf8;
    --green: #27ae60; --green-light: #d5f5e3;
    --orange: #e67e22; --orange-light: #fdebd0;
    --bg: #f0f2f5; --surface: #ffffff; --surface2: #f8f9fa;
    --border: #e8ecef; --text: #1a1a2e; --text2: #6c757d; --text3: #adb5bd;
    --radius: 16px; --radius-sm: 10px;
    --shadow: 0 4px 24px rgba(0,0,0,0.08); --shadow-sm: 0 2px 8px rgba(0,0,0,0.05);
    --font-display: 'Outfit', sans-serif; --font-body: 'Inter', sans-serif;
    --sidebar-w: 260px; --transition: 0.2s ease;
    --red-glow: 0 0 30px rgba(192,57,43,0.15);
  }

  body { font-family: var(--font-body); background: var(--bg); color: var(--text); min-height: 100vh; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* ── Auth ── */
  .auth-page { min-height: 100vh; display: flex; background: var(--bg); position: relative; overflow: hidden; }
  .auth-left { flex: 1; background: linear-gradient(135deg, var(--red-dark), var(--red-mid)); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 40px; position: relative; overflow: hidden; }
  .auth-left::before { content: ''; position: absolute; width: 400px; height: 400px; border-radius: 50%; background: rgba(255,255,255,0.05); top: -100px; left: -100px; }
  .auth-left::after { content: ''; position: absolute; width: 300px; height: 300px; border-radius: 50%; background: rgba(255,255,255,0.05); bottom: -80px; right: -80px; }
  .auth-left-content { position: relative; z-index: 1; text-align: center; color: white; }
  .auth-brand { font-family: var(--font-display); font-size: 42px; font-weight: 800; letter-spacing: -1px; margin-bottom: 16px; }
  .auth-brand .drop { font-size: 50px; display: block; margin-bottom: 8px; }
  .auth-tagline { font-size: 16px; opacity: 0.85; line-height: 1.6; max-width: 300px; }
  .auth-stats { display: flex; gap: 32px; margin-top: 48px; }
  .auth-stat { text-align: center; }
  .auth-stat-val { font-family: var(--font-display); font-size: 28px; font-weight: 800; }
  .auth-stat-label { font-size: 12px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; }

  .auth-right { width: 480px; display: flex; align-items: center; justify-content: center; padding: 40px; }
  .auth-card { width: 100%; }
  .auth-title { font-family: var(--font-display); font-size: 28px; font-weight: 700; margin-bottom: 6px; color: var(--text); }
  .auth-subtitle { color: var(--text2); font-size: 14px; margin-bottom: 32px; }

  .form-group { margin-bottom: 18px; }
  .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text2); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .input-wrap { position: relative; }
  .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text3); pointer-events: none; display: flex; }
  .input-icon-right { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--text3); cursor: pointer; background: none; border: none; display: flex; }
  .form-input { width: 100%; background: var(--surface2); border: 2px solid var(--border); border-radius: var(--radius-sm); padding: 12px 44px; color: var(--text); font-family: var(--font-body); font-size: 14px; outline: none; transition: all var(--transition); }
  .form-input:focus { border-color: var(--red); background: white; box-shadow: 0 0 0 3px rgba(192,57,43,0.1); }
  .form-input::placeholder { color: var(--text3); }
  .form-input.no-icon { padding-left: 16px; }
  .form-select { width: 100%; background: var(--surface2); border: 2px solid var(--border); border-radius: var(--radius-sm); padding: 12px 16px; color: var(--text); font-family: var(--font-body); font-size: 14px; outline: none; cursor: pointer; transition: border-color var(--transition); }
  .form-select:focus { border-color: var(--red); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .btn-red { width: 100%; padding: 14px; background: linear-gradient(135deg, var(--red-dark), var(--red-mid)); border: none; border-radius: var(--radius-sm); color: white; font-family: var(--font-display); font-size: 15px; font-weight: 700; cursor: pointer; transition: all var(--transition); }
  .btn-red:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(192,57,43,0.4); }
  .btn-red:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .error-msg { background: var(--red-light); border: 1px solid rgba(192,57,43,0.3); border-radius: var(--radius-sm); padding: 12px 16px; color: var(--red); font-size: 13px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
  .success-msg { background: var(--green-light); border: 1px solid rgba(39,174,96,0.3); border-radius: var(--radius-sm); padding: 12px 16px; color: var(--green); font-size: 13px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
  .warn-msg { background: var(--orange-light); border: 1px solid rgba(230,126,34,0.3); border-radius: var(--radius-sm); padding: 12px 16px; color: var(--orange); font-size: 13px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }

  .auth-switch { text-align: center; margin-top: 24px; font-size: 14px; color: var(--text2); }
  .auth-switch button { background: none; border: none; color: var(--red); font-weight: 700; cursor: pointer; font-family: var(--font-body); font-size: 14px; }
  .auth-tabs { display: flex; gap: 0; margin-bottom: 28px; background: var(--surface2); border-radius: var(--radius-sm); padding: 4px; }
  .auth-tab { flex: 1; padding: 10px; border: none; background: none; border-radius: 8px; font-family: var(--font-body); font-size: 14px; font-weight: 600; cursor: pointer; color: var(--text2); transition: all var(--transition); display: flex; align-items: center; justify-content: center; gap: 6px; }
  .auth-tab.active { background: white; color: var(--red); box-shadow: var(--shadow-sm); }

  /* ── Project Selector ── */
  .project-page { min-height: 100vh; background: var(--bg); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 40px; padding: 40px; }
  .project-cards { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
  .project-card { width: 260px; padding: 40px 28px; background: var(--surface); border: 2px solid var(--border); border-radius: 20px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 16px; transition: all 0.25s; text-align: center; }
  .project-card:hover { transform: translateY(-6px); box-shadow: var(--shadow); }
  .project-card.red:hover { border-color: var(--red); }
  .project-card.blue:hover { border-color: var(--blue); }
  .project-card-emoji { font-size: 52px; }
  .project-card-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; }
  .project-card-desc { font-size: 13px; color: var(--text2); line-height: 1.5; }
  .project-card-arrow { font-size: 13px; font-weight: 600; opacity: 0; transform: translateX(-8px); transition: all 0.2s; }
  .project-card.red .project-card-arrow { color: var(--red); }
  .project-card.blue .project-card-arrow { color: var(--blue); }
  .project-card:hover .project-card-arrow { opacity: 1; transform: translateX(0); }

  /* ── App Layout ── */
  .app-layout { display: flex; min-height: 100vh; }
  .sidebar { width: var(--sidebar-w); background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; }
  .sidebar-logo { padding: 24px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
  .sidebar-logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, var(--red-dark), var(--red-mid)); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; }
  .sidebar-logo-text { font-family: var(--font-display); font-size: 18px; font-weight: 800; }
  .sidebar-logo-text span { color: var(--red); }
  .sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
  .nav-label { font-size: 10px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 1.5px; padding: 8px 12px; margin-top: 8px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 12px; border-radius: var(--radius-sm); color: var(--text2); font-size: 14px; font-weight: 500; cursor: pointer; border: none; background: none; width: 100%; text-align: left; transition: all var(--transition); margin-bottom: 2px; position: relative; }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active { background: var(--red-light); color: var(--red); font-weight: 600; }
  .nav-item.active::before { content: ''; position: absolute; left: 0; top: 20%; bottom: 20%; width: 3px; background: var(--red); border-radius: 0 3px 3px 0; }
  .sidebar-user { padding: 16px; border-top: 1px solid var(--border); }
  .user-chip { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface2); border-radius: var(--radius-sm); }
  .user-avatar { width: 36px; height: 36px; background: linear-gradient(135deg, var(--red-dark), var(--red-mid)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px; flex-shrink: 0; }
  .user-name { font-size: 13px; font-weight: 600; }
  .user-role-badge { font-size: 11px; color: var(--text3); }
  .btn-logout { width: 100%; margin-top: 10px; padding: 9px; background: none; border: 2px solid rgba(192,57,43,0.2); border-radius: var(--radius-sm); color: var(--red); font-size: 13px; font-weight: 600; font-family: var(--font-body); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all var(--transition); }
  .btn-logout:hover { background: var(--red-light); }
  .btn-back { display: flex; align-items: center; gap: 6px; background: none; border: none; color: var(--text3); font-size: 12px; cursor: pointer; padding: 6px 0; margin-bottom: 8px; font-family: var(--font-body); transition: color var(--transition); }
  .btn-back:hover { color: var(--text2); }
  .main-content { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; }
  .topbar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 32px; display: flex; align-items: center; gap: 16px; position: sticky; top: 0; z-index: 50; }
  .topbar-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; flex: 1; }
  .mobile-menu-btn { display: none; background: none; border: none; cursor: pointer; color: var(--text); }
  .page-content { padding: 32px; flex: 1; }

  /* ── Cards ── */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; }
  .card-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 24px; display: flex; align-items: center; gap: 16px; transition: transform var(--transition), box-shadow var(--transition); animation: fadeUp 0.4s ease backwards; }
  .stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .stat-value { font-family: var(--font-display); font-size: 28px; font-weight: 800; letter-spacing: -1px; }
  .stat-label { font-size: 12px; color: var(--text2); }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .section-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; }
  .content-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 20px; }

  /* ── Demande Cards ── */
  .demande-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; transition: all var(--transition); animation: fadeUp 0.4s ease backwards; }
  .demande-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
  .demande-card.urgente { border-left: 4px solid var(--red); }
  .blood-badge { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; background: var(--red-light); color: var(--red); font-family: var(--font-display); font-size: 14px; font-weight: 800; flex-shrink: 0; }
  .badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-red { background: var(--red-light); color: var(--red); }
  .badge-green { background: var(--green-light); color: var(--green); }
  .badge-orange { background: var(--orange-light); color: var(--orange); }
  .badge-blue { background: var(--blue-light); color: var(--blue); }
  .badge-gray { background: var(--surface2); color: var(--text2); }
  .urgente-pulse { animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  .eligibilite-bar { background: var(--surface2); border-radius: 20px; height: 8px; overflow: hidden; margin-top: 8px; }
  .eligibilite-fill { height: 100%; border-radius: 20px; background: linear-gradient(90deg, var(--red), var(--red-mid)); transition: width 1s ease; }

  /* ── Table ── */
  .table-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { border-bottom: 1px solid var(--border); background: var(--surface2); }
  th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; }
  td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tbody tr { transition: background var(--transition); }
  tbody tr:hover { background: var(--surface2); }
  .avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--red-dark), var(--red-mid)); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: white; flex-shrink: 0; }

  /* ── Modal ── */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeOverlay 0.2s ease; }
  @keyframes fadeOverlay { from { opacity: 0; } to { opacity: 1; } }
  .modal { background: var(--surface); border-radius: 20px; padding: 32px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; animation: fadeUp 0.3s ease; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
  .modal-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; margin-bottom: 24px; }
  .modal-close { position: absolute; top: 20px; right: 20px; background: none; border: none; color: var(--text3); cursor: pointer; padding: 4px; }
  .form-actions { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; }
  .btn-secondary { padding: 11px 24px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text2); font-family: var(--font-body); font-size: 14px; cursor: pointer; transition: all var(--transition); }
  .btn-secondary:hover { color: var(--text); border-color: var(--text3); }
  .btn-submit { padding: 11px 24px; background: linear-gradient(135deg, var(--red-dark), var(--red-mid)); border: none; border-radius: var(--radius-sm); color: white; font-family: var(--font-display); font-size: 14px; font-weight: 700; cursor: pointer; transition: all var(--transition); }
  .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(192,57,43,0.4); }
  .btn-add { padding: 9px 18px; background: linear-gradient(135deg, var(--red-dark), var(--red-mid)); border: none; border-radius: 40px; color: white; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: var(--font-body); transition: all var(--transition); }
  .btn-add:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(192,57,43,0.35); }
  .btn-outline { padding: 8px 16px; background: none; border: 2px solid var(--red); border-radius: var(--radius-sm); color: var(--red); font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: all var(--transition); }
  .btn-outline:hover { background: var(--red-light); }
  .btn-sm { padding: 6px 12px; border-radius: 8px; font-size: 12px; border: none; cursor: pointer; font-family: var(--font-body); font-weight: 600; transition: all var(--transition); }
  .btn-sm-green { background: var(--green-light); color: var(--green); }
  .btn-sm-green:hover { background: var(--green); color: white; }
  .btn-sm-red { background: var(--red-light); color: var(--red); }
  .btn-sm-red:hover { background: var(--red); color: white; }

  /* ── Toast ── */
  .toast { position: fixed; bottom: 24px; right: 24px; background: var(--surface); border: 1px solid var(--border); border-left: 4px solid var(--green); border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; gap: 10px; box-shadow: var(--shadow); z-index: 300; font-size: 14px; animation: fadeUp 0.3s ease; }

  /* ── Eligibilité card ── */
  .eligibilite-card { background: linear-gradient(135deg, var(--red-dark), var(--red-mid)); color: white; border-radius: var(--radius); padding: 24px; margin-bottom: 20px; }
  .eligibilite-card.ok { background: linear-gradient(135deg, #1a5e3a, var(--green)); }

  /* ── Accueil ── */
  .accueil-page { min-height: 100vh; }
  .hero { background: linear-gradient(135deg, var(--red-dark), var(--red-mid)); color: white; padding: 80px 40px; text-align: center; }
  .hero-title { font-family: var(--font-display); font-size: 52px; font-weight: 800; letter-spacing: -2px; margin-bottom: 16px; }
  .hero-sub { font-size: 18px; opacity: 0.85; max-width: 500px; margin: 0 auto 40px; }
  .hero-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .hero-stat { background: rgba(255,255,255,0.15); border-radius: 12px; padding: 20px 32px; text-align: center; }
  .hero-stat-val { font-family: var(--font-display); font-size: 32px; font-weight: 800; }
  .hero-stat-label { font-size: 13px; opacity: 0.8; }
  .compat-table { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .compat-cell { background: var(--red-light); color: var(--red); border-radius: 8px; padding: 8px; text-align: center; font-weight: 700; font-size: 14px; }

  @media (max-width: 768px) {
    .auth-left { display: none; }
    .auth-right { width: 100%; }
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .main-content { margin-left: 0; }
    .topbar { padding: 14px 16px; }
    .page-content { padding: 16px; }
    .mobile-menu-btn { display: flex; }
    .form-row { grid-template-columns: 1fr; }
    .hero-title { font-size: 36px; }
    .project-cards { flex-direction: column; align-items: center; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const color = type === "error" ? "var(--red)" : type === "warn" ? "var(--orange)" : "var(--green)";
  return <div className="toast" style={{ borderLeftColor: color }}><Icon name="check" size={16} style={{ color }} />{message}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}><Icon name="close" size={20} /></button>
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  );
}

// ─── Auth ──────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login");

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <span className="drop">🩸</span>
            Blood donation
          </div>
          <p className="auth-tagline">
            Plateforme de don de sang — Connectez les donneurs aux établissements hospitaliers en temps réel.
          </p>
          <div className="auth-stats">
            <div className="auth-stat">
              <div className="auth-stat-val">500+</div>
              <div className="auth-stat-label">Donneurs</div>
            </div>
            <div className="auth-stat">
              <div className="auth-stat-val">50+</div>
              <div className="auth-stat-label">Hôpitaux</div>
            </div>
            <div className="auth-stat">
              <div className="auth-stat-val">2000+</div>
              <div className="auth-stat-label">Dons</div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>
              <Icon name="lock" size={14} /> Connexion
            </button>
            <button className={`auth-tab ${tab === "donneur" ? "active" : ""}`} onClick={() => setTab("donneur")}>
              🫀 Donneur
            </button>
            <button className={`auth-tab ${tab === "hopital" ? "active" : ""}`} onClick={() => setTab("hopital")}>
              🏥 Hôpital
            </button>
          </div>

          {tab === "login" && <LoginForm onLogin={onLogin} />}
          {tab === "donneur" && <RegisterDonneurForm onSuccess={() => setTab("login")} />}
          {tab === "hopital" && <RegisterHopitalForm onSuccess={() => setTab("login")} />}
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.password) { setError("Remplissez tous les champs."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BLOOD_API}/auth/login/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        onLogin(data.user);
      } else setError(data.error || "Identifiants incorrects.");
    } catch { setError("Impossible de joindre le serveur."); }
    setLoading(false);
  };

  return (
    <>
      <div className="auth-title">Bon retour 👋</div>
      <div className="auth-subtitle">Connectez-vous à votre espace Blood donation</div>
      {error && <div className="error-msg"><Icon name="alert" size={14} />{error}</div>}
      <div className="form-group">
        <label className="form-label">Nom d'utilisateur</label>
        <div className="input-wrap">
          <span className="input-icon"><Icon name="user" size={16} /></span>
          <input className="form-input" placeholder="username" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Mot de passe</label>
        <div className="input-wrap">
          <span className="input-icon"><Icon name="lock" size={16} /></span>
          <input className="form-input" type={showPass ? "text" : "password"} placeholder="••••••••"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          <button className="input-icon-right" onClick={() => setShowPass(!showPass)}>
            <Icon name={showPass ? "eyeOff" : "eye"} size={16} />
          </button>
        </div>
      </div>
      <button className="btn-red" onClick={handleSubmit} disabled={loading}>
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </>
  );
}

function RegisterDonneurForm({ onSuccess }) {
  const [form, setForm] = useState({ username: "", first_name: "", last_name: "", email: "", password1: "", password2: "", groupe_sanguin: "O+", sexe: "H", date_naissance: "", ville: "", telephone: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.password1 || !form.date_naissance) { setError("Remplissez tous les champs obligatoires."); return; }
    if (form.password1 !== form.password2) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BLOOD_API}/auth/register/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "donneur" })
      });
      const data = await res.json();
      if (res.ok) { setSuccess(true); setTimeout(onSuccess, 2000); }
      else setError(data.error || "Erreur lors de l'inscription.");
    } catch { setError("Impossible de joindre le serveur."); }
    setLoading(false);
  };

  if (success) return <div className="success-msg"><Icon name="check" size={14} /> Compte créé ! Vous pouvez maintenant vous connecter.</div>;

  return (
    <>
      <div className="auth-title">Devenir Donneur 🫀</div>
      <div className="auth-subtitle">Rejoignez la communauté Blood donation</div>
      {error && <div className="error-msg"><Icon name="alert" size={14} />{error}</div>}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Prénom *</label>
          <input className="form-input no-icon" placeholder="Yassine" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Nom *</label>
          <input className="form-input no-icon" placeholder="Ben Ali" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Username *</label>
          <input className="form-input no-icon" placeholder="yassine123" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input no-icon" type="email" placeholder="email@..." value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Groupe sanguin *</label>
          <select className="form-select" value={form.groupe_sanguin} onChange={e => setForm({ ...form, groupe_sanguin: e.target.value })}>
            {GROUPES_SANGUINS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Sexe *</label>
          <select className="form-select" value={form.sexe} onChange={e => setForm({ ...form, sexe: e.target.value })}>
            <option value="H">Homme</option>
            <option value="F">Femme</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Date de naissance *</label>
          <input className="form-input no-icon" type="date" value={form.date_naissance} onChange={e => setForm({ ...form, date_naissance: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Ville *</label>
          <input className="form-input no-icon" placeholder="Sfax" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Mot de passe *</label>
          <input className="form-input no-icon" type="password" placeholder="••••••••" value={form.password1} onChange={e => setForm({ ...form, password1: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Confirmer *</label>
          <input className="form-input no-icon" type="password" placeholder="••••••••" value={form.password2} onChange={e => setForm({ ...form, password2: e.target.value })} />
        </div>
      </div>
      <button className="btn-red" onClick={handleSubmit} disabled={loading}>{loading ? "Création..." : "Créer mon compte"}</button>
    </>
  );
}

// eslint-disable-next-line no-empty-pattern
function RegisterHopitalForm({ }) {
  const [form, setForm] = useState({ username: "", email: "", password1: "", password2: "", nom: "", adresse: "", ville: "", agrement: "", telephone: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.nom || !form.agrement || !form.password1) { setError("Remplissez tous les champs obligatoires."); return; }
    if (form.password1 !== form.password2) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BLOOD_API}/auth/register/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "hopital" })
      });
      const data = await res.json();
      if (res.ok) { setSuccess(true); }
      else setError(data.error || "Erreur lors de l'inscription.");
    } catch { setError("Impossible de joindre le serveur."); }
    setLoading(false);
  };

  if (success) return <div className="warn-msg"><Icon name="clock" size={14} /> Compte créé. En attente de validation par l'administrateur.</div>;

  return (
    <>
      <div className="auth-title">Inscrire mon Hôpital 🏥</div>
      <div className="auth-subtitle">Compte soumis à validation administrative</div>
      {error && <div className="error-msg"><Icon name="alert" size={14} />{error}</div>}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Username *</label>
          <input className="form-input no-icon" placeholder="hopital_sfax" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input no-icon" type="email" placeholder="contact@..." value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Nom de l'établissement *</label>
        <input className="form-input no-icon" placeholder="Hôpital Universitaire de Sfax" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Numéro d'agrément *</label>
          <input className="form-input no-icon" placeholder="AGR-2024-001" value={form.agrement} onChange={e => setForm({ ...form, agrement: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Ville *</label>
          <input className="form-input no-icon" placeholder="Sfax" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Adresse</label>
        <input className="form-input no-icon" placeholder="Rue..." value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Mot de passe *</label>
          <input className="form-input no-icon" type="password" placeholder="••••••••" value={form.password1} onChange={e => setForm({ ...form, password1: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Confirmer *</label>
          <input className="form-input no-icon" type="password" placeholder="••••••••" value={form.password2} onChange={e => setForm({ ...form, password2: e.target.value })} />
        </div>
      </div>
      <button className="btn-red" onClick={handleSubmit} disabled={loading}>{loading ? "Envoi..." : "Soumettre ma demande"}</button>
    </>
  );
}

// ─── Dashboards ────────────────────────────────────────────────────────────

function DashboardDonneur({ user, onToast }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState("accueil");
  const [showModal, setShowModal] = useState(null);

  const token = () => localStorage.getItem("access_token");
 
  const headers = useCallback(() => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }));

  useEffect(() => {
    fetch(`${BLOOD_API}/dashboard/donneur/`, { headers: headers() })
      .then(r => r.json()).then(setData).catch(() => {});
  }, [ page]);

  if (!data) return <div style={{ padding: 40, textAlign: "center", color: "var(--text3)" }}>Chargement...</div>;

  const navItems = [
    { id: "accueil", label: "Mon tableau de bord", icon: "heart" },
    { id: "demandes", label: "Appels urgents", icon: "alert" },
    { id: "dons", label: "Mes dons", icon: "drop" },
    { id: "campagnes", label: "Campagnes", icon: "calendar" },
    { id: "profil", label: "Mon profil", icon: "user" },
  ];

  return (
    <div className="app-layout">
      <Sidebar navItems={navItems} page={page} setPage={setPage} user={user} role="Donneur 🫀" color="red" />
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">{navItems.find(n => n.id === page)?.label}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={`badge ${data.eligible ? "badge-green" : "badge-orange"}`}>
              {data.eligible ? "✅ Éligible au don" : "⏳ Délai en cours"}
            </span>
            <span className="badge badge-red" style={{ fontSize: 13, fontWeight: 700 }}>{data.groupe_sanguin}</span>
          </div>
        </div>

        <div className="page-content">
          {page === "accueil" && <DonneurAccueil data={data} onToast={onToast} setPage={setPage} showModal={showModal} setShowModal={setShowModal} headers={headers} />}
          {page === "demandes" && <DonneurDemandes data={data} onToast={onToast} headers={headers} />}
          {page === "dons" && <DonneurDons data={data} onToast={onToast} headers={headers} reloadData={() => fetch(`${BLOOD_API}/dashboard/donneur/`, { headers: headers() }).then(r => r.json()).then(setData)} />}
          {page === "campagnes" && <DonneurCampagnes data={data} onToast={onToast} headers={headers} />}
          {page === "profil" && <DonneurProfil user={user} data={data} onToast={onToast} headers={headers} />}
        </div>
      </main>
    </div>
  );
}

function DonneurAccueil({ data, setPage }) {
  const jours = data.eligible ? 0 : Math.max(0, Math.ceil((new Date(data.prochaine_date) - new Date()) / 86400000));

  return (
    <>
      {/* Carte éligibilité */}
      <div className={`eligibilite-card ${data.eligible ? "ok" : ""}`} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Statut d'éligibilité</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>
              {data.eligible ? "✅ Vous pouvez donner !" : `⏳ Encore ${jours} jours`}
            </div>
            {!data.eligible && (
              <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                Prochaine date : {new Date(data.prochaine_date).toLocaleDateString("fr-FR")}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)" }}>{data.groupe_sanguin}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Groupe sanguin</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: "Total dons", value: data.nb_dons, color: "#c0392b", icon: "drop" },
          { label: "Appels compatibles", value: data.nb_demandes_compatibles, color: "#e67e22", icon: "alert" },
          { label: "Campagnes à venir", value: data.nb_campagnes, color: "#2980b9", icon: "calendar" },
          { label: "Réponses données", value: data.nb_reponses, color: "#27ae60", icon: "check" },
        ].map((s, i) => (
          <div key={s.label} className="stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="stat-icon" style={{ background: `${s.color}18` }}>
              <Icon name={s.icon} size={22} style={{ color: s.color }} />
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Demandes urgentes compatibles */}
      {data.demandes_recentes?.length > 0 && (
        <>
          <div className="section-header">
            <div className="section-title">🚨 Appels urgents compatibles</div>
            <button className="btn-outline" onClick={() => setPage("demandes")}>Voir tout</button>
          </div>
          <div className="content-grid">
            {data.demandes_recentes.map((d, i) => (
              <DemandeCard key={d.id} demande={d} index={i} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function DemandeCard({ demande, index, onRepondre }) {
  const urgente = demande.est_urgente;
  return (
    <div className={`demande-card ${urgente ? "urgente" : ""}`} style={{ animationDelay: `${index * 0.06}s` }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
        <div className="blood-badge">{demande.groupe_sanguin}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <strong style={{ fontSize: 15 }}>{demande.hopital_nom}</strong>
            {urgente && <span className="badge badge-red urgente-pulse">🔴 Urgent</span>}
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)", display: "flex", gap: 12 }}>
            <span><Icon name="location" size={12} /> {demande.hopital_ville}</span>
            <span><Icon name="drop" size={12} /> {demande.quantite} poches</span>
          </div>
        </div>
      </div>
      {demande.description && <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12, lineHeight: 1.5 }}>{demande.description}</p>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>
          <Icon name="clock" size={12} /> Délai : {new Date(demande.delai).toLocaleDateString("fr-FR")}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>{demande.nb_reponses} réponses</span>
          {onRepondre && (
            <button className="btn-sm btn-sm-red" onClick={() => onRepondre(demande.id)}>
              Répondre
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DonneurDemandes({ onToast, headers }) {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`${BLOOD_API}/demandes-urgentes/?compatible=true`, { headers: headers() })
      .then(r => r.json())
      .then(d => { setDemandes(Array.isArray(d) ? d : (d.results || [])); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const repondre = async (demandeId) => {
    try {
      const res = await fetch(`${BLOOD_API}/reponses/`, {
        method: "POST", headers: headers(),
        body: JSON.stringify({ demande: demandeId })
      });
      if (res.ok) { onToast("✅ Votre réponse a été enregistrée !"); }
      else { const d = await res.json(); onToast(d.error || "Erreur.", "error"); }
    } catch { onToast("Erreur réseau.", "error"); }
  };

  return (
    <>
      <div className="section-header">
        <div className="section-title">🚨 Appels urgents compatibles avec votre groupe</div>
      </div>
      {loading ? <div style={{ color: "var(--text3)", textAlign: "center", padding: 40 }}>Chargement...</div> : (
        <div className="content-grid">
          {demandes.length === 0 ? (
            <div style={{ color: "var(--text3)", padding: 40, textAlign: "center", gridColumn: "1/-1" }}>Aucun appel urgent compatible pour le moment.</div>
          ) : demandes.map((d, i) => <DemandeCard key={d.id} demande={d} index={i} onRepondre={repondre} />)}
        </div>
      )}
    </>
  );
}

function DonneurDons({ onToast, headers, reloadData }) {
  const [dons, setDons] = useState([]);
  const [hopitaux, setHopitaux] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    date_don: new Date().toISOString().split("T")[0],
    hopital: "",
    nb_dons: "",   // ⚡ ajouté
    notes: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${BLOOD_API}/mes-dons/`, { headers: headers() }).then(r => r.json()),
      fetch(`${BLOOD_API}/hopitaux/`, { headers: headers() }).then(r => r.json()),
    ]).then(([d, h]) => {
      setDons(Array.isArray(d) ? d : (d.results || []));
      setHopitaux(Array.isArray(h) ? h : (h.results || []));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.date_don || !form.hopital ) {
      onToast("Remplissez tous les champs.", "error");
      return;
    }
    try {
      const res = await fetch(`${BLOOD_API}/mes-dons/`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(form)   
      });
      if (res.ok) {
        const d = await res.json();
        setDons([d, ...dons]);
        setShowModal(false);
        setForm({
          date_don: new Date().toISOString().split("T")[0],
          hopital: "",
          nb_dons: "",   // ⚡ reset
          notes: ""
        });
        onToast("✅ Don enregistré avec succès !");
        reloadData();
      } else {
        onToast("Erreur lors de l'enregistrement.", "error");
      }
    } catch {
      onToast("Erreur réseau.", "error");
    }
  };


  return (
    <>
      <div className="section-header">
        <div className="section-title">🩸 Historique de mes dons</div>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={14} /> Enregistrer un don
        </button>
      </div>

      <div className="table-card">
        {loading ? <div style={{ padding: 40, textAlign: "center", color: "var(--text3)" }}>Chargement...</div> : (
          <table>
            <thead><tr><th>Date</th><th>Établissement</th><th>Notes</th><th>Statut</th></tr></thead>
            <tbody>
              {dons.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: 40, color: "var(--text3)" }}>Aucun don enregistré</td></tr>
              ) : dons.map(d => (
                <tr key={d.id}>
                  <td><strong>{new Date(d.date_don).toLocaleDateString("fr-FR")}</strong></td>
                  <td>{d.hopital_nom || "—"}</td>
                  <td style={{ color: "var(--text2)", fontSize: 13 }}>{d.notes || "—"}</td>
                  <td><span className={`badge ${d.valide ? "badge-green" : "badge-gray"}`}>{d.valide ? "Validé" : "En attente"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title="Enregistrer un don" onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label className="form-label">Date du don *</label>
            <input className="form-input no-icon" type="date" value={form.date_don} onChange={e => setForm({ ...form, date_don: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Établissement *</label>
            <select className="form-select" value={form.hopital} onChange={e => setForm({ ...form, hopital: e.target.value })}>
              <option value="">-- Choisir un hôpital --</option>
              {hopitaux.map(h => <option key={h.id} value={h.id}>{h.nom}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <input className="form-input no-icon" placeholder="Remarques éventuelles..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
            <button className="btn-submit" onClick={handleAdd}>Enregistrer</button>
          </div>
        </Modal>
      )}
    </>
  );

}
function DonneurCampagnes({ onToast, headers }) {
  const [campagnes, setCampagnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [creneau, setCreneau] = useState("09:00");

  useEffect(() => {
    fetch(`${BLOOD_API}/campagnes/`, { headers: headers() })
      .then(r => r.json())
      .then(d => { setCampagnes(Array.isArray(d) ? d : (d.results || [])); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const sinscrire = async (campagneId) => {
    try {
      const res = await fetch(`${BLOOD_API}/inscriptions-campagne/`, {
        method: "POST", headers: headers(),
        body: JSON.stringify({ campagne: campagneId, creneau_horaire: creneau })
      });
      if (res.ok) { onToast("✅ Inscription confirmée !"); setShowModal(null); }
      else { const d = await res.json(); onToast(d.error || "Erreur.", "error"); }
    } catch { onToast("Erreur réseau.", "error"); }
  };

  return (
    <>
      <div className="section-header">
        <div className="section-title">📅 Campagnes de collecte</div>
      </div>
      {loading ? <div style={{ color: "var(--text3)", textAlign: "center", padding: 40 }}>Chargement...</div> : (
        <div className="content-grid">
          {campagnes.length === 0 ? (
            <div style={{ color: "var(--text3)", padding: 40, textAlign: "center", gridColumn: "1/-1" }}>Aucune campagne disponible.</div>
          ) : campagnes.map((c, i) => (
            <div key={c.id} className="demande-card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <strong style={{ fontSize: 15 }}>{c.nom}</strong>
                <span className={`badge ${c.est_complete ? "badge-gray" : "badge-green"}`}>
                  {c.est_complete ? "Complet" : `${c.places_restantes} places`}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text2)", display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                <span><Icon name="calendar" size={12} /> {new Date(c.date).toLocaleDateString("fr-FR")}</span>
                <span><Icon name="location" size={12} /> {c.lieu}</span>
                <span><Icon name="drop" size={12} /> Groupes : {c.groupes_cibles}</span>
              </div>
              {!c.est_complete && (
                <button className="btn-add" style={{ width: "100%", justifyContent: "center" }} onClick={() => setShowModal(c.id)}>
                  S'inscrire
                </button>
              )}
              {showModal === c.id && (
                <Modal title={`S'inscrire à : ${c.nom}`} onClose={() => setShowModal(null)}>
                  <div className="form-group">
                    <label className="form-label">Créneau horaire</label>
                    <input className="form-input no-icon" type="time" value={creneau} onChange={e => setCreneau(e.target.value)} />
                  </div>
                  <div className="form-actions">
                    <button className="btn-secondary" onClick={() => setShowModal(null)}>Annuler</button>
                    <button className="btn-submit" onClick={() => sinscrire(c.id)}>Confirmer l'inscription</button>
                  </div>
                </Modal>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function DonneurProfil({ user, data, onToast, headers }) {
  const [form, setForm] = useState({
    first_name: user.first_name || "", last_name: user.last_name || "",
    email: user.email || "", ville: data.ville || "", telephone: data.telephone || "", actif: data.actif
  });

  const handleSave = async () => {
    try {
      const res = await fetch(`${BLOOD_API}/profil/`, {
        method: "PATCH", headers: headers(),
        body: JSON.stringify(form)
      });
      if (res.ok) onToast("✅ Profil mis à jour !");
      else onToast("Erreur lors de la mise à jour.", "error");
    } catch { onToast("Erreur réseau.", "error"); }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="card">
        <div className="card-title"><Icon name="user" size={16} /> Mon profil</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Prénom</label>
            <input className="form-input no-icon" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Nom</label>
            <input className="form-input no-icon" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input no-icon" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Ville</label>
            <input className="form-input no-icon" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Téléphone</label>
            <input className="form-input no-icon" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
          </div>
        </div>
        <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" id="actif" checked={form.actif} onChange={e => setForm({ ...form, actif: e.target.checked })} style={{ width: 18, height: 18, accentColor: "var(--red)" }} />
          <label htmlFor="actif" style={{ fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Compte actif (disponible pour donner)</label>
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ padding: "10px 14px", background: "var(--surface2)", borderRadius: 10, fontSize: 13, color: "var(--text2)" }}>
            <strong>Groupe sanguin :</strong> {data.groupe_sanguin} &nbsp;|&nbsp;
            <strong>Sexe :</strong> {data.sexe === "H" ? "Homme" : "Femme"} &nbsp;|&nbsp;
            <strong>Délai entre dons :</strong> {data.sexe === "H" ? "56" : "84"} jours
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-submit" onClick={handleSave}>Enregistrer les modifications</button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Hôpital ─────────────────────────────────────────────────────

function DashboardHopital({ user, onToast }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState("accueil");

  const token = () => localStorage.getItem("access_token");
  const headers = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

  const reload = () => fetch(`${BLOOD_API}/dashboard/hopital/`, { headers: headers() }).then(r => r.json()).then(setData).catch(() => {});

  useEffect(() => { reload(); }, [page]);

  if (!data) return <div style={{ padding: 40, textAlign: "center", color: "var(--text3)" }}>Chargement...</div>;

  if (!data.valide) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div className="card" style={{ maxWidth: 480, textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 12 }}>Compte en attente de validation</h2>
        <p style={{ color: "var(--text2)", lineHeight: 1.6 }}>Votre établissement <strong>{data.nom}</strong> est en cours de validation par l'administrateur. Vous recevrez une notification dès l'approbation.</p>
        <div style={{ marginTop: 24, padding: "12px 20px", background: "var(--orange-light)", borderRadius: 10, color: "var(--orange)", fontSize: 13 }}>
          Numéro d'agrément : <strong>{data.agrement}</strong>
        </div>
      </div>
    </div>
  );

  const navItems = [
    { id: "accueil", label: "Tableau de bord", icon: "chart" },
    { id: "demandes", label: "Mes demandes urgentes", icon: "alert" },
    { id: "campagnes", label: "Mes campagnes", icon: "calendar" },
    { id: "profil", label: "Profil établissement", icon: "hospital" },
  ];

  return (
    <div className="app-layout">
      <Sidebar navItems={navItems} page={page} setPage={setPage} user={user} role="Hôpital 🏥" color="blue" />
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">{navItems.find(n => n.id === page)?.label}</div>
          <span className="badge badge-green">✅ Établissement validé</span>
        </div>
        <div className="page-content">
          {page === "accueil" && <HopitalAccueil data={data} setPage={setPage} />}
          {page === "demandes" && <HopitalDemandes data={data} onToast={onToast} headers={headers} reload={reload} />}
          {page === "campagnes" && <HopitalCampagnes data={data} onToast={onToast} headers={headers} reload={reload} />}
          {page === "profil" && <HopitalProfil data={data} onToast={onToast} headers={headers} />}
        </div>
      </main>
    </div>
  );
}

function HopitalAccueil({ data, setPage }) {
  return (
    <>
      <div className="stats-grid">
        {[
          { label: "Demandes actives", value: data.nb_demandes_actives, color: "#c0392b", icon: "alert" },
          { label: "Dons reçus", value: data.nb_dons_recus, color: "#27ae60", icon: "drop" },
          { label: "Campagnes", value: data.nb_campagnes, color: "#2980b9", icon: "calendar" },
          { label: "Réponses reçues", value: data.nb_reponses, color: "#e67e22", icon: "users" },
        ].map((s, i) => (
          <div key={s.label} className="stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="stat-icon" style={{ background: `${s.color}18` }}>
              <Icon name={s.icon} size={22} style={{ color: s.color }} />
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      {data.demandes_actives?.length > 0 && (
        <>
          <div className="section-header">
            <div className="section-title">🚨 Mes demandes urgentes actives</div>
            <button className="btn-outline" onClick={() => setPage("demandes")}>Gérer</button>
          </div>
          <div className="content-grid">
            {data.demandes_actives.map((d, i) => <DemandeCard key={d.id} demande={d} index={i} />)}
          </div>
        </>
      )}
    </>
  );
}

function HopitalDemandes({ onToast, headers, reload }) {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ groupe_sanguin: "O+", quantite: "", delai: "", description: "" });

  const fetchDemandes = () => {
    fetch(`${BLOOD_API}/demandes-urgentes/mes-demandes/`, { headers: headers() })
      .then(r => r.json()).then(d => { setDemandes(Array.isArray(d) ? d : (d.results || [])); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchDemandes(); }, []);

  const handleAdd = async () => {
    if (!form.quantite || !form.delai) { onToast("Remplissez tous les champs.", "error"); return; }
    try {
      const res = await fetch(`${BLOOD_API}/demandes-urgentes/creer/`, {
        method: "POST", headers: headers(),
        body: JSON.stringify(form)
      });
      if (res.ok) { fetchDemandes(); reload(); setShowModal(false); setForm({ groupe_sanguin: "O+", quantite: "", delai: "", description: "" }); onToast("✅ Demande publiée !"); }
      else onToast("Erreur lors de la publication.", "error");
    } catch { onToast("Erreur réseau.", "error"); }
  };

  const cloturerDemande = async (id) => {
    try {
      await fetch(`${BLOOD_API}/demandes-urgentes/${id}/cloturer/`, { method: "POST", headers: headers() });
      fetchDemandes(); onToast("Demande clôturée.");
    } catch { onToast("Erreur.", "error"); }
  };

  return (
    <>
      <div className="section-header">
        <div className="section-title">🚨 Mes demandes urgentes</div>
        <button className="btn-add" onClick={() => setShowModal(true)}><Icon name="plus" size={14} /> Nouvelle demande</button>
      </div>
      {loading ? <div style={{ color: "var(--text3)", padding: 40, textAlign: "center" }}>Chargement...</div> : (
        <div className="content-grid">
          {demandes.length === 0 ? (
            <div style={{ color: "var(--text3)", padding: 40, gridColumn: "1/-1", textAlign: "center" }}>Aucune demande publiée.</div>
          ) : demandes.map((d, i) => (
            <div key={d.id} className={`demande-card ${d.est_urgente ? "urgente" : ""}`} style={{ animationDelay: `${i * 0.06}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="blood-badge">{d.groupe_sanguin}</div>
                  <div>
                    <strong>{d.quantite} poches</strong>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>Délai : {new Date(d.delai).toLocaleDateString("fr-FR")}</div>
                  </div>
                </div>
                <span className={`badge ${d.statut === "active" ? "badge-red" : "badge-gray"}`}>{d.statut}</span>
              </div>
              {d.description && <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 10 }}>{d.description}</p>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--text3)" }}>{d.nb_reponses} réponses</span>
                {d.statut === "active" && (
                  <button className="btn-sm btn-sm-red" onClick={() => cloturerDemande(d.id)}>Clôturer</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Nouvelle demande urgente" onClose={() => setShowModal(false)}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Groupe sanguin *</label>
              <select className="form-select" value={form.groupe_sanguin} onChange={e => setForm({ ...form, groupe_sanguin: e.target.value })}>
                {GROUPES_SANGUINS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantité (poches) *</label>
              <input className="form-input no-icon" type="number" min="1" placeholder="5" value={form.quantite} onChange={e => setForm({ ...form, quantite: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Date limite *</label>
            <input className="form-input no-icon" type="date" value={form.delai} onChange={e => setForm({ ...form, delai: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input no-icon" placeholder="Contexte de la demande..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
            <button className="btn-submit" onClick={handleAdd}>Publier la demande</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function HopitalCampagnes({ onToast, headers, reload }) {
  const [campagnes, setCampagnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nom: "", date: "", lieu: "", groupes_cibles: "", capacite_totale: "", description: "" });

  const fetchCampagnes = () => {
    fetch(`${BLOOD_API}/campagnes/mes-campagnes/`, { headers: headers() })
      .then(r => r.json()).then(d => { setCampagnes(Array.isArray(d) ? d : (d.results || [])); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCampagnes(); }, []);

  const handleAdd = async () => {
    if (!form.nom || !form.date || !form.capacite_totale) { onToast("Remplissez les champs obligatoires.", "error"); return; }
    try {
      const res = await fetch(`${BLOOD_API}/campagnes/`, { method: "POST", headers: headers(), body: JSON.stringify(form) });
      if (res.ok) { fetchCampagnes(); reload(); setShowModal(false); setForm({ nom: "", date: "", lieu: "", groupes_cibles: "", capacite_totale: "", description: "" }); onToast("✅ Campagne créée !"); }
      else onToast("Erreur lors de la création.", "error");
    } catch { onToast("Erreur réseau.", "error"); }
  };

  return (
    <>
      <div className="section-header">
        <div className="section-title">📅 Mes campagnes de collecte</div>
        <button className="btn-add" onClick={() => setShowModal(true)}><Icon name="plus" size={14} /> Nouvelle campagne</button>
      </div>
      {loading ? <div style={{ color: "var(--text3)", padding: 40, textAlign: "center" }}>Chargement...</div> : (
        <div className="content-grid">
          {campagnes.length === 0 ? <div style={{ color: "var(--text3)", padding: 40, gridColumn: "1/-1", textAlign: "center" }}>Aucune campagne créée.</div>
            : campagnes.map((c, i) => (
              <div key={c.id} className="demande-card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <strong style={{ fontSize: 15 }}>{c.nom}</strong>
                  <span className={`badge ${c.est_complete ? "badge-gray" : "badge-blue"}`}>{c.est_complete ? "Complet" : `${c.places_restantes} places`}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text2)", display: "flex", flexDirection: "column", gap: 4 }}>
                  <span><Icon name="calendar" size={12} /> {new Date(c.date).toLocaleDateString("fr-FR")}</span>
                  <span><Icon name="location" size={12} /> {c.lieu}</span>
                  <span><Icon name="users" size={12} /> {c.nb_inscrits} / {c.capacite_totale} inscrits</span>
                  <span><Icon name="drop" size={12} /> {c.groupes_cibles}</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {showModal && (
        <Modal title="Nouvelle campagne" onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label className="form-label">Nom de la campagne *</label>
            <input className="form-input no-icon" placeholder="Journée du don de sang" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input className="form-input no-icon" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Capacité totale *</label>
              <input className="form-input no-icon" type="number" min="1" placeholder="50" value={form.capacite_totale} onChange={e => setForm({ ...form, capacite_totale: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Lieu</label>
            <input className="form-input no-icon" placeholder="Salle des fêtes, Sfax" value={form.lieu} onChange={e => setForm({ ...form, lieu: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Groupes sanguins ciblés</label>
            <input className="form-input no-icon" placeholder="O+, A-, B+" value={form.groupes_cibles} onChange={e => setForm({ ...form, groupes_cibles: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input no-icon" placeholder="Informations supplémentaires..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
            <button className="btn-submit" onClick={handleAdd}>Créer la campagne</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function HopitalProfil({ data, onToast, headers }) {
  const [form, setForm] = useState({ nom: data.nom || "", adresse: data.adresse || "", ville: data.ville || "", telephone: data.telephone || "", email: data.email || "" });
  const handleSave = async () => {
    try {
      const res = await fetch(`${BLOOD_API}/profil/`, { method: "PATCH", headers: headers(), body: JSON.stringify(form) });
      if (res.ok) onToast("✅ Profil mis à jour !");
      else onToast("Erreur.", "error");
    } catch { onToast("Erreur réseau.", "error"); }
  };
  return (
    <div style={{ maxWidth: 600 }}>
      <div className="card">
        <div className="card-title"><Icon name="hospital" size={16} /> Profil de l'établissement</div>
        <div style={{ padding: "10px 14px", background: "var(--blue-light)", borderRadius: 10, fontSize: 13, color: "var(--blue)", marginBottom: 20 }}>
          Numéro d'agrément : <strong>{data.agrement}</strong>
        </div>
        <div className="form-group">
          <label className="form-label">Nom de l'établissement</label>
          <input className="form-input no-icon" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Ville</label>
            <input className="form-input no-icon" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Téléphone</label>
            <input className="form-input no-icon" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Adresse</label>
          <input className="form-input no-icon" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input no-icon" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-actions">
          <button className="btn-submit" onClick={handleSave}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Admin ───────────────────────────────────────────────────────

function DashboardAdmin({ user, onToast }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState("accueil");
  const token = () => localStorage.getItem("access_token");
  const headers = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });
  


  const reload = () => fetch(`${BLOOD_API}/dashboard/`, { headers: headers() }).then(r => r.json()).then(setData).catch(() => {});
  useEffect(() => { reload(); }, [page]);

  if (!data) return <div style={{ padding: 40, textAlign: "center", color: "var(--text3)" }}>Chargement...</div>;

  const navItems = [
    { id: "accueil", label: "Vue d'ensemble", icon: "chart" },
    { id: "hopitaux", label: "Hôpitaux", icon: "hospital" },
    { id: "donneurs", label: "Donneurs", icon: "users" },
    { id: "demandes", label: "Toutes les demandes", icon: "alert" },
  ];

  const validerHopital = async (id) => {
    try {
      await fetch(`${BLOOD_API}/admin-panel/valider-hopital/${id}/`, { method: "POST", headers: headers() });
      onToast("✅ Hôpital validé !"); reload();
    } catch { onToast("Erreur.", "error"); }
  };

  return (
    <div className="app-layout">
      <Sidebar navItems={navItems} page={page} setPage={setPage} user={user} role="Administrateur 🛡️" color="red" />
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">{navItems.find(n => n.id === page)?.label}</div>
          <span className="badge badge-red"><Icon name="shield" size={12} /> Admin</span>
        </div>
        <div className="page-content">
          {page === "accueil" && (
            <>
              <div className="stats-grid">
                {[
                  { label: "Donneurs", value: data.nb_donneurs, color: "#c0392b", icon: "users" },
                  { label: "Hôpitaux validés", value: data.nb_hopitaux, color: "#2980b9", icon: "hospital" },
                  { label: "Total dons", value: data.nb_dons, color: "#27ae60", icon: "drop" },
                  { label: "Demandes actives", value: data.nb_demandes, color: "#e67e22", icon: "alert" },
                ].map((s, i) => (
                  <div key={s.label} className="stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className="stat-icon" style={{ background: `${s.color}18` }}>
                      <Icon name={s.icon} size={22} style={{ color: s.color }} />
                    </div>
                    <div>
                      <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {data.hopitaux_attente?.length > 0 && (
                <>
                  <div className="section-header" style={{ marginTop: 8 }}>
                    <div className="section-title">⏳ Hôpitaux en attente de validation ({data.hopitaux_attente.length})</div>
                  </div>
                  <div className="table-card" style={{ marginBottom: 24 }}>
                    <table>
                      <thead><tr><th>Établissement</th><th>Agrément</th><th>Ville</th><th>Action</th></tr></thead>
                      <tbody>
                        {data.hopitaux_attente.map(h => (
                          <tr key={h.id}>
                            <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div className="avatar-sm" style={{ background: "linear-gradient(135deg, #2980b9, #3498db)" }}>{h.nom[0]}</div><strong>{h.nom}</strong></div></td>
                            <td><span className="badge badge-orange">{h.agrement}</span></td>
                            <td style={{ color: "var(--text2)" }}>{h.ville|| h.adresse}</td>
                            <td>
                              <button className="btn-sm btn-sm-green" onClick={() => validerHopital(h.id)}>✅ Valider</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {data.demandes_actives?.length > 0 && (
                <>
                  <div className="section-header">
                    <div className="section-title">🚨 Demandes urgentes actives</div>
                  </div>
                  <div className="content-grid">
                    {data.demandes_actives.slice(0, 4).map((d, i) => <DemandeCard key={d.id} demande={d} index={i} />)}
                  </div>
                </>
              )}
            </>
          )}

          {page === "hopitaux" && (
            <>
              <div className="section-header"><div className="section-title">🏥 Tous les hôpitaux</div></div>
              <div className="table-card">
                <table>
                  <thead><tr><th>Établissement</th><th>Ville</th><th>Agrément</th><th>Statut</th></tr></thead>
                  <tbody>
                    {data.tous_hopitaux?.map(h => (
                      <tr key={h.id}>
                        <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div className="avatar-sm" style={{ background: "linear-gradient(135deg,#2980b9,#3498db)" }}>{h.nom[0]}</div><strong>{h.nom}</strong></div></td>
                        <td style={{ color: "var(--text2)" }}>{h.ville|| h.adresse}</td>
                        <td><span className="badge badge-blue">{h.agrement}</span></td>
                        <td><span className={`badge ${h.valide ? "badge-green" : "badge-orange"}`}>{h.valide ? "Validé" : "En attente"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {page === "donneurs" && (
            <>
              <div className="section-header"><div className="section-title">🫀 Tous les donneurs</div></div>
              <div className="table-card">
                <table>
                  <thead><tr><th>Donneur</th><th>Groupe</th><th>Ville</th><th>Dons</th><th>Statut</th></tr></thead>
                  <tbody>
                    {data.tous_donneurs?.map(d => (
                      <tr key={d.id}>
                        <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div className="avatar-sm">{d.nom ||d.username[0]}</div><strong>{d.nom ||d.username}</strong></div></td>
                        <td><span className="badge badge-red" style={{ fontWeight: 800 }}>{d.groupe_sanguin}</span></td>
                        <td style={{ color: "var(--text2)" }}>{d.ville}</td>
                        <td><strong>{d.nb_dons}</strong></td>
                        <td><span className={`badge ${d.actif ? "badge-green" : "badge-gray"}`}>{d.actif ? "Actif" : "Inactif"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {page === "demandes" && (
            <>
              <div className="section-header"><div className="section-title">🚨 Toutes les demandes urgentes</div></div>
              <div className="content-grid">
                {data.toutes_demandes?.map((d, i) => <DemandeCard key={d.id} demande={d} index={i} />)}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Sidebar Component ─────────────────────────────────────────────────────

function Sidebar({ navItems, page, setPage, user, role, onBack }) {
  const { handleLogout } = useContext(AuthContext);
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🩸</div>
        <div className="sidebar-logo-text">Blood<span>Connect</span></div>
      </div>
      <nav className="sidebar-nav">
        {onBack && <button className="btn-back" onClick={onBack}>← Retour</button>}
        <div className="nav-label">Navigation</div>
        {navItems.map(item => (
          <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}>
            <Icon name={item.icon} size={18} />{item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="user-chip">
          <div className="user-avatar">{(user.username || "U")[0].toUpperCase()}</div>
          <div>
            <div className="user-name">{user.username}</div>
            <div className="user-role-badge">{role}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <Icon name="logout" size={14} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────

export default function BloodConnectApp({ onBack }) {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const handleLogin = (userData) => setUser(userData);
const handleLogout = () => {
  localStorage.removeItem("access_token");
  setUser(null);
  if (onBack) onBack();  // ← retour à MyShop
  };
  const showToast = (msg, type = "success") => setToast({ msg, type });

  return (
    <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
      <style>{globalCSS}</style>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {!user ? (
        <AuthPage onLogin={handleLogin} />
      ) : user.role === "donneur" ? (
        <DashboardDonneur user={user} onToast={showToast} />
      ) : user.role === "hopital" ? (
        <DashboardHopital user={user} onToast={showToast} />
      ) : (
        <DashboardAdmin user={user} onToast={showToast} />
      )}
    </AuthContext.Provider>
  );
}
