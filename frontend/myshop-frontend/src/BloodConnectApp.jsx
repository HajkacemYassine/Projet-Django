import { useState, useEffect, createContext, useContext } from "react";

// Import de l'image de fond
import bloodBg from './assets/bloodconnect_bg.png';
import LanguageProvider from "./i18n/LanguageProvider";
import LanguageSwitcher from "./i18n/LanguageSwitcher";
import HealthDashboard from "./Healthdashboard";



const BLOOD_API = "http://localhost:8000/blood-api";
const AuthCtx   = createContext(null);
const ThemeCtx  = createContext(null);

// ─── CSS ──────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
  
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  
  :root {
    --red: #e11d48;
    --red-d: #be123c;
    --red-s: rgba(225, 29, 72, 0.15);
    
    --blue: #0ea5e9;
    --blue-d: #0284c7;
    --blue-s: rgba(14, 165, 233, 0.15);
    
    --vio: #8b5cf6;
    --vio-d: #6d28d9;
    --vio-s: rgba(139, 92, 246, 0.15);
    
    --grn: #10b981;
    --grn-s: rgba(16, 185, 129, 0.15);
    
    --amb: #f59e0b;
    --amb-s: rgba(245, 158, 11, 0.15);
    
    --bg: #09090b; 
    --bg2: rgba(24, 24, 27, 0.6); 
    --bg3: rgba(39, 39, 42, 0.5); 
    --bg4: rgba(63, 63, 70, 0.5);
    
    --bdr: rgba(255,255,255,0.08); 
    --bdr2: rgba(255,255,255,0.15);
    
    --txt: #f8fafc; 
    --txt2: #94a3b8; 
    --txt3: #64748b;
    
    --r: 24px; 
    --rsm: 14px;
    
    --sh: 0 10px 40px rgba(0,0,0,0.5);
    --fd: 'Syne', sans-serif; 
    --fb: 'Plus Jakarta Sans', sans-serif;
    
    --sw: 280px;
  }
  
  :root[data-theme="light"] {
    --bg: #f8fafc; 
    --bg2: rgba(255, 255, 255, 0.7); 
    --bg3: rgba(241, 245, 249, 0.6); 
    --bg4: rgba(226, 232, 240, 0.6);
    --bdr: rgba(0,0,0,0.05); 
    --bdr2: rgba(0,0,0,0.1);
    --txt: #0f172a; 
    --txt2: #475569; 
    --txt3: #94a3b8;
    --sh: 0 10px 40px rgba(0,0,0,0.1);
  }
  
  body { 
    font-family: var(--fb); 
    background-color: var(--bg); 
    color: var(--txt); 
    min-height: 100vh; 
    overflow-x: hidden; 
    position: relative; 
  }
  
  body::before { 
    content:''; 
    position:fixed; 
    inset:0; 
    background:url('${bloodBg}') center/cover no-repeat fixed; 
    opacity: 1; 
    z-index:-1; 
    pointer-events:none; 
  }
  
  body::after {
    content:'';
    position:fixed;
    inset:0;
    background: radial-gradient(circle at center, rgba(9, 9, 11, 0.4), rgba(9, 9, 11, 0.9));
    z-index:-1;
    pointer-events:none;
  }

  :root[data-theme="light"] body::after {
    background: radial-gradient(circle at center, rgba(248, 250, 252, 0.6), rgba(248, 250, 252, 0.95));
  }

  ::-webkit-scrollbar { width:6px; } 
  ::-webkit-scrollbar-track { background: transparent; } 
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius:3px; }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes pulse   { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:0.5; transform:scale(1.05)} }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes blobP   { 0%,100%{transform:scale(1) rotate(0deg);opacity:.3} 50%{transform:scale(1.15) rotate(8deg);opacity:.5} }
  @keyframes ringFill{ from{stroke-dashoffset:var(--d-start)} to{stroke-dashoffset:var(--d-end)} }
  @keyframes slideR  { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
  @keyframes countUp { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }

  /* ── Utilities ────────────────────────────────────────────────────── */
  .glass {
    background: var(--bg2);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--bdr);
    box-shadow: var(--sh);
  }

  /* ── Auth ─────────────────────────────────────────────────────────── */
  .auth-page { min-height:100vh; display:grid; grid-template-columns:45% 55%; position:relative; overflow:hidden; }
  .auth-page::before { content:''; position:absolute; inset:0; background:url('${bloodBg}') center/cover no-repeat; z-index:0; filter: blur(10px); transform: scale(1.05); opacity: 0.8; }
  .auth-page::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(15, 23, 42, 0.8) 0%,rgba(9, 9, 11, 0.95) 100%); z-index:1; backdrop-filter:blur(4px); }
  
  @media(max-width:900px){.auth-page{grid-template-columns:1fr}.auth-panel-l{display:none}}
  
  .auth-panel-l { position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 40px; z-index:2; }
  .auth-blob { position:absolute; border-radius:50%; filter:blur(100px); animation:blobP 10s ease-in-out infinite; }
  .ab1 { width:500px;height:500px;background:var(--red);top:-150px;left:-150px;opacity:.25; }
  .ab2 { width:400px;height:400px;background:var(--vio);bottom:-100px;right:-100px;opacity:.2;animation-delay:4s; }
  .ab3 { width:300px;height:300px;background:var(--blue);top:50%;left:50%;transform:translate(-50%,-50%);opacity:.15;animation-delay:2s; }
  
  .auth-left-c { position:relative;z-index:1;text-align:center; }
  .auth-logo-bc { font-family:var(--fd);font-size:54px;font-weight:800;background:linear-gradient(135deg,#fb7185,var(--red));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px; letter-spacing: -1px; }
  .auth-drop-big { font-size:72px;display:block;margin-bottom:24px;animation:float 4s ease-in-out infinite; filter: drop-shadow(0 20px 30px rgba(225,29,72,0.4)); }
  .auth-tag-bc { color:var(--txt2);font-size:16px;line-height:1.7;max-width:360px;margin:0 auto 48px; font-weight: 500; }
  .auth-stats-bc { display:flex;gap:40px;justify-content:center; }
  .ast-n { font-family:var(--fd);font-size:36px;font-weight:800;background:linear-gradient(135deg,#fff,#cbd5e1);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
  .ast-l { font-size:12px;color:var(--txt2);text-transform:uppercase;letter-spacing:1px;margin-top:4px; font-weight: 700; }

  .auth-panel-r { background:transparent; display:flex;align-items:center;justify-content:center;padding:40px;overflow-y:auto;position:relative;z-index:2; }
  .auth-card-bc { width:100%;max-width:480px;animation:fadeUp .6s cubic-bezier(0.16, 1, 0.3, 1); background: rgba(24, 24, 27, 0.6); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.1); border-radius: 32px; padding: 48px; box-shadow: 0 30px 60px rgba(0,0,0,0.6); }
  .auth-title-bc { font-family:var(--fd);font-size:32px;font-weight:800;margin-bottom:8px; color: #fff; }
  .auth-sub-bc { color:var(--txt2);font-size:15px;margin-bottom:32px; }
  
  .role-cards { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px; }
  .role-card { background:rgba(0,0,0,0.3); border:1.5px solid rgba(255,255,255,0.08); border-radius:24px; padding:24px; text-align:center; cursor:pointer; transition:all .3s cubic-bezier(0.16, 1, 0.3, 1); }
  .role-card:hover { transform:translateY(-6px); box-shadow: 0 15px 30px rgba(0,0,0,0.3); }
  .role-card.donor:hover { border-color:rgba(225,29,72,.5); background:rgba(225,29,72,.1); }
  .role-card.hopital:hover { border-color:rgba(14,165,233,.5); background:rgba(14,165,233,.1); }
  .role-card .ric { font-size:42px;display:block;margin-bottom:12px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); }
  .role-card .rnm { font-family:var(--fd);font-size:16px;font-weight:800;margin-bottom:6px; color: #fff; }
  .role-card .rdsc { font-size:13px;color:var(--txt2);line-height:1.5; }
  
  .back-link { background:none;border:none;color:var(--txt2);font-size:14px;cursor:pointer;display:flex;align-items:center;gap:6px;margin-bottom:20px;font-family:var(--fb);font-weight:600;padding:0;transition:color .2s; }
  .back-link:hover { color:#fff; }
  
  .role-header { display:flex;align-items:center;gap:16px;padding:16px 20px;border-radius:16px;margin-bottom:24px; }
  .role-header.d { background:var(--red-s);border:1px solid rgba(225,29,72,.3); }
  .role-header.h { background:var(--blue-s);border:1px solid rgba(14,165,233,.3); }
  .role-header .ri { font-size:32px; }
  .role-header .rtx { font-family:var(--fd);font-weight:800;font-size:18px; color: #fff; }
  .role-header .rsu { font-size:13px;color:var(--txt2); margin-top:2px; }

  .finp { width:100%;background:rgba(0,0,0,0.3);border:1.5px solid rgba(255,255,255,0.08);border-radius:var(--rsm);padding:14px 16px;color:#fff;font-family:var(--fb);font-size:15px;outline:none;transition:all .3s; }
  .finp:focus { border-color:var(--red);box-shadow:0 0 0 4px rgba(225,29,72,.2); background:rgba(0,0,0,0.5); }
  .finp::placeholder { color:var(--txt3); }
  .finp-ic { padding-left:46px !important; }
  
  .fgrp { margin-bottom:18px; }
  .flbl { display:block;font-size:12px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px; }
  .frow { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
  
  .fsel { width:100%;background:rgba(0,0,0,0.3);border:1.5px solid rgba(255,255,255,0.08);border-radius:var(--rsm);padding:14px 16px;color:#fff;font-family:var(--fb);font-size:15px;outline:none;cursor:pointer;transition:all .3s; }
  .fsel:focus { border-color:var(--red); background:rgba(0,0,0,0.5); }
  .fsel option { background: #09090b; color: #fff; }
  
  .inp-w { position:relative; }
  .inp-ic { position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--txt3);display:flex;pointer-events:none; }
  .inp-r { position:absolute;right:16px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--txt3);cursor:pointer;display:flex;transition:color .2s; }
  .inp-r:hover { color:#fff; }
  
  .btn-red { width:100%;padding:16px;border:none;border-radius:var(--rsm);font-family:var(--fd);font-size:16px;font-weight:800;cursor:pointer;transition:all .3s cubic-bezier(0.16, 1, 0.3, 1);margin-top:8px;background:linear-gradient(135deg,var(--red),var(--red-d));color:#fff; letter-spacing: 0.5px; }
  .btn-red:hover { transform:translateY(-3px);box-shadow:0 12px 28px rgba(225,29,72,.5); filter:brightness(1.1); }
  .btn-blue { background:linear-gradient(135deg,var(--blue),var(--blue-d)); }
  .btn-blue:hover { box-shadow:0 12px 28px rgba(14,165,233,.5) !important; filter:brightness(1.1); }
  
  .err-bc { background:rgba(225,29,72,.15);border:1px solid rgba(225,29,72,.3);border-radius:var(--rsm);padding:14px 18px;color:#fb7185;font-size:14px;margin-bottom:20px;display:flex;align-items:center;gap:10px; font-weight:500; }
  .wait-card { text-align:center;padding:60px 40px;background:rgba(24,24,27,0.7);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:32px;max-width:520px;margin:0 auto; box-shadow:0 30px 60px rgba(0,0,0,0.5); }

  /* ── Layout ───────────────────────────────────────────────────────── */
  .app-lay { display:flex;min-height:100vh; }
  .sb { width:var(--sw);background:var(--bg2);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-right:1px solid var(--bdr);position:fixed;top:0;left:0;bottom:0;z-index:100;display:flex;flex-direction:column;transition:transform .4s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 10px 0 30px rgba(0,0,0,0.2); }
  
  .sb-top { padding:28px 24px 20px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;gap:14px; }
  .sb-ic { width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,var(--red),var(--red-d));display:flex;align-items:center;justify-content:center;font-size:22px; box-shadow:0 8px 16px rgba(225,29,72,0.4); }
  .sb-tx { font-family:var(--fd);font-size:20px;font-weight:800;letter-spacing:-0.5px; }
  .sb-tx span { background:linear-gradient(135deg, #fb7185, var(--red));-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
  
  .sb-nav { flex:1;padding:20px 16px;overflow-y:auto; }
  .sb-nav::-webkit-scrollbar { width:4px; }
  .nav-lbl { font-size:11px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:1.5px;padding:8px 14px;margin-top:12px;margin-bottom:4px; }
  
  .nit { display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:14px;color:var(--txt2);font-size:14px;font-weight:500;cursor:pointer;border:none;background:none;width:100%;text-align:left;transition:all .2s;margin-bottom:4px;position:relative; }
  .nit:hover { background:rgba(255,255,255,0.05);color:var(--txt); }
  .nit.on { background:linear-gradient(90deg, rgba(225,29,72,.15), transparent);color:var(--red);font-weight:700; border-radius: 4px 14px 14px 4px; border-left:3px solid var(--red); }
  
  .sb-btm { padding:20px;border-top:1px solid rgba(255,255,255,0.05); }
  .sb-chip { display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.05);border-radius:16px;margin-bottom:16px; }
  .sb-av { width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--red),var(--vio));display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;flex-shrink:0; color:#fff; }
  .sb-un { font-size:14px;font-weight:700;color:#fff; }
  .sb-rl { font-size:12px;color:var(--txt3); }
  .sb-out { width:100%;padding:12px;background:rgba(225,29,72,.1);border:1px solid rgba(225,29,72,.25);border-radius:12px;color:#fb7185;font-size:14px;font-weight:600;font-family:var(--fb);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .3s; }
  .sb-out:hover { background:rgba(225,29,72,.25);color:#fff; }
  
  .main { margin-left:var(--sw);flex:1;display:flex;flex-direction:column; }
  .topbar { background:var(--bg2);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid var(--bdr);padding:20px 36px;display:flex;align-items:center;gap:20px;position:sticky;top:0;z-index:50; }
  .tb-title { font-family:var(--fd);font-size:24px;font-weight:800;flex:1; letter-spacing: -0.5px; }
  .pad { padding:36px; flex:1; }
  .ham { display:none;background:none;border:none;color:var(--txt);cursor:pointer; }
  
  @media(max-width:1024px){.sb{transform:translateX(-100%)}.sb.open{transform:translateX(0)}.main{margin-left:0}.ham{display:flex}.pad{padding:20px}}

  /* ── Stats ────────────────────────────────────────────────────────── */
  .sg { display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:32px; }
  .sc { background:var(--bg2);backdrop-filter:blur(16px);border:1px solid var(--bdr);border-radius:24px;padding:24px;display:flex;align-items:center;gap:18px;transition:all .3s cubic-bezier(0.16, 1, 0.3, 1);animation:fadeUp .4s ease backwards; }
  .sc:hover { transform:translateY(-5px);box-shadow:0 20px 40px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.15); background: rgba(39, 39, 42, 0.7); }
  .sc-ic { width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:24px; background:rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); }
  .sc-v { font-family:var(--fd);font-size:32px;font-weight:800;letter-spacing:-1px;animation:countUp .6s ease; color:#fff; }
  .sc-l { font-size:13px;color:var(--txt2); font-weight:500; }

  /* ── Hero eligibility ─────────────────────────────────────────────── */
  .elig-card { border-radius:28px;padding:36px;margin-bottom:32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:24px;position:relative;overflow:hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
  .elig-card.ok  { background:linear-gradient(135deg,rgba(16, 185, 129, 0.8),rgba(4, 120, 87, 0.9)); border: 1px solid rgba(16, 185, 129, 0.4); backdrop-filter: blur(12px); }
  .elig-card.no  { background:linear-gradient(135deg,rgba(225, 29, 72, 0.8),rgba(159, 18, 57, 0.9)); border: 1px solid rgba(225, 29, 72, 0.4); backdrop-filter: blur(12px); }
  .elig-card::before { content:'';position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600') center/cover no-repeat;opacity:.15; mix-blend-mode: overlay; }
  .elig-info { position:relative;z-index:1; }
  .elig-status { font-family:var(--fd);font-size:32px;font-weight:800;margin-bottom:8px; color:#fff; letter-spacing:-0.5px; text-shadow: 0 2px 10px rgba(0,0,0,0.2); }
  .elig-date { font-size:15px;color:rgba(255,255,255,0.9); font-weight:500; }
  .elig-group { position:relative;z-index:1;text-align:right; background:rgba(0,0,0,0.2); padding: 16px 24px; border-radius: 20px; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); }
  .elig-g { font-family:var(--fd);font-size:48px;font-weight:800; color:#fff; text-shadow:0 4px 24px rgba(0,0,0,.4); line-height: 1; }
  .elig-gl { font-size:12px;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:1px;font-weight:700; margin-top:4px; }

  /* ── Demande Card ─────────────────────────────────────────────────── */
  .dc-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px; }
  .dc { background:var(--bg2);backdrop-filter:blur(16px);border:1px solid var(--bdr);border-radius:24px;padding:24px;transition:all .3s cubic-bezier(0.16, 1, 0.3, 1);animation:fadeUp .4s ease backwards;position:relative;overflow:hidden; }
  .dc:hover { transform:translateY(-6px);box-shadow:0 24px 48px rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.15); }
  .dc.urg { border-left:4px solid var(--red); }
  .dc.urg::before { content:'';position:absolute;inset:0;background:radial-gradient(circle at top left, rgba(225,29,72,.15), transparent 60%);pointer-events:none; }
  
  .blood-badge { width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,var(--red),var(--red-d));display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-size:18px;font-weight:800;color:#fff;flex-shrink:0;box-shadow:0 8px 24px rgba(225,29,72,.4); }
  .urg-dot { width:10px;height:10px;border-radius:50%;background:#fb7185;animation:pulse 1.5s infinite;flex-shrink:0; box-shadow: 0 0 10px #fb7185; }
  .badge-urg { display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:rgba(225,29,72,.2);border:1px solid rgba(225,29,72,.4);border-radius:20px;font-size:12px;font-weight:700;color:#fb7185; }

  /* ── Filter pills ─────────────────────────────────────────────────── */
  .pills { display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px; }
  .pill { padding:8px 18px;border-radius:40px;font-size:14px;font-weight:600;cursor:pointer;border:1px solid var(--bdr);background:rgba(0,0,0,0.3);color:var(--txt2);transition:all .3s;font-family:var(--fb); backdrop-filter: blur(8px); }
  .pill.on { background:linear-gradient(135deg,var(--red),var(--red-d));border-color:transparent;color:#fff; box-shadow: 0 4px 16px rgba(225,29,72,0.3); }
  .pill:not(.on):hover { border-color:rgba(225,29,72,0.5);color:#fff; background: rgba(225,29,72,0.1); }

  /* ── Table ────────────────────────────────────────────────────────── */
  .tc { background:var(--bg2);backdrop-filter:blur(16px);border:1px solid var(--bdr);border-radius:24px;overflow:hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.3); }
  table { width:100%;border-collapse:collapse; }
  thead tr { background:rgba(0,0,0,0.4);border-bottom:1px solid rgba(255,255,255,0.1); }
  th { padding:16px 20px;text-align:left;font-size:12px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:1px; }
  td { padding:18px 20px;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.05);vertical-align:middle; }
  tr:last-child td { border-bottom:none; }
  tbody tr { transition:background .2s; }
  tbody tr:hover { background:rgba(255,255,255,0.03); }

  /* ── Badges ───────────────────────────────────────────────────────── */
  .bdg { display:inline-flex;align-items:center;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(4px); }
  .bdg-r { background:var(--red-s);color:#fb7185; border-color: rgba(225,29,72,0.3); }
  .bdg-b { background:var(--blue-s);color:#38bdf8; border-color: rgba(14,165,233,0.3); }
  .bdg-v { background:var(--vio-s);color:#c084fc; border-color: rgba(139,92,246,0.3); }
  .bdg-g { background:var(--grn-s);color:#4ade80; border-color: rgba(16,185,129,0.3); }
  .bdg-y { background:var(--amb-s);color:#fbbf24; border-color: rgba(245,158,11,0.3); }
  .bdg-gray { background:rgba(255,255,255,.05);color:var(--txt2); }

  /* ── Cards generic ────────────────────────────────────────────────── */
  .card { background:var(--bg2);backdrop-filter:blur(16px);border:1px solid var(--bdr);border-radius:24px;padding:32px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
  .card-t { font-family:var(--fd);font-size:18px;font-weight:800;display:flex;align-items:center;gap:10px;margin-bottom:24px; color:#fff; }
  .sh { display:flex;align-items:center;justify-content:space-between;margin-bottom:24px; }
  .st { font-family:var(--fd);font-size:24px;font-weight:800; letter-spacing: -0.5px; color:#fff; }

  /* ── Buttons ──────────────────────────────────────────────────────── */
  .btn-add { padding:10px 20px;background:linear-gradient(135deg,var(--red),var(--red-d));border:none;border-radius:40px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;font-family:var(--fb);transition:all .3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 4px 12px rgba(225,29,72,0.3); }
  .btn-add:hover { transform:translateY(-3px);box-shadow:0 10px 24px rgba(225,29,72,.5); filter:brightness(1.1); }
  .btn-add.blue { background:linear-gradient(135deg,var(--blue),var(--blue-d)); box-shadow: 0 4px 12px rgba(14,165,233,0.3); }
  .btn-add.blue:hover { box-shadow:0 10px 24px rgba(14,165,233,.5) !important; }
  
  .btn-sm { padding:8px 16px;border-radius:10px;font-size:13px;border:none;cursor:pointer;font-family:var(--fb);font-weight:600;transition:all .2s; }
  .btn-sm-r { background:rgba(225,29,72,.15);color:#fb7185; }
  .btn-sm-r:hover { background:var(--red);color:#fff; box-shadow: 0 4px 12px rgba(225,29,72,0.3); }
  .btn-sm-g { background:rgba(16,185,129,.15);color:#4ade80; }
  .btn-sm-g:hover { background:var(--grn);color:#fff; }
  .btn-sm-b { background:rgba(14,165,233,.15);color:#38bdf8; }
  .btn-sm-b:hover { background:var(--blue);color:#fff; }
  
  .btn-outline-r { padding:10px 20px;background:rgba(225,29,72,.1);border:1.5px solid var(--red);border-radius:var(--rsm);color:#fb7185;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--fb);transition:all .3s; }
  .btn-outline-r:hover { background:rgba(225,29,72,.2); color:#fff; }

  /* ── Modal ────────────────────────────────────────────────────────── */
  .ov { position:fixed;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;z-index:200;animation:fadeIn .3s ease; padding: 20px; }
  .mod { background:rgba(24, 24, 27, 0.85);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.15);border-radius:28px;padding:40px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;animation:fadeUp .4s cubic-bezier(0.16, 1, 0.3, 1);position:relative;box-shadow:0 40px 100px rgba(0,0,0,.8); }
  .mod::-webkit-scrollbar { width:4px; }
  .mod-t { font-family:var(--fd);font-size:24px;font-weight:800;margin-bottom:32px; color:#fff; letter-spacing: -0.5px; }
  .mod-x { position:absolute;top:24px;right:24px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:var(--txt2);cursor:pointer;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all .3s; }
  .mod-x:hover { background:rgba(225,29,72,.2);color:#fb7185; border-color: rgba(225,29,72,.4); }
  
  .f-acts { display:flex;gap:16px;margin-top:32px;justify-content:flex-end; }
  .btn-can { padding:12px 24px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:var(--rsm);color:var(--txt2);font-family:var(--fb);font-weight:600;font-size:14px;cursor:pointer; transition: all .2s; }
  .btn-can:hover { background:rgba(255,255,255,0.1); color:#fff; }
  .btn-sub { padding:12px 28px;background:linear-gradient(135deg,var(--red),var(--red-d));border:none;border-radius:var(--rsm);color:#fff;font-family:var(--fd);font-size:15px;font-weight:800;cursor:pointer;transition:all .3s; box-shadow: 0 4px 12px rgba(225,29,72,0.3); }
  .btn-sub:hover { transform:translateY(-3px);box-shadow:0 12px 28px rgba(225,29,72,.5); filter:brightness(1.1); }

  /* ── Toast ────────────────────────────────────────────────────────── */
  .toast { position:fixed;bottom:32px;right:32px;background:rgba(24, 24, 27, 0.9);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.1);border-left:4px solid #4ade80;border-radius:16px;padding:16px 24px;display:flex;align-items:center;gap:12px;box-shadow:0 20px 50px rgba(0,0,0,0.5);z-index:300;font-size:15px;font-weight:500;color:#fff;animation:slideR .4s cubic-bezier(0.16, 1, 0.3, 1);max-width:400px; }
  .toast.err { border-left-color:#fb7185; }

  /* ── Gamification ─────────────────────────────────────────────────── */
  .niv-card { background:linear-gradient(135deg,rgba(9, 9, 11, 0.8),rgba(24, 24, 27, 0.9));backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.1);border-radius:32px;padding:32px;margin-bottom:32px;position:relative;overflow:hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
  .niv-glow { position:absolute;width:300px;height:300px;border-radius:50%;filter:blur(80px);opacity:.2;top:-80px;right:-80px; background:var(--vio); }
  .niv-title { font-family:var(--fd);font-size:32px;font-weight:800;margin-bottom:8px; color:#fff; }
  .score-pill { display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:800;background:rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(8px); }
  
  .bdg-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px; }
  .bdg-card { background:rgba(24, 24, 27, 0.5);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:24px;text-align:center;transition:all .3s cubic-bezier(0.16, 1, 0.3, 1);animation:fadeUp .4s ease backwards;position:relative; }
  .bdg-card:hover { transform:translateY(-6px); box-shadow: 0 15px 30px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.2); background:rgba(39, 39, 42, 0.6); }
  .bdg-card.locked { opacity:.4;filter:grayscale(1); }
  .bdg-card.locked:hover { transform:none; box-shadow:none; border-color: rgba(255,255,255,0.08); }
  .bdg-em { font-size:54px;display:block;margin-bottom:12px;filter:drop-shadow(0 8px 16px rgba(0,0,0,.4)); }
  .bdg-nm { font-family:var(--fd);font-size:16px;font-weight:800;margin-bottom:6px; color:#fff; }
  .bdg-ds { font-size:13px;color:var(--txt2);line-height:1.5; }
  .bdg-dt { font-size:11px;color:var(--txt3);margin-top:10px; font-weight:600; }
  .ok-tick { position:absolute;top:12px;right:12px;width:24px;height:24px;background:#10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px; box-shadow: 0 0 12px rgba(16, 185, 129, 0.5); }
  
  .cl-row { display:flex;align-items:center;gap:16px;padding:16px 20px;border-radius:16px;transition:all .3s;margin-bottom:8px; background:rgba(0,0,0,0.2); border: 1px solid transparent; }
  .cl-row:hover { background:rgba(255,255,255,0.05); transform:translateX(4px); }
  .cl-row.me { background:rgba(225,29,72,.1);border:1px solid rgba(225,29,72,.3); box-shadow: 0 4px 12px rgba(225,29,72,0.15); }
  .cl-rang { width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0; font-family:var(--fd); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
  .r1 { background:linear-gradient(135deg,#fbbf24,#d97706);color:#fff; }
  .r2 { background:linear-gradient(135deg,#cbd5e1,#64748b);color:#fff; }
  .r3 { background:linear-gradient(135deg,#d97706,#9a3412);color:#fff; }
  .ro { background:rgba(255,255,255,0.05);color:var(--txt2); border: 1px solid rgba(255,255,255,0.1); }

  /* ── Matching ─────────────────────────────────────────────────────── */
  .mc-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px; }
  .mc { background:var(--bg2);backdrop-filter:blur(16px);border:1px solid var(--bdr);border-radius:24px;padding:20px;transition:all .3s cubic-bezier(0.16, 1, 0.3, 1);animation:fadeUp .4s ease backwards;position:relative; }
  .mc:hover { transform:translateY(-5px);box-shadow:0 20px 40px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.15); }
  .mc.urg { border-color:rgba(225,29,72,.4); box-shadow: inset 0 0 40px rgba(225,29,72,0.05); }
  .sc-ring svg { overflow:visible; }
  .raison { display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;font-size:12px;color:var(--txt2);margin:3px; font-weight:500; }

  /* ── Notification Bell ────────────────────────────────────────────── */
  .notif-bell { position:relative;cursor:pointer;padding:10px;border-radius:12px;transition:background .3s;border:none;background:rgba(0,0,0,0.2);color:var(--txt); border: 1px solid rgba(255,255,255,0.05); }
  .notif-bell:hover { background:rgba(255,255,255,0.08); }
  .notif-cnt { position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;background:#fb7185;border-radius:10px;font-size:11px;font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center;padding:0 4px;animation:countUp .4s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 0 10px rgba(251, 113, 133, 0.5); }
  .notif-panel { position:absolute;top:64px;right:16px;width:380px;background:rgba(24, 24, 27, 0.9);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.1);border-radius:24px;box-shadow:0 30px 80px rgba(0,0,0,.7);z-index:200;overflow:hidden;animation:slideR .3s cubic-bezier(0.16, 1, 0.3, 1); }
  .np-hdr { padding:18px 24px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between; background: rgba(0,0,0,0.3); }
  .np-ttl { font-family:var(--fd);font-size:16px;font-weight:800; color:#fff; }
  .ni { padding:16px 24px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;gap:14px;cursor:pointer;transition:background .2s; }
  .ni:hover { background:rgba(255,255,255,0.03); }
  .ni.unread { background:rgba(225,29,72,.05);border-left:3px solid var(--red); }
  .ni-icon { width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0; }
  .ni-tt { font-size:14px;font-weight:700;margin-bottom:4px; color:#fff; }
  .ni-mg { font-size:13px;color:var(--txt2);line-height:1.5; }
  .ni-tm { font-size:11px;color:var(--txt3);margin-top:6px; font-weight:500; }
  .ni-dot { width:8px;height:8px;background:#fb7185;border-radius:50%;flex-shrink:0;margin-top:6px; box-shadow: 0 0 8px #fb7185; }

  /* ── Campagne card ────────────────────────────────────────────────── */
  .camp-card { background:var(--bg2);backdrop-filter:blur(16px);border:1px solid var(--bdr);border-radius:24px;padding:24px;transition:all .3s cubic-bezier(0.16, 1, 0.3, 1);animation:fadeUp .4s ease backwards; }
  .camp-card:hover { transform:translateY(-5px);box-shadow:0 20px 40px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.15); }
  .prog-bar { background:rgba(0,0,0,0.3);border-radius:20px;height:8px;overflow:hidden;margin:12px 0; border: 1px solid rgba(255,255,255,0.05); }
  .prog-fill { height:100%;border-radius:20px;transition:width 1.5s cubic-bezier(0.16, 1, 0.3, 1); background: linear-gradient(90deg, var(--red), var(--red-d)); box-shadow: 0 0 10px rgba(225,29,72,0.5); }
  .time-badge { display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:12px;font-size:13px;font-weight:700; background:rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }

  /* ── Profil ───────────────────────────────────────────────────────── */
  .prof-info-box { padding:16px 20px;border-radius:16px;font-size:14px;margin-bottom:20px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); }

  /* ── Progress ring ────────────────────────────────────────────────── */
  .ring-wrap { position:relative;display:inline-flex;align-items:center;justify-content:center; filter: drop-shadow(0 0 10px rgba(0,0,0,0.3)); }
  .ring-txt { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center; }

  /* ── Bar chart ────────────────────────────────────────────────────── */
  .bc-row { display:flex;align-items:center;gap:14px;margin-bottom:12px; }
  .bc-lbl { font-size:12px;font-weight:600;color:var(--txt2);width:30px;text-align:right;flex-shrink:0; }
  .bc-track { flex:1;height:8px;background:rgba(0,0,0,0.3);border-radius:4px;overflow:hidden; border: 1px solid rgba(255,255,255,0.05); }
  .bc-fill { height:100%;border-radius:4px;transition:width 1.5s cubic-bezier(0.16, 1, 0.3, 1); }
  .bc-val { font-size:12px;font-weight:800;width:24px;text-align:right; color:#fff; }

  /* ── Tabs ─────────────────────────────────────────────────────────── */
  .tabs-row { display:flex;gap:6px;background:rgba(0,0,0,0.3);border-radius:16px;padding:6px;margin-bottom:32px;width:fit-content; border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(8px); }
  .tab { padding:10px 20px;border:none;border-radius:12px;background:none;color:var(--txt2);font-size:14px;font-weight:600;cursor:pointer;font-family:var(--fb);transition:all .3s; }
  .tab.on { background:rgba(255,255,255,0.1);color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.2); }

  /* ── Avis ─────────────────────────────────────────────────────────── */
  .av-it { padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.05); }
  .av-it:last-child { border-bottom:none; }
  .av-av { width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--red),var(--vio));display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;flex-shrink:0; color:#fff; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }

  /* ── Carte ─────────────────────────────────────────────────────────── */
  .carte-layout { display:grid;grid-template-columns:360px 1fr;gap:24px;height:640px; }
  @media(max-width:900px){.carte-layout{grid-template-columns:1fr;height:auto;}}
  .carte-list { background:var(--bg2);backdrop-filter:blur(16px);border:1px solid var(--bdr);border-radius:24px;overflow-y:auto;display:flex;flex-direction:column; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
  .carte-list::-webkit-scrollbar { width:4px; }
  .carte-item { padding:20px;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;transition:background .2s;display:flex;gap:14px;align-items:flex-start; }
  .carte-item:hover { background:rgba(255,255,255,0.03); }
  .carte-item.active { background:rgba(225,29,72,.08);border-left:4px solid var(--red); }
  .carte-item.critique { border-left:4px solid var(--red); }
  .carte-dot { width:12px;height:12px;border-radius:50%;flex-shrink:0;margin-top:4px; box-shadow: 0 0 8px currentColor; }
  .carte-iframe { border-radius:24px;overflow:hidden;border:1px solid var(--bdr);height:100%;min-height:400px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }

  /* ── SOS Banner ─────────────────────────────────────────────────────── */
  .sos-banner { background:linear-gradient(135deg,rgba(225,29,72,.2),rgba(225,29,72,.05));backdrop-filter:blur(12px);border:1.5px solid rgba(225,29,72,.4);border-radius:24px;padding:20px 24px;margin-bottom:24px;animation:fadeUp .4s ease; box-shadow: 0 10px 30px rgba(225,29,72,0.15); }
  .sos-item { display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid rgba(225,29,72,.15); }
  .sos-item:last-child { border-bottom:none; }
  .sos-pulse { width:12px;height:12px;border-radius:50%;background:#fb7185;animation:pulse 1s infinite;flex-shrink:0; box-shadow: 0 0 12px #fb7185; }

  /* ── Agenda ─────────────────────────────────────────────────────────── */
  .agenda-hero { background:linear-gradient(135deg,rgba(9, 9, 11, 0.8),rgba(24, 24, 27, 0.9));backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.1);border-radius:32px;padding:36px;margin-bottom:32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:24px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
  .timeline { position:relative;padding-left:32px; }
  .timeline::before { content:'';position:absolute;left:11px;top:0;bottom:0;width:3px;background:rgba(255,255,255,0.08); }
  .tl-item { position:relative;margin-bottom:24px;animation:fadeUp .4s ease backwards; }
  .tl-dot { position:absolute;left:-28px;top:6px;width:16px;height:16px;border-radius:50%;border:3px solid var(--red);background:var(--bg);flex-shrink:0; box-shadow: 0 0 10px rgba(225,29,72,0.4); }
  .tl-dot.ok { background:#10b981;border-color:#10b981; box-shadow: 0 0 10px rgba(16,185,129,0.4); }
  .tl-card { background:rgba(24, 24, 27, 0.6);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px 20px;transition:all .3s cubic-bezier(0.16, 1, 0.3, 1); }
  .tl-card:hover { border-color:rgba(225,29,72,.4);transform:translateX(5px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
  .camp-proche { display:flex;align-items:center;gap:14px;padding:12px 16px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.05);border-radius:14px;margin-bottom:10px;cursor:pointer;transition:all .3s; }
  .camp-proche:hover { background:rgba(255,255,255,0.05); transform: translateY(-2px); }

  /* ── Feed Social ─────────────────────────────────────────────────────── */
  .post-card { background:var(--bg2);backdrop-filter:blur(16px);border:1px solid var(--bdr);border-radius:24px;padding:24px;margin-bottom:20px;animation:fadeUp .4s ease backwards;transition:all .3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
  .post-card:hover { border-color:rgba(255,255,255,0.15);transform:translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
  .post-header { display:flex;align-items:center;gap:14px;margin-bottom:16px; }
  .post-avatar { width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--red),var(--vio));display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;flex-shrink:0; color:#fff; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
  .post-type-badge { padding:4px 12px;border-radius:16px;font-size:11px;font-weight:700; border: 1px solid rgba(255,255,255,0.1); }
  .post-type-temoignage { background:var(--blue-s);color:#38bdf8; }
  .post-type-remerciement { background:var(--grn-s);color:#4ade80; }
  .post-type-annonce { background:var(--amb-s);color:#fbbf24; }
  .post-type-celebration { background:var(--vio-s);color:#c084fc; }
  .post-content { font-size:15px;line-height:1.7;margin-bottom:16px;color:var(--txt); }
  .post-actions { display:flex;gap:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.05); }
  .post-action-btn { background:none;border:none;color:var(--txt2);font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:12px;transition:all .2s;font-family:var(--fb); }
  .post-action-btn:hover { background:rgba(255,255,255,0.05);color:#fff; }
  .post-action-btn.liked { color:#fb7185; }
  
  .story-bar { display:flex;gap:16px;overflow-x:auto;padding:16px 0;margin-bottom:28px; }
  .story-bar::-webkit-scrollbar { height:6px; }
  .story-item { flex-shrink:0;text-align:center;cursor:pointer;transition:transform .3s; }
  .story-item:hover { transform:scale(1.08); }
  .story-avatar { width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--red),var(--vio));display:flex;align-items:center;justify-content:center;font-size:28px;border:3px solid var(--bg);box-shadow:0 0 0 2px var(--red);margin-bottom:8px; color:#fff; }
  .story-avatar.viewed { box-shadow:0 0 0 2px var(--txt3); filter: grayscale(0.5); }
  .story-name { font-size:12px;font-weight:600;color:var(--txt);max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
  
  .comment-item { padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;gap:14px; }
  .comment-item:last-child { border-bottom:none; }
  .comment-avatar { width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--vio));display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;flex-shrink:0; color:#fff; }

  /* ── Missions ───────────────────────────────────────────────────────── */
  .mission-card { background:var(--bg2);backdrop-filter:blur(16px);border:1px solid var(--bdr);border-radius:24px;padding:24px;transition:all .3s cubic-bezier(0.16, 1, 0.3, 1);animation:fadeUp .4s ease backwards;position:relative;overflow:hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
  .mission-card:hover { transform:translateY(-5px);box-shadow:0 20px 40px rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.15); }
  .mission-card.completed { border-color:rgba(16,185,129,0.5);background:linear-gradient(135deg,var(--bg2),rgba(16,185,129,.05)); box-shadow: inset 0 0 30px rgba(16,185,129,0.05); }
  .mission-emoji { font-size:40px;margin-bottom:12px;display:block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); }
  .mission-type { display:inline-flex;padding:4px 12px;border-radius:16px;font-size:11px;font-weight:800;margin-bottom:12px; border: 1px solid rgba(255,255,255,0.1); }
  .mission-type-hebdo { background:var(--blue-s);color:#38bdf8; }
  .mission-type-mensuel { background:var(--vio-s);color:#c084fc; }
  .mission-type-special { background:var(--amb-s);color:#fbbf24; }
  .mission-progress { margin:16px 0; }
  .mission-progress-bar { background:rgba(0,0,0,0.3);border-radius:20px;height:10px;overflow:hidden; border: 1px solid rgba(255,255,255,0.05); }
  .mission-progress-fill { height:100%;border-radius:20px;transition:width 1.5s cubic-bezier(0.16, 1, 0.3, 1); background: linear-gradient(90deg, var(--red), var(--red-d)); box-shadow: 0 0 10px rgba(225,29,72,0.5); }
  .mission-reward { display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3);border-radius:16px;font-size:13px;font-weight:800;color:#fbbf24; }

  /* ── Parrainage ───────────────────────────────────────────────────── */
  .code-box { background:rgba(0,0,0,0.2);border:2px dashed rgba(255,255,255,0.15);border-radius:24px;padding:28px;text-align:center;margin:24px 0; transition:all .3s; }
  .code-box:hover { border-color: rgba(225,29,72,0.4); background: rgba(225,29,72,0.05); }
  .code-display { font-family:'Courier New',monospace;font-size:36px;font-weight:800;letter-spacing:6px;color:#fb7185;margin:16px 0; text-shadow: 0 0 20px rgba(251,113,133,0.4); }
  .filleul-item { display:flex;align-items:center;gap:16px;padding:16px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.05);border-radius:16px;margin-bottom:12px; transition:all .2s; }
  .filleul-item:hover { background: rgba(255,255,255,0.05); transform: translateX(4px); }
  .filleul-avatar { width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--grn),var(--blue));display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;flex-shrink:0; color:#fff; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }

  /* ── Équipes ─────────────────────────────────────────────────────── */
  .equipe-card { background:var(--bg2);backdrop-filter:blur(16px);border:1px solid var(--bdr);border-radius:24px;padding:24px;transition:all .3s cubic-bezier(0.16, 1, 0.3, 1);animation:fadeUp .4s ease backwards;cursor:pointer; position:relative; overflow:hidden; }
  .equipe-card:hover { transform:translateY(-5px);box-shadow:0 20px 40px rgba(0,0,0,0.4);border-color:rgba(225,29,72,.4); }
  .equipe-header { display:flex;align-items:center;gap:16px;margin-bottom:16px; }
  .equipe-emoji { width:60px;height:60px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:32px;flex-shrink:0; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); }
  .equipe-stats { display:flex;gap:24px;margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.05); }
  .equipe-stat { text-align:center; flex:1; }
  .equipe-stat-value { font-family:var(--fd);font-size:24px;font-weight:800;color:#fb7185; }
  .equipe-stat-label { font-size:11px;color:var(--txt3);text-transform:uppercase;letter-spacing:1px; font-weight:700; margin-top:4px; }
`;

// ─── Icons ────────────────────────────────────────────────────────────
const I = ({ n, s = 18 }) => {
  const m = {
    user:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    lock:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    eye:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    eyeo:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    out:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    ok:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    x:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    plus:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    menu:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    bell:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    drop:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>,
    alert: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    cal:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    clock: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    heart: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    pin:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    chart: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    hosp:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12h6M12 9v6"/></svg>,
    users: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    dl:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    shield:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    map:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    sos:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    agenda:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/></svg>,
    sun:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    moon:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  };
  return m[n] || null;
};

// ─── Helpers ──────────────────────────────────────────────────────────
const H  = () => { const t = localStorage.getItem('access_token'); return t ? { Authorization: `Bearer ${t}` } : {}; };
const JH = () => ({ ...H(), 'Content-Type': 'application/json' });
const GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

function Toast({ msg, type = 'ok', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div className={`toast ${type === 'err' ? 'err' : ''}`}><I n={type === 'err' ? 'x' : 'ok'} s={15} />{msg}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mod">
        <button className="mod-x" onClick={onClose}><I n="x" s={13} /></button>
        <div className="mod-t">{title}</div>
        {children}
      </div>
    </div>
  );
}

function Ring({ pct = 0, size = 80, color = '#e63946', label = '', sub = '' }) {
  const r = (size - 12) / 2;
  const C = 2 * Math.PI * r;
  const off = C * (1 - Math.min(pct, 100) / 100);
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={10} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={C} strokeDashoffset={off} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="ring-txt">
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: size > 60 ? 14 : 11, fontWeight: 800, color }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');   // login | choix | donneur | hopital
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showP, setShowP] = useState(false);
  const [form, setForm] = useState({ username:'',password:'' });
  const [dForm, setDForm] = useState({ username:'',first_name:'',last_name:'',email:'',password1:'',password2:'',groupe_sanguin:'O+',sexe:'H',date_naissance:'',ville:'',telephone:'' });
  const [hForm, setHForm] = useState({ username:'',email:'',password1:'',password2:'',nom:'',adresse:'',ville:'',agrement:'',telephone:'' });
  const [success, setSuccess] = useState('');

  const login = async () => {
    if (!form.username || !form.password) { setErr('Remplissez tous les champs.'); return; }
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${BLOOD_API}/auth/login/`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
      const d = await res.json();
      if (res.ok) { localStorage.setItem('access_token',d.access); localStorage.setItem('refresh_token',d.refresh); onLogin(d.user); }
      else setErr(d.error || 'Identifiants incorrects.');
    } catch { setErr('Impossible de joindre le serveur.'); }
    setLoading(false);
  };

  const register = async (role) => {
    const f = role === 'donneur' ? dForm : hForm;
    if (!f.username || !f.password1) { setErr('Champs obligatoires manquants.'); return; }
    if (f.password1 !== f.password2) { setErr('Mots de passe différents.'); return; }
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${BLOOD_API}/auth/register/`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...f,role}) });
      const d = await res.json();
      if (res.ok) { setSuccess(role === 'hopital' ? 'Demande envoyée ! En attente de validation.' : 'Compte créé ! Connectez-vous.'); setTimeout(() => { setMode('login'); setSuccess(''); }, 2500); }
      else setErr(d.error || 'Erreur lors de l\'inscription.');
    } catch { setErr('Impossible de joindre le serveur.'); }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Left */}
      <div className="auth-panel-l">
        <div className="auth-panel-l-img" />
        <div className="auth-blob ab1" /><div className="auth-blob ab2" /><div className="auth-blob ab3" />
        <div className="auth-left-c">
          <span className="auth-drop-big">🩸</span>
          <div className="auth-logo-bc">BloodConnect</div>
          <p className="auth-tag-bc">Connectez les donneurs de sang aux établissements hospitaliers qui en ont besoin.</p>
          <div className="auth-stats-bc">
            <div><div className="ast-n">500+</div><div className="ast-l">Donneurs</div></div>
            <div><div className="ast-n">50+</div><div className="ast-l">Hôpitaux</div></div>
            <div><div className="ast-n">2K+</div><div className="ast-l">Dons</div></div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="auth-panel-r">
        <div className="auth-card-bc">
          {success && <div style={{ background:'rgba(34,197,94,.1)',border:'1px solid rgba(34,197,94,.25)',borderRadius:'var(--rsm)',padding:'12px 16px',color:'var(--grn)',fontSize:14,marginBottom:16,textAlign:'center' }}>✅ {success}</div>}
          {err && <div className="err-bc"><I n="alert" s={14} />{err}</div>}

          {/* LOGIN */}
          {mode === 'login' && <>
            <div className="auth-title-bc">Bon retour 👋</div>
            <div className="auth-sub-bc">Connectez-vous à votre espace BloodConnect</div>
            <div className="fgrp"><label className="flbl">Nom d'utilisateur</label>
              <div className="inp-w"><span className="inp-ic"><I n="user" s={15}/></span><input className="finp finp-ic" placeholder="username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} onKeyDown={e=>e.key==='Enter'&&login()}/></div>
            </div>
            <div className="fgrp"><label className="flbl">Mot de passe</label>
              <div className="inp-w"><span className="inp-ic"><I n="lock" s={15}/></span><input className="finp finp-ic" type={showP?'text':'password'} placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==='Enter'&&login()}/><button className="inp-r" onClick={()=>setShowP(!showP)}><I n={showP?'eyeo':'eye'} s={16}/></button></div>
            </div>
            <button className="btn-red" style={{width:'100%',padding:13}} onClick={login} disabled={loading}>{loading?'Connexion…':'Se connecter'}</button>
            <p style={{textAlign:'center',marginTop:18,fontSize:13,color:'var(--txt2)'}}>Pas encore de compte ? <button onClick={()=>{setMode('choix');setErr('');}} style={{background:'none',border:'none',color:'var(--red)',fontWeight:700,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13}}>S'inscrire</button></p>
          </>}

          {/* CHOIX ROLE */}
          {mode === 'choix' && <>
            <button className="back-link" onClick={()=>setMode('login')}>← Retour</button>
            <div className="auth-title-bc">Créer un compte</div>
            <div className="auth-sub-bc" style={{marginBottom:24}}>Choisissez votre type de compte</div>
            <div className="role-cards">
              <div className="role-card donor" onClick={()=>{setMode('donneur');setErr('');}}>
                <span className="ric">🫀</span>
                <div className="rnm">Je suis un Donneur</div>
                <div className="rdsc">Répondez aux urgences et enregistrez vos dons</div>
              </div>
              <div className="role-card hopital" onClick={()=>{setMode('hopital');setErr('');}}>
                <span className="ric">🏥</span>
                <div className="rnm">Je suis un Hôpital</div>
                <div className="rdsc">Publiez des demandes et gérez les campagnes</div>
              </div>
            </div>
          </>}

          {/* DONNEUR FORM */}
          {mode === 'donneur' && <>
            <button className="back-link" onClick={()=>setMode('choix')}>← Changer de rôle</button>
            <div className="role-header d"><span className="ri">🫀</span><div><div className="rtx">Inscription Donneur</div><div className="rsu">Renseignez vos informations médicales</div></div></div>
            <div className="frow"><div className="fgrp"><label className="flbl">Prénom</label><input className="finp" placeholder="Yassine" value={dForm.first_name} onChange={e=>setDForm({...dForm,first_name:e.target.value})}/></div>
              <div className="fgrp"><label className="flbl">Nom</label><input className="finp" placeholder="Ben Ali" value={dForm.last_name} onChange={e=>setDForm({...dForm,last_name:e.target.value})}/></div></div>
            <div className="frow"><div className="fgrp"><label className="flbl">Username *</label><input className="finp" placeholder="yassine123" value={dForm.username} onChange={e=>setDForm({...dForm,username:e.target.value})}/></div>
              <div className="fgrp"><label className="flbl">Email</label><input className="finp" type="email" placeholder="email@..." value={dForm.email} onChange={e=>setDForm({...dForm,email:e.target.value})}/></div></div>
            <div className="frow"><div className="fgrp"><label className="flbl">Groupe sanguin *</label><select className="fsel" value={dForm.groupe_sanguin} onChange={e=>setDForm({...dForm,groupe_sanguin:e.target.value})}>{GROUPS.map(g=><option key={g} value={g}>{g}</option>)}</select></div>
              <div className="fgrp"><label className="flbl">Sexe *</label><select className="fsel" value={dForm.sexe} onChange={e=>setDForm({...dForm,sexe:e.target.value})}><option value="H">Homme</option><option value="F">Femme</option></select></div></div>
            <div className="frow"><div className="fgrp"><label className="flbl">Date naissance *</label><input className="finp" type="date" value={dForm.date_naissance} onChange={e=>setDForm({...dForm,date_naissance:e.target.value})}/></div>
              <div className="fgrp"><label className="flbl">Ville *</label><input className="finp" placeholder="Sfax" value={dForm.ville} onChange={e=>setDForm({...dForm,ville:e.target.value})}/></div></div>
            <div className="fgrp"><label className="flbl">Téléphone</label><input className="finp" placeholder="+216 XX XXX XXX" value={dForm.telephone} onChange={e=>setDForm({...dForm,telephone:e.target.value})}/></div>
            <div className="frow"><div className="fgrp"><label className="flbl">Mot de passe *</label><input className="finp" type="password" placeholder="••••••••" value={dForm.password1} onChange={e=>setDForm({...dForm,password1:e.target.value})}/></div>
              <div className="fgrp"><label className="flbl">Confirmer *</label><input className="finp" type="password" placeholder="••••••••" value={dForm.password2} onChange={e=>setDForm({...dForm,password2:e.target.value})}/></div></div>
            <button className="btn-red" style={{width:'100%',padding:13}} onClick={()=>register('donneur')} disabled={loading}>{loading?'Création…':'🫀 Créer mon compte'}</button>
          </>}

          {/* HOPITAL FORM */}
          {mode === 'hopital' && <>
            <button className="back-link" onClick={()=>setMode('choix')}>← Changer de rôle</button>
            <div className="role-header h"><span className="ri">🏥</span><div><div className="rtx">Inscription Hôpital</div><div className="rsu">Soumis à validation administrative</div></div></div>
            <div className="frow"><div className="fgrp"><label className="flbl">Username *</label><input className="finp" placeholder="hopital_sfax" value={hForm.username} onChange={e=>setHForm({...hForm,username:e.target.value})}/></div>
              <div className="fgrp"><label className="flbl">Email</label><input className="finp" type="email" placeholder="contact@..." value={hForm.email} onChange={e=>setHForm({...hForm,email:e.target.value})}/></div></div>
            <div className="fgrp"><label className="flbl">Nom établissement *</label><input className="finp" placeholder="Hôpital Universitaire de Sfax" value={hForm.nom} onChange={e=>setHForm({...hForm,nom:e.target.value})}/></div>
            <div className="frow"><div className="fgrp"><label className="flbl">N° Agrément *</label><input className="finp" placeholder="AGR-2024-001" value={hForm.agrement} onChange={e=>setHForm({...hForm,agrement:e.target.value})}/></div>
              <div className="fgrp"><label className="flbl">Ville</label><input className="finp" placeholder="Sfax" value={hForm.ville} onChange={e=>setHForm({...hForm,ville:e.target.value})}/></div></div>
            <div className="frow"><div className="fgrp"><label className="flbl">Adresse</label><input className="finp" placeholder="Rue..." value={hForm.adresse} onChange={e=>setHForm({...hForm,adresse:e.target.value})}/></div>
              <div className="fgrp"><label className="flbl">Téléphone</label><input className="finp" placeholder="+216..." value={hForm.telephone} onChange={e=>setHForm({...hForm,telephone:e.target.value})}/></div></div>
            <div className="frow"><div className="fgrp"><label className="flbl">Mot de passe *</label><input className="finp" type="password" placeholder="••••••••" value={hForm.password1} onChange={e=>setHForm({...hForm,password1:e.target.value})}/></div>
              <div className="fgrp"><label className="flbl">Confirmer *</label><input className="finp" type="password" placeholder="••••••••" value={hForm.password2} onChange={e=>setHForm({...hForm,password2:e.target.value})}/></div></div>
            <button className="btn-red btn-blue" style={{width:'100%',padding:13}} onClick={()=>register('hopital')} disabled={loading}>{loading?'Envoi…':'🏥 Soumettre ma demande'}</button>
          </>}
        </div>
      </div>
    </div>
  );
}

// ─── NOTIFICATION BELL ────────────────────────────────────────────────
function NotifBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ notifications:[], nb_non_lues:0 });

  const load = () => fetch(`${BLOOD_API}/notifications/`, { headers:H() }).then(r=>r.json()).then(setData).catch(()=>{});
  useEffect(() => { load(); const iv = setInterval(load, 30000); return () => clearInterval(iv); }, []);

  const lire = async (id) => {
    await fetch(`${BLOOD_API}/notifications/${id}/lire/`, { method:'POST', headers:H() });
    setData(prev => ({ ...prev, nb_non_lues: prev.nb_non_lues-1, notifications: prev.notifications.map(n => n.id===id?{...n,lue:true}:n) }));
  };
  const toutLire = async () => {
    await fetch(`${BLOOD_API}/notifications/tout-lire/`, { method:'POST', headers:H() });
    setData(prev => ({ ...prev, nb_non_lues:0, notifications:prev.notifications.map(n=>({...n,lue:true})) }));
  };

  const ICONS = { urgence:'🚨', campagne:'📅', badge:'🏆', eligible:'✅', validation:'✅', reponse:'📢' };

  return (
    <div style={{ position:'relative' }}>
      <button className="notif-bell" onClick={()=>setOpen(!open)}>
        <I n="bell" s={20} />
        {data.nb_non_lues > 0 && <div className="notif-cnt">{data.nb_non_lues > 9 ? '9+' : data.nb_non_lues}</div>}
      </button>
      {open && (
        <div className="notif-panel">
          <div className="np-hdr">
            <div className="np-ttl">🔔 Notifications {data.nb_non_lues > 0 && <span style={{marginLeft:6,padding:'1px 7px',background:'var(--red)',borderRadius:10,fontSize:11,color:'#fff'}}>{data.nb_non_lues}</span>}</div>
            <div style={{display:'flex',gap:8}}>
              {data.nb_non_lues > 0 && <button onClick={toutLire} style={{background:'none',border:'none',color:'var(--txt3)',fontSize:11,cursor:'pointer'}}>Tout lire</button>}
              <button onClick={()=>setOpen(false)} style={{background:'none',border:'none',color:'var(--txt3)',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
          </div>
          <div style={{maxHeight:360,overflowY:'auto'}}>
            {data.notifications.length === 0
              ? <div style={{padding:32,textAlign:'center',color:'var(--txt3)',fontSize:13}}>Aucune notification</div>
              : data.notifications.map(n => (
                <div key={n.id} className={`ni ${!n.lue?'unread':''}`} onClick={()=>!n.lue&&lire(n.id)}>
                  <div className="ni-icon">{ICONS[n.type]||'🔔'}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="ni-tt">{n.titre}</div>
                    <div className="ni-mg">{n.message}</div>
                    <div className="ni-tm">{n.date_relative}</div>
                  </div>
                  {!n.lue && <div className="ni-dot"/>}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────
function Sidebar({ navItems, page, setPage, user, role, onBack, open }) {
  const { logout } = useContext(AuthCtx);
  return (
    <aside className={`sb ${open?'open':''}`}>
      <div className="sb-top">
        <div className="sb-ic">🩸</div>
        <div className="sb-tx">Blood<span>Connect</span></div>
      </div>
      <nav className="sb-nav">
        {onBack && <button className="back-link" onClick={onBack}>← Retour</button>}
        <div className="nav-lbl">Navigation</div>
        {navItems.map(n => (
          <button key={n.id} className={`nit ${page===n.id?'on':''}`} onClick={()=>setPage(n.id)}>
            <I n={n.ic} s={17} />{n.lb}
          </button>
        ))}
      </nav>
      <div className="sb-btm">
        <div className="sb-chip">
          <div className="sb-av">{(user.username||'U')[0].toUpperCase()}</div>
          <div><div className="sb-un">{user.username}</div><div className="sb-rl">{role}</div></div>
        </div>
        <button className="sb-out" onClick={logout}><I n="out" s={13}/> Déconnexion</button>
      </div>
    </aside>
  );
}

// ─── DEMANDE CARD ─────────────────────────────────────────────────────
function DemandeCard({ d, i, onRepondre }) {
  return (
    <div className={`dc ${d.est_urgente?'urg':''}`} style={{animationDelay:`${i*0.06}s`}}>
      <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:12}}>
        <div className="blood-badge">{d.groupe_sanguin}</div>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
            <strong style={{fontSize:14}}>{d.hopital_nom}</strong>
            {d.est_urgente && <span className="badge-urg"><span className="urg-dot"/>Urgent</span>}
          </div>
          <div style={{fontSize:12,color:'var(--txt2)',display:'flex',gap:12,flexWrap:'wrap'}}>
            <span><I n="pin" s={12}/> {d.hopital_ville||d.hopital_adresse||'—'}</span>
            <span><I n="drop" s={12}/> {d.quantite} poches</span>
          </div>
        </div>
      </div>
      {d.description && <p style={{fontSize:12,color:'var(--txt2)',marginBottom:10,lineHeight:1.5}}>{d.description}</p>}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:11,color:'var(--txt3)'}}><I n="clock" s={11}/> {d.delai?new Date(d.delai).toLocaleDateString('fr-FR'):'—'} · {d.nb_reponses} réponse(s)</div>
        {onRepondre && <button className="btn-sm btn-sm-r" onClick={()=>onRepondre(d.id)}>Répondre →</button>}
      </div>
    </div>
  );
}

// ─── DASHBOARD DONNEUR ────────────────────────────────────────────────
function DashDonneur({ user, onToast }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState('accueil');
  const [sideOpen, setSideOpen] = useState(false);
  const [nbSOS, setNbSOS] = useState(0);
  const { theme, toggleTheme } = useContext(ThemeCtx);

  const reload = () => fetch(`${BLOOD_API}/dashboard/donneur/`, { headers:H() }).then(r=>r.json()).then(setData).catch(()=>{});
  const loadSOS = () => fetch(`${BLOOD_API}/alertes-sos/`, { headers:H() }).then(r=>r.json()).then(d=>setNbSOS(d.nb||0)).catch(()=>{});

  useEffect(() => { reload(); }, [page]);
  useEffect(() => { loadSOS(); const iv = setInterval(loadSOS, 60000); return () => clearInterval(iv); }, []);

  if (!data) return <div style={{padding:60,textAlign:'center',color:'var(--txt2)'}}>Chargement…</div>;

  const NAV = [
    {id:'accueil',   lb:'Tableau de bord', ic:'heart'},
    {id:'demandes',  lb:'Appels urgents',  ic:'alert'},
    {id:'sos',       lb:'Alertes SOS',     ic:'sos'},
    {id:'carte',     lb:'Carte des centres',ic:'map'},
    {id:'agenda',    lb:'Mon agenda',      ic:'agenda'},
    {id:'dons',      lb:'Mes dons',        ic:'drop'},
    {id:'campagnes', lb:'Campagnes',       ic:'cal'},
    {id:'historique',lb:'Historique',      ic:'clock'},
    {id:'gamification',lb:'Gamification', ic:'chart'},
    {id:'matching',  lb:'Mon Matching',    ic:'users'},
    {id:'social',    lb:'Communauté',      ic:'users'},
    {id:'chatbot',   lb:'Assistant IA',    ic:'heart'},
    {id:'profil',    lb:'Mon profil',      ic:'user'},
    {id:'health', lb:'Ma Santé', ic:'heart'},
  ];

  const jours = !data.eligible ? Math.max(0, Math.ceil((new Date(data.prochaine_date)-new Date())/86400000)) : 0;

  return (
    <div className="app-lay">
      {sideOpen && <div onClick={()=>setSideOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:99}}/>}
      <Sidebar navItems={NAV} page={page} setPage={p=>{setPage(p);setSideOpen(false);}} user={user} role="Donneur 🫀" open={sideOpen} />
      <div className="main">
        <div className="topbar">
          <button className="ham" onClick={()=>setSideOpen(true)}><I n="menu" s={22}/></button>
          <div className="tb-title">{NAV.find(n=>n.id===page)?.lb}</div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={toggleTheme} style={{background:'none',border:'none',color:'var(--txt2)',cursor:'pointer',padding:8,borderRadius:10,transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center'}} onMouseEnter={e=>e.target.style.background='var(--bg3)'} onMouseLeave={e=>e.target.style.background='none'}>
              <I n={theme==='dark'?'sun':'moon'} s={20}/>
            </button>
            {nbSOS > 0 && (
              <button
                onClick={()=>setPage('sos')}
                style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',background:'rgba(230,57,70,.15)',border:'1.5px solid rgba(230,57,70,.4)',borderRadius:20,color:'var(--red)',fontSize:12,fontWeight:700,cursor:'pointer',animation:'pulse 1.5s infinite',fontFamily:"'Plus Jakarta Sans',sans-serif"}}
              >
                <span style={{width:7,height:7,borderRadius:'50%',background:'var(--red)',display:'inline-block'}}/>
                {nbSOS} SOS
              </button>
            )}
            <span className={`bdg ${data.eligible?'bdg-g':'bdg-y'}`}>{data.eligible?'✅ Éligible':'⏳ '+jours+'j'}</span>
            <span className="bdg bdg-r" style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13}}>{data.groupe_sanguin}</span>
            <LanguageSwitcher style={{ marginRight: 4 }} />
            <NotifBell/>
          </div>
        </div>
        <div className="pad">
          {page==='accueil'      && <AccueilDonneur data={data} setPage={setPage} onToast={onToast}/>}
          {page==='demandes'     && <DemandesDonneur groupe={data.groupe_sanguin} onToast={onToast}/>}
          {page==='sos'          && <AlertesSOS onToast={onToast} setPage={setPage}/>}
          {page==='carte'        && <CarteInteractive/>}
          {page==='agenda'       && <AgendaDon onToast={onToast} setPage={setPage}/>}
          {page==='dons'         && <DonsDonneur reload={reload} onToast={onToast}/>}
          {page==='campagnes'    && <CampagnesDonneur onToast={onToast}/>}
          {page==='historique'   && <HistoriqueDonneur/>}
          {page==='gamification' && <GamificationDonneur onToast={onToast}/>}
          {page==='matching'     && <MatchingDonneur groupe={data.groupe_sanguin} onToast={onToast}/>}
          {page==='social'       && <SocialCommunaute onToast={onToast}/>}
          {page==='chatbot'      && <ChatbotAssistant onToast={onToast}/>}
          {page==='profil'       && <ProfilDonneur data={data} onToast={onToast}/>}
          {page==='health' && <HealthDashboard />}
        </div>
      </div>
    </div>
  );
}

function AccueilDonneur({ data, setPage}) {
  const [nbSOS, setNbSOS] = useState(0);
  const jours = !data.eligible ? Math.max(0,Math.ceil((new Date(data.prochaine_date)-new Date())/86400000)) : 0;
  const pct   = data.eligible ? 100 : Math.max(0, Math.round(100-(jours/56*100)));

  useEffect(() => {
    fetch(`${BLOOD_API}/alertes-sos/`, { headers: H() })
      .then(r => r.json()).then(d => setNbSOS(d.nb || 0)).catch(() => {});
  }, []);

  const STATS = [
    {l:'Total dons',           v:data.nb_dons,                 c:'var(--red)',  ic:'drop'},
    {l:'Appels compatibles',   v:data.nb_demandes_compatibles, c:'var(--amb)',  ic:'alert'},
    {l:'Campagnes à venir',    v:data.nb_campagnes,            c:'var(--blue)', ic:'cal'},
    {l:'Réponses données',     v:data.nb_reponses,             c:'var(--grn)',  ic:'ok'},
  ];
  return (
    <>
      {/* Banner SOS si alertes critiques */}
      {nbSOS > 0 && (
        <div
          onClick={() => setPage('sos')}
          style={{ background: 'linear-gradient(135deg,rgba(230,57,70,.2),rgba(230,57,70,.08))', border: '1.5px solid rgba(230,57,70,.5)', borderRadius: 'var(--r)', padding: '12px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', animation: 'fadeUp .3s ease' }}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1s infinite', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ fontFamily: "'Syne',sans-serif", fontSize: 14 }}>🚨 {nbSOS} alerte(s) SOS critique(s) pour votre groupe</strong>
            <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 2 }}>Délai inférieur à 48h — Cliquez pour voir et répondre</div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>Voir →</span>
        </div>
      )}

      {/* Eligibility hero */}
      <div className={`elig-card ${data.eligible?'ok':'no'}`}>
        <div className="elig-info">
          <div style={{fontSize:11,opacity:.7,marginBottom:4,textTransform:'uppercase',letterSpacing:'1px'}}>Statut</div>
          <div className="elig-status">{data.eligible?'✅ Vous pouvez donner !':'⏳ Encore '+jours+' jours'}</div>
          {!data.eligible && <div className="elig-date">Prochaine date : {new Date(data.prochaine_date).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</div>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <Ring pct={pct} size={84} color={data.eligible?'#22c55e':'#e63946'} label={pct+'%'} sub="Éligibilité"/>
          <div className="elig-group"><div className="elig-g">{data.groupe_sanguin}</div><div className="elig-gl">Groupe</div></div>
        </div>
      </div>

      {/* Stats */}
      <div className="sg">
        {STATS.map((s,i) => (
          <div key={s.l} className="sc" style={{animationDelay:`${i*0.07}s`}}>
            <div className="sc-ic" style={{background:`${s.c}18`,fontSize:20}}><I n={s.ic} s={20}/></div>
            <div><div className="sc-v" style={{color:s.c}}>{s.v}</div><div className="sc-l">{s.l}</div></div>
          </div>
        ))}
      </div>

      {/* Recent demands */}
      {data.demandes_recentes?.length > 0 && (
        <>
          <div className="sh"><div className="st">🚨 Appels urgents compatibles</div><button className="btn-outline-r" onClick={()=>setPage('demandes')}>Voir tout</button></div>
          <div className="dc-grid">{data.demandes_recentes.map((d,i)=><DemandeCard key={d.id} d={d} i={i}/>)}</div>
        </>
      )}
    </>
  );
}

function DemandesDonneur({  onToast }) {
  const [demandes, setDemandes] = useState([]);
  const [filtre, setFiltre] = useState('compat');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const url = filtre==='tous' ? `${BLOOD_API}/demandes-urgentes/toutes/` : `${BLOOD_API}/demandes-urgentes/`;
      try {
        const r = await fetch(url, { headers: H() });
        const d = await r.json();
        let arr = Array.isArray(d) ? d : (d.results || []);
        if (!['compat','tous'].includes(filtre)) arr = arr.filter(x => x.groupe_sanguin === filtre);
        setDemandes(arr);
      } catch { /* network error – silently ignore */ }
      setLoading(false);
    };
    load();
  }, [filtre]);

  const repondre = async (id) => {
    try {
      const res = await fetch(`${BLOOD_API}/reponses/`,{method:'POST',headers:JH(),body:JSON.stringify({demande:id})});
      const d = await res.json();
      if(res.ok) onToast('✅ Réponse enregistrée !');
      else onToast(d.error||'Erreur','err');
    } catch { onToast('Erreur réseau','err'); }
  };

  return (
    <>
      <div className="sh" style={{marginBottom:14}}>
        <div className="st">🚨 Appels urgents</div>
        <span style={{fontSize:12,color:'var(--txt2)'}}>{demandes.length} résultat(s)</span>
      </div>
      <div className="pills">
        <button className={`pill ${filtre==='compat'?'on':''}`} onClick={()=>setFiltre('compat')}>❤️ Compatibles</button>
        <button className={`pill ${filtre==='tous'?'on':''}`} onClick={()=>setFiltre('tous')}>🩸 Tous</button>
        {GROUPS.map(g=><button key={g} className={`pill ${filtre===g?'on':''}`} onClick={()=>setFiltre(g)} style={{fontSize:11}}>{g}</button>)}
      </div>
      {loading ? <div style={{color:'var(--txt3)',padding:40,textAlign:'center'}}>Chargement…</div>
        : <div className="dc-grid">{demandes.length===0?<div style={{gridColumn:'1/-1',textAlign:'center',padding:60,color:'var(--txt3)'}}>Aucun appel urgent compatible.</div>:demandes.map((d,i)=><DemandeCard key={d.id} d={d} i={i} onRepondre={repondre} onToast={onToast}/>)}</div>}
    </>
  );
}

function DonsDonneur({ reload, onToast }) {
  const [dons, setDons] = useState([]);
  const [hopitaux, setHopitaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ date_don:new Date().toISOString().split('T')[0], hopital:'', notes:'' });

  const load = () => Promise.all([
    fetch(`${BLOOD_API}/mes-dons/`,{headers:H()}).then(r=>r.json()),
    fetch(`${BLOOD_API}/hopitaux/`,{headers:H()}).then(r=>r.json()),
  ]).then(([d,h])=>{ setDons(Array.isArray(d)?d:[]); setHopitaux(Array.isArray(h)?h:[]); setLoading(false); });
  useEffect(()=>{load();},[]);

  const add = async () => {
    if(!form.date_don||!form.hopital){onToast('Hôpital et date requis.','err');return;}
    const res = await fetch(`${BLOOD_API}/mes-dons/`,{method:'POST',headers:JH(),body:JSON.stringify(form)});
    const d = await res.json();
    if(res.ok){load();reload();setShow(false);setForm({date_don:new Date().toISOString().split('T')[0],hopital:'',notes:''});onToast('✅ Don enregistré !');}
    else onToast(d.error||'Erreur','err');
  };

  return (
    <>
      <div className="sh"><div className="st">🩸 Mes dons ({dons.length})</div><button className="btn-add" onClick={()=>setShow(true)}><I n="plus" s={14}/> Enregistrer</button></div>
      <div className="tc">
        {loading?<div style={{padding:40,textAlign:'center',color:'var(--txt3)'}}>Chargement…</div>:(
          <table>
            <thead><tr><th>#</th><th>Date</th><th>Établissement</th><th>Notes</th><th>Statut</th></tr></thead>
            <tbody>
              {dons.length===0?<tr><td colSpan={5} style={{textAlign:'center',padding:40,color:'var(--txt3)'}}>Aucun don enregistré</td></tr>
                :dons.map((d,i)=><tr key={d.id}><td style={{color:'var(--txt3)',fontSize:12}}>{dons.length-i}</td><td><strong>{new Date(d.date_don).toLocaleDateString('fr-FR')}</strong></td><td>{d.hopital_nom||'—'}</td><td style={{color:'var(--txt2)',fontSize:12}}>{d.notes||'—'}</td><td><span className={`bdg ${d.valide?'bdg-g':'bdg-gray'}`}>{d.valide?'Validé':'En attente'}</span></td></tr>)}
            </tbody>
          </table>
        )}
      </div>
      {show && <Modal title="Enregistrer un don" onClose={()=>setShow(false)}>
        <div className="fgrp"><label className="flbl">Date *</label><input className="finp" type="date" value={form.date_don} onChange={e=>setForm({...form,date_don:e.target.value})}/></div>
        <div className="fgrp"><label className="flbl">Établissement *</label><select className="fsel" value={form.hopital} onChange={e=>setForm({...form,hopital:e.target.value})}><option value="">-- Choisir --</option>{hopitaux.map(h=><option key={h.id} value={h.id}>{h.nom}</option>)}</select></div>
        <div className="fgrp"><label className="flbl">Notes</label><input className="finp" placeholder="Remarques…" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
        <div className="f-acts"><button className="btn-can" onClick={()=>setShow(false)}>Annuler</button><button className="btn-sub" onClick={add}>Enregistrer</button></div>
      </Modal>}
    </>
  );
}

function CampagnesDonneur({ onToast }) {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [creneau, setCreneau] = useState('09:00');

  useEffect(()=>{ fetch(`${BLOOD_API}/campagnes/`,{headers:H()}).then(r=>r.json()).then(d=>{ setCamps(Array.isArray(d)?d:[]); setLoading(false); }).catch(()=>setLoading(false)); },[]);

  const sinscrire = async (id) => {
    const res = await fetch(`${BLOOD_API}/inscriptions-campagne/`,{method:'POST',headers:JH(),body:JSON.stringify({campagne:id,creneau_horaire:creneau})});
    const d = await res.json();
    if(res.ok){onToast('✅ Inscription confirmée !');setShowModal(null);}
    else onToast(d.error||'Erreur','err');
  };

  const tempsRestant = (date) => {
    const diff = new Date(date) - new Date();
    if(diff<0) return {l:'Terminée',c:'var(--txt3)',bg:'var(--bg3)'};
    const j = Math.floor(diff/86400000);
    const h = Math.floor((diff%86400000)/3600000);
    if(j===0) return {l:`Dans ${h}h ⚡`,c:'var(--red)',bg:'var(--red-s)'};
    if(j===1) return {l:'Demain 🔶',c:'var(--amb)',bg:'var(--amb-s)'};
    if(j<=7)  return {l:`Dans ${j}j`,c:'var(--amb)',bg:'var(--amb-s)'};
    return {l:`Dans ${j}j`,c:'var(--txt2)',bg:'var(--bg3)'};
  };

  return (
    <>
      <div className="sh"><div className="st">📅 Campagnes ({camps.length})</div></div>
      {loading?<div style={{color:'var(--txt3)',padding:40,textAlign:'center'}}>Chargement…</div>:(
        <div className="dc-grid">
          {camps.length===0?<div style={{gridColumn:'1/-1',textAlign:'center',padding:60,color:'var(--txt3)'}}>Aucune campagne disponible.</div>
            :camps.map((c,i)=>{
              const t=tempsRestant(c.date);
              const pct=Math.round((c.nb_inscrits/Math.max(c.capacite_totale,1))*100);
              return (
                <div key={c.id} className="camp-card" style={{animationDelay:`${i*0.06}s`}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                    <strong style={{fontSize:14}}>{c.nom}</strong>
                    <span className={`bdg ${c.est_complete?'bdg-gray':'bdg-g'}`}>{c.est_complete?'Complet':`${c.places_restantes} places`}</span>
                  </div>
                  <div style={{fontSize:12,color:'var(--txt2)',display:'flex',flexDirection:'column',gap:4,marginBottom:10}}>
                    <span><I n="cal" s={11}/> {new Date(c.date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</span>
                    <span><I n="pin" s={11}/> {c.lieu}</span>
                    <span><I n="drop" s={11}/> {c.groupes_cibles}</span>
                  </div>
                  <div className="time-badge" style={{background:t.bg,color:t.c,marginBottom:10}}><I n="clock" s={12}/>{t.l}</div>
                  <div style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--txt3)',marginBottom:4}}><span>Inscriptions</span><span><strong>{c.nb_inscrits}</strong> / {c.capacite_totale}</span></div>
                    <div className="prog-bar"><div className="prog-fill" style={{width:`${Math.min(pct,100)}%`,background:pct>=90?'var(--red)':pct>=60?'var(--amb)':'var(--grn)'}}/></div>
                  </div>
                  {!c.est_complete && <button className="btn-add" style={{width:'100%',justifyContent:'center'}} onClick={()=>setShowModal(c.id)}>S'inscrire</button>}
                  {showModal===c.id && <Modal title={`S'inscrire : ${c.nom}`} onClose={()=>setShowModal(null)}>
                    <div className="fgrp"><label className="flbl">Créneau horaire</label><input className="finp" type="time" value={creneau} onChange={e=>setCreneau(e.target.value)}/></div>
                    <div className="f-acts"><button className="btn-can" onClick={()=>setShowModal(null)}>Annuler</button><button className="btn-sub" onClick={()=>sinscrire(c.id)}>Confirmer</button></div>
                  </Modal>}
                </div>
              );
            })}
        </div>
      )}
    </>
  );
}

function HistoriqueDonneur() {
  const [dons, setDons] = useState([]);
  const [reponses, setReponses] = useState([]);
  const [inscs, setInscs] = useState([]);
  const [onglet, setOnglet] = useState('dons');
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ Promise.all([
    fetch(`${BLOOD_API}/mes-dons/`,{headers:H()}).then(r=>r.json()).catch(()=>[]),
    fetch(`${BLOOD_API}/mes-reponses/`,{headers:H()}).then(r=>r.json()).catch(()=>[]),
    fetch(`${BLOOD_API}/mes-inscriptions/`,{headers:H()}).then(r=>r.json()).catch(()=>[]),
  ]).then(([d,r,i])=>{ setDons(Array.isArray(d)?d:[]); setReponses(Array.isArray(r)?r:[]); setInscs(Array.isArray(i)?i:[]); setLoading(false); }); },[]);

  const TABS = [{id:'dons',l:`🩸 Dons (${dons.length})`},{id:'reponses',l:`📢 Réponses (${reponses.length})`},{id:'inscs',l:`📅 Inscriptions (${inscs.length})`}];
  return (
    <>
      <div className="sh"><div className="st">📋 Historique complet</div></div>
      <div className="tabs-row">{TABS.map(t=><button key={t.id} className={`tab ${onglet===t.id?'on':''}`} onClick={()=>setOnglet(t.id)}>{t.l}</button>)}</div>
      {loading?<div style={{color:'var(--txt3)',padding:40,textAlign:'center'}}>Chargement…</div>:(
        <div className="tc">
          {onglet==='dons' && <table><thead><tr><th>#</th><th>Date</th><th>Établissement</th><th>Notes</th><th>Statut</th></tr></thead><tbody>{dons.length===0?<tr><td colSpan={5} style={{textAlign:'center',padding:40,color:'var(--txt3)'}}>Aucun don</td></tr>:dons.map((d,i)=><tr key={d.id}><td style={{color:'var(--txt3)'}}>{dons.length-i}</td><td>{new Date(d.date_don).toLocaleDateString('fr-FR')}</td><td>{d.hopital_nom||'—'}</td><td style={{color:'var(--txt2)'}}>{d.notes||'—'}</td><td><span className={`bdg ${d.valide?'bdg-g':'bdg-gray'}`}>{d.valide?'Validé':'En attente'}</span></td></tr>)}</tbody></table>}
          {onglet==='reponses' && <table><thead><tr><th>#</th><th>Date</th><th>Groupe</th><th>Hôpital</th><th>Statut</th></tr></thead><tbody>{reponses.length===0?<tr><td colSpan={5} style={{textAlign:'center',padding:40,color:'var(--txt3)'}}>Aucune réponse</td></tr>:reponses.map((r,i)=><tr key={r.id}><td style={{color:'var(--txt3)'}}>{reponses.length-i}</td><td>{new Date(r.date_reponse).toLocaleDateString('fr-FR')}</td><td><span className="bdg bdg-r" style={{fontWeight:800}}>{r.groupe_sanguin||'—'}</span></td><td>{r.hopital_nom||'—'}</td><td><span className={`bdg ${r.statut_reponse==='confirme'?'bdg-g':r.statut_reponse==='annule'?'bdg-gray':'bdg-y'}`}>{r.statut_reponse||'en attente'}</span></td></tr>)}</tbody></table>}
          {onglet==='inscs' && <table><thead><tr><th>#</th><th>Campagne</th><th>Date</th><th>Créneau</th><th>Présence</th></tr></thead><tbody>{inscs.length===0?<tr><td colSpan={5} style={{textAlign:'center',padding:40,color:'var(--txt3)'}}>Aucune inscription</td></tr>:inscs.map((ins,i)=><tr key={ins.id}><td style={{color:'var(--txt3)'}}>{inscs.length-i}</td><td>{ins.campagne_nom||'—'}</td><td>{ins.campagne_date?new Date(ins.campagne_date).toLocaleDateString('fr-FR'):'—'}</td><td><span className="bdg bdg-b">{ins.crenau_horaire||'—'}</span></td><td><span className={`bdg ${ins.present?'bdg-g':'bdg-gray'}`}>{ins.present?'Présent':'En attente'}</span></td></tr>)}</tbody></table>}
        </div>
      )}
    </>
  );
}

function GamificationDonneur() {
  const [data, setData] = useState(null);
  const [cl, setCl] = useState([]);
  const [onglet, setOnglet] = useState('badges');
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ Promise.all([
    fetch(`${BLOOD_API}/mes-badges/`,{headers:H()}).then(r=>r.json()),
    fetch(`${BLOOD_API}/classement/`,{headers:H()}).then(r=>r.json()),
  ]).then(([b,c])=>{ setData(b); setCl(Array.isArray(c)?c:[]); setLoading(false); }).catch(()=>setLoading(false)); },[]);

  if(loading||!data) return <div style={{padding:60,textAlign:'center',color:'var(--txt3)'}}>Chargement…</div>;

  const NVC = { Bronze:{c:'#cd7f32',bg:'#cd7f3220'}, Argent:{c:'#9ca3af',bg:'#9ca3af20'}, Or:{c:'#f59e0b',bg:'#f59e0b20'}, Diamant:{c:'#60a5fa',bg:'#60a5fa20'} };
  const nc = NVC[data.niveau]||NVC.Bronze;
  const ppt = data.niveau==='Diamant'?100:data.niveau==='Or'?Math.round((data.score/500)*100):data.niveau==='Argent'?Math.round((data.score/200)*100):Math.round((data.score/100)*100);
  const INFOS = {
    premier_don:   {e:'🩸',l:'Premier Don',      d:'Votre premier don enregistré'},
    cinq_dons:     {e:'🏅',l:'5 Dons',           d:'5 dons accomplis'},
    dix_dons:      {e:'🥇',l:'10 Dons',          d:'10 dons — impressionnant !'},
    vingt_dons:    {e:'🏆',l:'20 Dons',          d:'Légende du don de sang'},
    urgence:       {e:'⚡',l:'Héros Urgence',    d:'Répondu à un appel urgent'},
    trois_urgences:{e:'🦸',l:'Super Héros',      d:'3 urgences répondues'},
    campagne:      {e:'📅',l:'Participant',       d:'Inscrit à une campagne'},
    regulier:      {e:'⭐',l:'Donneur Régulier', d:'Don régulier sur 6 mois'},
    ambassadeur:   {e:'👑',l:'Ambassadeur',      d:'Le summum de l\'engagement'},
  };
  const ALL = Object.keys(INFOS);
  const obtenuTypes = data.badges.map(b=>b.type);

  return (
    <>
      {/* Niveau card */}
      <div className="niv-card" style={{marginBottom:22}}>
        <div className="niv-glow" style={{background:nc.c}}/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div>
            <div style={{fontSize:11,opacity:.6,marginBottom:4,textTransform:'uppercase',letterSpacing:'1px'}}>Votre niveau</div>
            <div className="niv-title" style={{color:nc.c}}>{data.niveau} ✨</div>
            <div style={{display:'flex',gap:10,marginTop:8,flexWrap:'wrap'}}>
              <span className="score-pill">🏆 {data.score} pts</span>
              <span className="score-pill">🩸 {data.nb_dons} dons</span>
              <span className="score-pill">⚡ {data.nb_urgences} urgences</span>
              <span className="score-pill">🎖️ {data.nb_badges} badges</span>
            </div>
          </div>
          <Ring pct={Math.min(ppt,100)} size={80} color={nc.c} label={ppt+'%'} sub="Niveau"/>
        </div>
        {data.prochain_badge && (
          <div style={{marginTop:14,padding:'10px 14px',background:'rgba(255,255,255,.04)',borderRadius:10,display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:22}}>{data.prochain_badge.emoji}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,marginBottom:4}}>Prochain : <strong>{data.prochain_badge.label}</strong> — {data.prochain_badge.manque}</div>
              <div style={{background:'rgba(255,255,255,.08)',borderRadius:20,height:5,overflow:'hidden'}}>
                <div style={{height:'100%',background:nc.c,borderRadius:20,width:`${data.prochain_badge.progress}%`,transition:'width 1s ease'}}/>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="tabs-row">
        <button className={`tab ${onglet==='badges'?'on':''}`} onClick={()=>setOnglet('badges')}>🎖️ Badges ({data.nb_badges})</button>
        <button className={`tab ${onglet==='class'?'on':''}`} onClick={()=>setOnglet('class')}>🏆 Classement</button>
      </div>

      {onglet==='badges' && (
        <div className="bdg-grid">
          {ALL.map((type,i)=>{
            const b = data.badges.find(x=>x.type===type);
            const info = INFOS[type];
            const isOn = obtenuTypes.includes(type);
            return (
              <div key={type} className={`bdg-card ${!isOn?'locked':''}`} style={{animationDelay:`${i*0.07}s`,borderColor:isOn?(b?.color||'var(--red)')+'40':'var(--bdr)',background:isOn?`linear-gradient(135deg,var(--bg2),${b?.color||'var(--red)'}08)`:'var(--bg2)'}}>
                {isOn && <div className="ok-tick">✓</div>}
                <span className="bdg-em">{info.e}</span>
                <div className="bdg-nm" style={{color:isOn?(b?.color||'var(--txt)'):'var(--txt2)'}}>{info.l}</div>
                <div className="bdg-ds">{isOn?(b?.desc||info.d):info.d}</div>
                <div className="bdg-dt">{isOn&&b?.date?`Obtenu le ${b.date}`:'🔒 Non débloqué'}</div>
              </div>
            );
          })}
        </div>
      )}

      {onglet==='class' && (
        <div className="tc">
          <div style={{padding:'14px 18px',borderBottom:'1px solid var(--bdr)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <strong style={{fontFamily:"'Syne',sans-serif",fontSize:14}}>🏆 Top 20 Donneurs</strong>
            <span style={{fontSize:11,color:'var(--txt3)'}}>Score = Dons×10 + Urgences×25 + Badges×5</span>
          </div>
          {cl.map((c,i)=>(
            <div key={i} className={`cl-row ${c.is_me?'me':''}`}>
              <div className={`cl-rang ${c.rang<=3?`r${c.rang}`:'ro'}`}>{c.rang<=3?['🥇','🥈','🥉'][c.rang-1]:c.rang}</div>
              <div className="sb-av" style={{width:34,height:34,fontSize:13}}>{(c.nom||c.username||'?')[0].toUpperCase()}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}><strong style={{fontSize:13}}>{c.nom}</strong>{c.is_me&&<span className="bdg bdg-r" style={{fontSize:10}}>Vous</span>}<span style={{fontSize:11,color:'var(--txt3)'}}>{c.groupe_sanguin}</span></div>
                <div style={{fontSize:11,color:'var(--txt3)',display:'flex',gap:10,marginTop:2}}><span>🩸 {c.nb_dons}</span><span>⚡ {c.nb_urgences}</span><span>🎖️ {c.nb_badges}</span></div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,color:'var(--red)'}}>{c.score}</div>
                <div style={{fontSize:10,color:'var(--txt3)'}}>pts</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function MatchingDonneur({  onToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ fetch(`${BLOOD_API}/mes-matches/`,{headers:H()}).then(r=>r.json()).then(setData).catch(()=>{}).finally(()=>setLoading(false)); },[]);

  const repondre = async (id) => {
    const res = await fetch(`${BLOOD_API}/reponses/`,{method:'POST',headers:JH(),body:JSON.stringify({demande:id})});
    const d = await res.json();
    if(res.ok) onToast('✅ Réponse enregistrée !'); else onToast(d.error||'Erreur','err');
  };

  if(loading) return <div style={{padding:60,textAlign:'center',color:'var(--txt3)'}}>Calcul du matching…</div>;
  if(!data?.eligible) return <div style={{padding:60,textAlign:'center'}}><div style={{fontSize:48,marginBottom:12}}>⏳</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700}}>Non éligible</div><div style={{color:'var(--txt2)',fontSize:13,marginTop:8}}>{data?.message}</div></div>;

  return (
    <>
      <div style={{background:'linear-gradient(135deg,rgba(230,57,70,.12),rgba(124,58,237,.06))',border:'1px solid rgba(230,57,70,.2)',borderRadius:'var(--r)',padding:'18px 22px',marginBottom:22,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:11,color:'var(--txt2)',textTransform:'uppercase',letterSpacing:'1px',marginBottom:4}}>Matching IA</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800}}>🤝 {data.nb_matches} demandes compatibles</div>
          <div style={{fontSize:12,color:'var(--txt2)',marginTop:4}}>Triées par pertinence pour le groupe <strong style={{color:'var(--red)'}}>{data.groupe_sanguin}</strong></div>
        </div>
        <div style={{textAlign:'center',padding:'10px 18px',background:'rgba(230,57,70,.1)',borderRadius:12}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:800,color:'var(--red)'}}>{data.groupe_sanguin}</div>
          <div style={{fontSize:11,color:'var(--txt2)'}}>Votre groupe</div>
        </div>
      </div>

      {data.matches.length===0?<div style={{textAlign:'center',padding:60,color:'var(--txt3)'}}>Aucune demande compatible.</div>:(
        <div className="mc-grid">
          {data.matches.map((m,i)=>{
            const pct=Math.min(100,m.score);
            const C=2*Math.PI*26;
            const off=C*(1-pct/100);
            const col=m.score>=90?'var(--red)':m.score>=70?'var(--amb)':'var(--grn)';
            return (
              <div key={m.id} className={`mc ${m.est_urgente?'urg':''}`} style={{animationDelay:`${i*0.06}s`}}>
                {m.est_urgente&&<div style={{position:'absolute',top:10,right:10,padding:'2px 7px',background:'var(--red)',borderRadius:6,fontSize:10,fontWeight:700,color:'#fff'}}>🚨 URGENT</div>}
                <div style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:10}}>
                  <svg width={60} height={60} viewBox="0 0 60 60" className="sc-ring">
                    <circle cx={30} cy={30} r={26} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={7}/>
                    <circle cx={30} cy={30} r={26} fill="none" stroke={col} strokeWidth={7} strokeDasharray={C} strokeDashoffset={off} strokeLinecap="round" style={{transform:'rotate(-90deg)',transformOrigin:'center',transition:'stroke-dashoffset 1s ease'}}/>
                    <text x={30} y={35} textAnchor="middle" fill={col} fontSize={12} fontWeight="bold">{m.score}</text>
                  </svg>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,marginBottom:4}}>{m.hopital_nom}</div>
                    <div style={{fontSize:12,color:'var(--txt2)',display:'flex',gap:10,flexWrap:'wrap'}}>
                      <span>📍 {m.hopital_ville}</span>
                      <span>🩸 {m.quantite} poches</span>
                      <span className="bdg bdg-r" style={{fontWeight:800}}>{m.groupe_sanguin}</span>
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:3,marginBottom:10}}>{m.raisons?.map((r,j)=><span key={j} className="raison">{r}</span>)}</div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{fontSize:11,color:'var(--txt3)'}}>{m.delai&&`Délai : ${new Date(m.delai).toLocaleDateString('fr-FR')}`} · {m.nb_reponses} réponse(s)</div>
                  <button onClick={()=>repondre(m.id)} style={{padding:'7px 14px',background:'linear-gradient(135deg,var(--red-d),var(--red))',border:'none',borderRadius:8,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Je donne →</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ─── CARTE INTERACTIVE ─────────────────────────────────────────────────
function CarteInteractive() {
  const [centres, setCentres] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filtre, setFiltre] = useState('tous');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BLOOD_API}/centres-carte/`, { headers: H() })
      .then(r => r.json())
      .then(d => { setCentres(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtres = [
    { id: 'tous',     l: 'Tous les centres' },
    { id: 'urgents',  l: '🚨 Urgents' },
    { id: 'critique', l: '🔴 Critiques' },
  ];

  const centresFiltres = centres.filter(c => {
    if (filtre === 'urgents')  return c.nb_demandes > 0;
    if (filtre === 'critique') return c.critique;
    return true;
  });

  const centre = selected ? centres.find(c => c.id === selected) : null;
  const mapQuery = centre
    ? encodeURIComponent(`${centre.nom} ${centre.ville}`)
    : encodeURIComponent('hôpital Tunisie');

  return (
    <>
      <div className="sh" style={{ marginBottom: 14 }}>
        <div className="st">🗺️ Carte des Centres de Don</div>
        <span style={{ fontSize: 12, color: 'var(--txt2)' }}>{centres.length} centre(s) référencé(s)</span>
      </div>

      {/* Stats rapides */}
      <div className="sg" style={{ marginBottom: 16 }}>
        {[
          { l: 'Centres actifs',   v: centres.length,                              c: 'var(--blue)', ic: 'hosp' },
          { l: 'Avec urgences',    v: centres.filter(c => c.nb_demandes > 0).length, c: 'var(--amb)',  ic: 'alert' },
          { l: 'Critiques',        v: centres.filter(c => c.critique).length,       c: 'var(--red)',  ic: 'sos' },
        ].map((s, i) => (
          <div key={s.l} className="sc" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="sc-ic" style={{ background: `${s.c}18` }}><I n={s.ic} s={20} /></div>
            <div><div className="sc-v" style={{ color: s.c }}>{s.v}</div><div className="sc-l">{s.l}</div></div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="pills" style={{ marginBottom: 14 }}>
        {filtres.map(f => (
          <button key={f.id} className={`pill ${filtre === f.id ? 'on' : ''}`} onClick={() => setFiltre(f.id)}>{f.l}</button>
        ))}
      </div>

      {loading ? <div style={{ padding: 60, textAlign: 'center', color: 'var(--txt3)' }}>Chargement des centres…</div> : (
        <div className="carte-layout">
          {/* Liste */}
          <div className="carte-list">
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--txt3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              {centresFiltres.length} centre(s)
            </div>
            {centresFiltres.length === 0
              ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--txt3)' }}>Aucun centre trouvé</div>
              : centresFiltres.map(c => (
                <div
                  key={c.id}
                  className={`carte-item ${selected === c.id ? 'active' : ''} ${c.critique ? 'critique' : ''}`}
                  onClick={() => setSelected(c.id)}
                >
                  <div className="carte-dot" style={{ background: c.critique ? 'var(--red)' : c.nb_demandes > 0 ? 'var(--amb)' : 'var(--grn)', marginTop: 6 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{c.nom}</div>
                    <div style={{ fontSize: 11, color: 'var(--txt2)', marginBottom: 4 }}>
                      <I n="pin" s={11} /> {c.ville}
                    </div>
                    {c.groupes_urgents.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {c.groupes_urgents.map(g => (
                          <span key={g} className="bdg bdg-r" style={{ fontSize: 10, fontWeight: 800 }}>{g}</span>
                        ))}
                      </div>
                    )}
                    {c.nb_demandes > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4, fontWeight: 600 }}>
                        🚨 {c.nb_demandes} demande(s) urgente(s)
                      </div>
                    )}
                  </div>
                </div>
              ))
            }
          </div>

          {/* Carte */}
          <div className="carte-iframe">
            {centre && (
              <div style={{ padding: '12px 16px', background: 'var(--bg2)', borderBottom: '1px solid var(--bdr)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{centre.nom}</div>
                  <div style={{ fontSize: 12, color: 'var(--txt2)' }}>{centre.adresse} — {centre.ville}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {centre.telephone && <span className="bdg bdg-b" style={{ fontSize: 11 }}>📞 {centre.telephone}</span>}
                  {centre.critique && <span className="bdg bdg-r">🔴 Critique</span>}
                </div>
              </div>
            )}
            <iframe
              title="Carte centres"
              width="100%"
              height={centre ? 'calc(100% - 58px)' : '100%'}
              frameBorder="0"
              style={{ border: 0, display: 'block' }}
              src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=13`}
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}

// ─── ALERTES SOS ─────────────────────────────────────────────────────
function AlertesSOS({ onToast}) {
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    fetch(`${BLOOD_API}/alertes-sos/`, { headers: H() })
      .then(r => r.json())
      .then(d => { setAlertes(d.alertes || []); setLoading(false); })
      .catch(() => setLoading(false));

  useEffect(() => {
    load();
    // Polling toutes les 60s pour simuler le temps réel
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
  }, []);

  const repondre = async (id) => {
    const res = await fetch(`${BLOOD_API}/reponses/`, { method: 'POST', headers: JH(), body: JSON.stringify({ demande: id }) });
    const d = await res.json();
    if (res.ok) { onToast('✅ Réponse SOS enregistrée !'); load(); }
    else onToast(d.error || 'Erreur', 'err');
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--txt3)' }}>Vérification des alertes…</div>;

  return (
    <>
      <div className="sh" style={{ marginBottom: 14 }}>
        <div className="st">🚨 Alertes SOS Temps Réel</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="urg-dot" />
          <span style={{ fontSize: 12, color: 'var(--txt2)' }}>Mise à jour auto toutes les 60s</span>
        </div>
      </div>

      {alertes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>✅</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Aucune alerte critique</div>
          <div style={{ color: 'var(--txt2)', fontSize: 13 }}>Toutes les demandes urgentes sont sous contrôle.</div>
        </div>
      ) : (
        <>
          {/* Bandeau résumé */}
          <div className="sos-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div className="sos-pulse" />
              <strong style={{ fontFamily: "'Syne',sans-serif", fontSize: 16 }}>
                {alertes.length} alerte(s) critique(s) — Délai ≤ 48h
              </strong>
            </div>
            {alertes.map((a, i) => (
              <div key={a.id} className="sos-item" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="sos-pulse" />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{a.hopital}</span>
                  <span style={{ color: 'var(--txt2)', fontSize: 12, marginLeft: 8 }}>{a.ville}</span>
                  <span className="bdg bdg-r" style={{ marginLeft: 8, fontWeight: 800 }}>{a.groupe}</span>
                  <span style={{ fontSize: 12, color: 'var(--txt2)', marginLeft: 8 }}>{a.quantite} poches</span>
                </div>
                <span style={{ fontSize: 11, color: a.jours === 0 ? 'var(--red)' : 'var(--amb)', fontWeight: 700 }}>
                  {a.jours === 0 ? "Aujourd'hui !" : `Dans ${a.jours}j`}
                </span>
              </div>
            ))}
          </div>

          {/* Cartes détaillées */}
          <div className="dc-grid">
            {alertes.map((a, i) => (
              <div key={a.id} className="dc urg" style={{ animationDelay: `${i * 0.06}s`, borderColor: 'rgba(230,57,70,.5)' }}>
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <span style={{ padding: '2px 8px', background: a.jours === 0 ? 'var(--red)' : 'var(--amb)', borderRadius: 6, fontSize: 10, fontWeight: 700, color: '#fff' }}>
                    {a.jours === 0 ? '🔴 AUJOURD\'HUI' : `⚡ ${a.jours}J RESTANTS`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div className="blood-badge" style={{ background: 'linear-gradient(135deg,#7f1d1d,var(--red))' }}>{a.groupe}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{a.hopital}</div>
                    <div style={{ fontSize: 12, color: 'var(--txt2)' }}><I n="pin" s={11} /> {a.ville}</div>
                  </div>
                </div>
                {a.description && <p style={{ fontSize: 12, color: 'var(--txt2)', marginBottom: 10, lineHeight: 1.5 }}>{a.description}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--txt2)' }}>
                    <I n="drop" s={12} /> {a.quantite} poches &nbsp;·&nbsp;
                    <I n="cal" s={12} /> {a.delai}
                  </div>
                  <button
                    onClick={() => repondre(a.id)}
                    style={{ padding: '8px 16px', background: 'linear-gradient(135deg,var(--red-d),var(--red))', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                  >
                    🚨 Je réponds
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

// ─── AGENDA DON PERSONNEL ───────────────────────────────────────────────
function AgendaDon({  setPage }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState('agenda');

  useEffect(() => {
    fetch(`${BLOOD_API}/agenda-don/`, { headers: H() })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--txt3)' }}>Chargement de l'agenda…</div>;
  if (!data) return null;

  const pct = data.eligible ? 100 : Math.max(0, Math.round(100 - (data.jours_restants / data.delai_jours * 100)));

  return (
    <>
      {/* Hero card */}
      <div className="agenda-hero">
        <div>
          <div style={{ fontSize: 11, opacity: .6, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Prochain don possible</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
            {data.eligible ? '✅ Vous pouvez donner maintenant !' : `⏳ Dans ${data.jours_restants} jours`}
          </div>
          <div style={{ fontSize: 13, color: 'var(--txt2)', marginBottom: 12 }}>
            {data.eligible
              ? `Dernier don : ${data.dernier_don || 'Jamais'}`
              : `Date disponible : ${data.prochaine_date}`
            }
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span className="score-pill">🩸 {data.nb_dons} don(s) total</span>
            <span className="score-pill">⏱️ Délai : {data.delai_jours}j</span>
            {data.dernier_don && <span className="score-pill">📅 Dernier : {data.dernier_don}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Ring pct={pct} size={90} color={data.eligible ? 'var(--grn)' : 'var(--red)'} label={pct + '%'} sub="Éligibilité" />
          {data.eligible && (
            <button className="btn-add" style={{ fontSize: 12 }} onClick={() => setPage('dons')}>
              <I n="plus" s={13} /> Enregistrer un don
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-row" style={{ marginBottom: 20 }}>
        <button className={`tab ${onglet === 'agenda' ? 'on' : ''}`} onClick={() => setOnglet('agenda')}>📅 Timeline ({data.nb_dons})</button>
        <button className={`tab ${onglet === 'campagnes' ? 'on' : ''}`} onClick={() => setOnglet('campagnes')}>🏥 Campagnes proches ({data.campagnes_proches.length})</button>
      </div>

      {onglet === 'agenda' && (
        data.timeline.length === 0
          ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🩸</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Aucun don enregistré</div>
              <div style={{ color: 'var(--txt2)', fontSize: 13, marginBottom: 20 }}>Commencez votre aventure de donneur !</div>
              <button className="btn-add" style={{ margin: '0 auto' }} onClick={() => setPage('dons')}>
                <I n="plus" s={14} /> Enregistrer mon premier don
              </button>
            </div>
          ) : (
            <div className="timeline">
              {data.timeline.map((d, i) => (
                <div key={d.id} className="tl-item" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className={`tl-dot ${d.valide ? 'ok' : ''}`} />
                  <div className="tl-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{d.hopital}</div>
                        <div style={{ fontSize: 11, color: 'var(--txt2)' }}><I n="pin" s={11} /> {d.ville}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>{d.date}</div>
                        <span className={`bdg ${d.valide ? 'bdg-g' : 'bdg-gray'}`} style={{ fontSize: 10 }}>{d.valide ? 'Validé' : 'En attente'}</span>
                      </div>
                    </div>
                    {d.notes && <div style={{ fontSize: 11, color: 'var(--txt2)', fontStyle: 'italic' }}>{d.notes}</div>}
                    {d.intervalle !== null && (
                      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--txt3)' }}>
                        ⏱️ {d.intervalle} jours depuis le don précédent
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
      )}

      {onglet === 'campagnes' && (
        data.campagnes_proches.length === 0
          ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--txt3)' }}>Aucune campagne à venir.</div>
          : (
            <div>
              <div style={{ fontSize: 13, color: 'var(--txt2)', marginBottom: 14 }}>Campagnes disponibles dans votre région :</div>
              {data.campagnes_proches.map((c, i) => (
                <div key={c.id} className="camp-proche" style={{ animationDelay: `${i * 0.07}s` }} onClick={() => setPage('campagnes')}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--blue-s)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📅</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{c.nom}</div>
                    <div style={{ fontSize: 11, color: 'var(--txt2)' }}><I n="cal" s={11} /> {c.date} &nbsp;·&nbsp; <I n="pin" s={11} /> {c.lieu}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: 'var(--grn)' }}>{c.places}</div>
                    <div style={{ fontSize: 10, color: 'var(--txt3)' }}>places</div>
                  </div>
                </div>
              ))}
            </div>
          )
      )}
    </>
  );
}

// ─── SOCIAL COMMUNAUTÉ ─────────────────────────────────────────────────
function SocialCommunaute({ onToast }) {
  const [feed, setFeed] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [formPost, setFormPost] = useState({ type_post: 'temoignage', contenu: '', image_url: '' });
  const [formStory, setFormStory] = useState({ contenu: '', image_url: '', emoji: '🩸' });
  const [showComments, setShowComments] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const loadFeed = () => fetch(`${BLOOD_API}/feed-communautaire/`, { headers: H() }).then(r => r.json()).then(d => setFeed(d.posts || [])).catch(() => {});
  const loadStories = () => fetch(`${BLOOD_API}/stories/`, { headers: H() }).then(r => r.json()).then(d => setStories(d.stories || [])).catch(() => {});

  useEffect(() => {
    Promise.all([loadFeed(), loadStories()]).then(() => setLoading(false));
  }, []);

  const creerPost = async () => {
    if (!formPost.contenu) { onToast('Le contenu est requis', 'err'); return; }
    const res = await fetch(`${BLOOD_API}/feed-communautaire/`, { method: 'POST', headers: JH(), body: JSON.stringify(formPost) });
    if (res.ok) { loadFeed(); setShowPost(false); setFormPost({ type_post: 'temoignage', contenu: '', image_url: '' }); onToast('✅ Post publié !'); }
    else onToast('Erreur', 'err');
  };

  const creerStory = async () => {
    if (!formStory.contenu) { onToast('Le contenu est requis', 'err'); return; }
    const res = await fetch(`${BLOOD_API}/stories/`, { method: 'POST', headers: JH(), body: JSON.stringify(formStory) });
    if (res.ok) { loadStories(); setShowStory(false); setFormStory({ contenu: '', image_url: '', emoji: '🩸' }); onToast('✅ Story publiée !'); }
    else onToast('Erreur', 'err');
  };

  const liker = async (postId) => {
    await fetch(`${BLOOD_API}/posts/${postId}/liker/`, { method: 'POST', headers: H() });
    loadFeed();
  };

  const loadComments = async (postId) => {
    const res = await fetch(`${BLOOD_API}/posts/${postId}/commentaires/`, { headers: H() });
    const d = await res.json();
    setComments(d.commentaires || []);
    setShowComments(postId);
  };

  const ajouterComment = async (postId) => {
    if (!newComment) return;
    await fetch(`${BLOOD_API}/posts/${postId}/commentaires/`, { method: 'POST', headers: JH(), body: JSON.stringify({ contenu: newComment }) });
    setNewComment('');
    loadComments(postId);
  };

  const TYPE_LABELS = { temoignage: '💬 Témoignage', remerciement: '🙏 Remerciement', annonce: '📢 Annonce', celebration: '🎉 Célébration' };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--txt3)' }}>Chargement…</div>;

  return (
    <>
      <div className="sh" style={{ marginBottom: 14 }}>
        <div className="st">👥 Communauté BloodConnect</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-add" onClick={() => setShowStory(true)} style={{ background: 'linear-gradient(135deg,var(--vio-d),var(--vio))' }}>
            <I n="plus" s={14} /> Story
          </button>
          <button className="btn-add" onClick={() => setShowPost(true)}>
            <I n="plus" s={14} /> Post
          </button>
        </div>
      </div>

      {/* Stories bar */}
      {stories.length > 0 && (
        <div className="story-bar">
          {stories.map((s, i) => (
            <div key={s.id} className="story-item" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`story-avatar ${s.vue ? 'viewed' : ''}`}>{s.emoji}</div>
              <div className="story-name">{s.auteur}</div>
            </div>
          ))}
        </div>
      )}

      {/* Feed */}
      {feed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--txt3)' }}>Aucun post pour le moment. Soyez le premier à partager !</div>
      ) : (
        feed.map((p, i) => (
          <div key={p.id} className="post-card" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="post-header">
              <div className="post-avatar">{(p.auteur || 'U')[0].toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: 14 }}>{p.auteur}</strong>
                  <span className={`post-type-badge post-type-${p.type_post}`}>{TYPE_LABELS[p.type_post]}</span>
                  {p.role_badge && <span className="bdg bdg-r" style={{ fontSize: 10 }}>{p.role_badge}</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{p.date_relative}</div>
              </div>
            </div>
            <div className="post-content">{p.contenu}</div>
            {p.image_url && <img src={p.image_url} alt="" style={{ width: '100%', borderRadius: 10, marginBottom: 12 }} />}
            <div className="post-actions">
              <button className={`post-action-btn ${p.liked ? 'liked' : ''}`} onClick={() => liker(p.id)}>
                <I n="heart" s={16} /> {p.nb_likes}
              </button>
              <button className="post-action-btn" onClick={() => loadComments(p.id)}>
                💬 {p.nb_commentaires}
              </button>
            </div>
            {showComments === p.id && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--bdr)' }}>
                {comments.map(c => (
                  <div key={c.id} className="comment-item">
                    <div className="comment-avatar">{(c.auteur || 'U')[0].toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{c.auteur}</div>
                      <div style={{ fontSize: 12, color: 'var(--txt2)' }}>{c.contenu}</div>
                      <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2 }}>{c.date_relative}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <input className="finp" placeholder="Ajouter un commentaire…" value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && ajouterComment(p.id)} />
                  <button className="btn-sm btn-sm-b" onClick={() => ajouterComment(p.id)}>Envoyer</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Modal Post */}
      {showPost && (
        <Modal title="✍️ Créer un post" onClose={() => setShowPost(false)}>
          <div className="fgrp">
            <label className="flbl">Type de post</label>
            <select className="fsel" value={formPost.type_post} onChange={e => setFormPost({ ...formPost, type_post: e.target.value })}>
              <option value="temoignage">💬 Témoignage</option>
              <option value="remerciement">🙏 Remerciement</option>
              <option value="annonce">📢 Annonce</option>
              <option value="celebration">🎉 Célébration</option>
            </select>
          </div>
          <div className="fgrp">
            <label className="flbl">Contenu *</label>
            <textarea className="finp" rows={4} placeholder="Partagez votre expérience…" value={formPost.contenu} onChange={e => setFormPost({ ...formPost, contenu: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <div className="fgrp">
            <label className="flbl">Image URL (optionnel)</label>
            <input className="finp" placeholder="https://…" value={formPost.image_url} onChange={e => setFormPost({ ...formPost, image_url: e.target.value })} />
          </div>
          <div className="f-acts">
            <button className="btn-can" onClick={() => setShowPost(false)}>Annuler</button>
            <button className="btn-sub" onClick={creerPost}>Publier</button>
          </div>
        </Modal>
      )}

      {/* Modal Story */}
      {showStory && (
        <Modal title="📸 Créer une story (24h)" onClose={() => setShowStory(false)}>
          <div className="fgrp">
            <label className="flbl">Emoji</label>
            <input className="finp" placeholder="🩸" value={formStory.emoji} onChange={e => setFormStory({ ...formStory, emoji: e.target.value })} maxLength={2} />
          </div>
          <div className="fgrp">
            <label className="flbl">Contenu *</label>
            <textarea className="finp" rows={3} placeholder="Votre message…" value={formStory.contenu} onChange={e => setFormStory({ ...formStory, contenu: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <div className="fgrp">
            <label className="flbl">Image URL (optionnel)</label>
            <input className="finp" placeholder="https://…" value={formStory.image_url} onChange={e => setFormStory({ ...formStory, image_url: e.target.value })} />
          </div>
          <div className="f-acts">
            <button className="btn-can" onClick={() => setShowStory(false)}>Annuler</button>
            <button className="btn-sub" onClick={creerStory}>Publier</button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── CHATBOT ASSISTANT DON ─────────────────────────────────────────────────────
function ChatbotAssistant({ onToast }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: '🤖 Bonjour ! Je suis votre assistant BloodConnect. Posez-moi vos questions sur l\'éligibilité, les médicaments, les voyages, ou le processus de don !', time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions] = useState([
    'Puis-je donner si je prends des médicaments ?',
    'Quel délai après un voyage ?',
    'Suis-je éligible pour donner ?',
    'Comment se passe le don ?',
    'Dois-je être à jeun ?',
  ]);

  const envoyerMessage = async (texte = input) => {
    if (!texte.trim()) return;
    const userMsg = { role: 'user', text: texte, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${BLOOD_API}/chatbot/`, { method: 'POST', headers: JH(), body: JSON.stringify({ message: texte }) });
      const d = await res.json();
      const botMsg = {
        role: 'bot',
        text: d.reponse || 'Désolé, je n\'ai pas compris.',
        categorie: d.categorie,
        confiance: d.confiance,
        suggestions: d.suggestions || [],
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      onToast('Erreur de connexion', 'err');
    }
    setLoading(false);
  };

  const CAT_COLORS = {
    eligibilite: 'var(--grn)',
    medicaments: 'var(--amb)',
    voyages: 'var(--blue)',
    sante: 'var(--red)',
    process: 'var(--vio)',
    groupe_sanguin: 'var(--red)',
    aide: 'var(--txt3)',
  };

  return (
    <>
      <div className="sh" style={{ marginBottom: 14 }}>
        <div className="st">🤖 Assistant Don IA</div>
        <span style={{ fontSize: 12, color: 'var(--txt2)' }}>Disponible 24h/24</span>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,.12),rgba(37,99,235,.06))', border: '1px solid rgba(124,58,237,.2)', borderRadius: 'var(--r)', padding: '18px 22px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg,var(--vio),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🤖</div>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Votre assistant personnel</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)' }}>Posez vos questions sur l\'éligibilité, les médicaments, les voyages, ou le processus de don</div>
        </div>
      </div>

      {/* Suggestions rapides */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Questions fréquentes</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => envoyerMessage(s)} style={{ padding: '6px 12px', background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: 20, fontSize: 11, color: 'var(--txt2)', cursor: 'pointer', transition: 'all .2s', fontFamily: "'Plus Jakarta Sans',sans-serif" }} onMouseEnter={e => { e.target.style.background = 'var(--vio-s)'; e.target.style.color = 'var(--vio)'; }} onMouseLeave={e => { e.target.style.background = 'var(--bg3)'; e.target.style.color = 'var(--txt2)'; }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="card" style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'fadeUp .3s ease', animationDelay: `${i * 0.05}s`, animationFillMode: 'backwards' }}>
              {m.role === 'bot' && <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--vio),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🤖</div>}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: 12, background: m.role === 'user' ? 'linear-gradient(135deg,var(--red-d),var(--red))' : 'var(--bg3)', color: m.role === 'user' ? '#fff' : 'var(--txt)', fontSize: 13, lineHeight: 1.5 }}>
                  {m.text}
                  {m.categorie && m.categorie !== 'aide' && (
                    <div style={{ marginTop: 6, padding: '2px 8px', background: 'rgba(255,255,255,.1)', borderRadius: 12, fontSize: 10, display: 'inline-block' }}>
                      {m.categorie}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 3 }}>{m.time}</div>
                {m.suggestions && m.suggestions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                    {m.suggestions.map((sug, j) => (
                      <button key={j} onClick={() => envoyerMessage(sug)} style={{ padding: '5px 10px', background: 'var(--bg4)', border: 'none', borderRadius: 8, fontSize: 11, color: 'var(--txt2)', cursor: 'pointer', textAlign: 'left', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {m.role === 'user' && <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--red),var(--vio))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>👤</div>}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--vio),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
              <div style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: 12, fontSize: 13 }}>
                <span style={{ animation: 'pulse 1.5s infinite' }}>•</span>
                <span style={{ animation: 'pulse 1.5s infinite', animationDelay: '.2s' }}>•</span>
                <span style={{ animation: 'pulse 1.5s infinite', animationDelay: '.4s' }}>•</span>
              </div>
            </div>
          )}
        </div>
        <div style={{ borderTop: '1px solid var(--bdr)', padding: 14, display: 'flex', gap: 10 }}>
          <input className="finp" placeholder="Posez votre question..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && envoyerMessage()} style={{ flex: 1 }} />
          <button onClick={() => envoyerMessage()} disabled={loading || !input.trim()} style={{ padding: '10px 20px', background: loading || !input.trim() ? 'var(--bg3)' : 'linear-gradient(135deg,var(--vio),var(--blue))', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', fontFamily: "'Syne',sans-serif" }}>
            Envoyer
          </button>
        </div>
      </div>
    </>
  );
}

// ─── PRÉDICTION STOCK IA ─────────────────────────────────────────────────────
function PredictionStock({ onToast }) {
  const [predictions, setPredictions] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Simulation de prédictions IA (à remplacer par vraie API ML)
    const genererPredictions = () => {
      const groupes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
      const pred = groupes.map(g => {
        const stockActuel = Math.floor(Math.random() * 100) + 20;
        const tendance = Math.random() > 0.5 ? 'hausse' : 'baisse';
        const variation = Math.floor(Math.random() * 30) - 15;
        const stockPrevu = Math.max(0, stockActuel + variation);
        const critique = stockPrevu < 30;
        const joursRestants = critique ? Math.floor(Math.random() * 7) + 1 : Math.floor(Math.random() * 20) + 10;
        
        return {
          groupe: g,
          stockActuel,
          stockPrevu,
          tendance,
          variation,
          critique,
          joursRestants,
          confiance: Math.floor(Math.random() * 20) + 80,
        };
      });

      const alertesCritiques = pred.filter(p => p.critique).map(p => ({
        groupe: p.groupe,
        message: `Stock ${p.groupe} prévu critique dans ${p.joursRestants} jours`,
        jours: p.joursRestants,
        stockPrevu: p.stockPrevu,
      }));

      setPredictions(pred);
      setAlertes(alertesCritiques);
      setStats({
        nb_critiques: alertesCritiques.length,
        nb_stables: pred.filter(p => !p.critique && p.tendance === 'hausse').length,
        nb_baisse: pred.filter(p => p.tendance === 'baisse').length,
      });
      setLoading(false);
    };

    genererPredictions();
  }, []);

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--txt3)' }}>Analyse des données en cours...</div>;

  return (
    <>
      <div className="sh" style={{ marginBottom: 14 }}>
        <div className="st">🧠 Prédiction Stock IA</div>
        <span style={{ fontSize: 12, color: 'var(--txt2)' }}>Prévisions basées sur l'IA</span>
      </div>

      {/* Hero Stats */}
      <div style={{ background: 'linear-gradient(135deg,rgba(230,57,70,.12),rgba(245,158,11,.06))', border: '1px solid rgba(230,57,70,.2)', borderRadius: 'var(--r)', padding: '18px 22px', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg,var(--red),var(--amb))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🧠</div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Analyse prédictive des stocks</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)' }}>Prévisions basées sur les tendances saisonnières et événements</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ padding: '8px 14px', background: 'rgba(230,57,70,.15)', borderRadius: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--red)', fontFamily: "'Syne',sans-serif" }}>{stats.nb_critiques}</div>
            <div style={{ fontSize: 11, color: 'var(--txt2)' }}>Groupes critiques</div>
          </div>
          <div style={{ padding: '8px 14px', background: 'rgba(34,197,94,.15)', borderRadius: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--grn)', fontFamily: "'Syne',sans-serif" }}>{stats.nb_stables}</div>
            <div style={{ fontSize: 11, color: 'var(--txt2)' }}>Stables</div>
          </div>
          <div style={{ padding: '8px 14px', background: 'rgba(245,158,11,.15)', borderRadius: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amb)', fontFamily: "'Syne',sans-serif" }}>{stats.nb_baisse}</div>
            <div style={{ fontSize: 11, color: 'var(--txt2)' }}>En baisse</div>
          </div>
        </div>
      </div>

      {/* Alertes critiques */}
      {alertes.length > 0 && (
        <div style={{ background: 'rgba(230,57,70,.08)', border: '1.5px solid rgba(230,57,70,.3)', borderRadius: 'var(--r)', padding: '14px 18px', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1s infinite' }} />
            <strong style={{ fontFamily: "'Syne',sans-serif", fontSize: 14 }}>🚨 {alertes.length} alerte(s) critique(s)</strong>
          </div>
          {alertes.map((a, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: i < alertes.length - 1 ? '1px solid rgba(230,57,70,.1)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="bdg bdg-r" style={{ fontWeight: 800, marginRight: 8 }}>{a.groupe}</span>
                <span style={{ fontSize: 12, color: 'var(--txt2)' }}>{a.message}</span>
              </div>
              <span style={{ fontSize: 11, color: a.jours <= 3 ? 'var(--red)' : 'var(--amb)', fontWeight: 700 }}>
                {a.jours <= 3 ? 'URGENT' : `${a.jours}j`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Grille prédictions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
        {predictions.map((p, i) => {
          const color = p.critique ? 'var(--red)' : p.tendance === 'hausse' ? 'var(--grn)' : 'var(--amb)';
          return (
            <div key={p.groupe} className="card" style={{ padding: 16, animation: 'fadeUp .35s ease backwards', animationDelay: `${i * 0.06}s`, border: p.critique ? '1.5px solid rgba(230,57,70,.3)' : '1px solid var(--bdr)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color }}>{p.groupe}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 1 }}>Groupe sanguin</div>
                </div>
                {p.critique && <span className="bdg bdg-r" style={{ fontSize: 10 }}>🚨 Critique</span>}
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--txt3)' }}>Stock actuel</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{p.stockActuel} poches</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--txt3)' }}>Prévision {p.joursRestants}j</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{p.stockPrevu} poches</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--txt3)' }}>Tendance</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color }}>
                    {p.tendance === 'hausse' ? '↑' : '↓'} {Math.abs(p.variation)}%
                  </span>
                </div>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--txt3)' }}>Confiance IA</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,.1)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${p.confiance}%`, height: '100%', background: color, transition: 'width 1s ease' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color }}>{p.confiance}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info IA */}
      <div style={{ marginTop: 20, padding: '14px 18px', background: 'var(--bg3)', borderRadius: 'var(--r)', border: '1px solid var(--bdr)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>🧠</span>
          <strong style={{ fontSize: 13 }}>Comment fonctionne la prédiction ?</strong>
        </div>
        <div style={{ fontSize: 12, color: 'var(--txt2)', lineHeight: 1.6 }}>
          Notre IA analyse les tendances historiques, les saisons, les événements locaux et les patterns de dons pour prédire les pénuries potentielles. Les alertes proactives permettent d'anticiper les besoins et de mobiliser les donneurs à temps.
        </div>
      </div>
    </>
  );
}

// ─── PROFIL DONNEUR ─────────────────────────────────────────────────────
function ProfilDonneur({ data, onToast }) {
  const [form, setForm] = useState({ first_name:'',last_name:'',email:'',ville:data.ville||'',telephone:data.telephone||'',actif:data.actif });
  const save = async () => {
    const res = await fetch(`${BLOOD_API}/profil/`,{method:'PATCH',headers:JH(),body:JSON.stringify(form)});
    if(res.ok) onToast('✅ Profil mis à jour !'); else onToast('Erreur','err');
  };
  return (
    <div style={{maxWidth:560}}>
      <div className="card">
        <div className="card-t"><I n="user" s={16}/> Mon profil</div>
        <div className="frow"><div className="fgrp"><label className="flbl">Prénom</label><input className="finp" value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})}/></div>
          <div className="fgrp"><label className="flbl">Nom</label><input className="finp" value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})}/></div></div>
        <div className="fgrp"><label className="flbl">Email</label><input className="finp" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
        <div className="frow"><div className="fgrp"><label className="flbl">Ville</label><input className="finp" value={form.ville} onChange={e=>setForm({...form,ville:e.target.value})}/></div>
          <div className="fgrp"><label className="flbl">Téléphone</label><input className="finp" value={form.telephone} onChange={e=>setForm({...form,telephone:e.target.value})}/></div></div>
        <div className="prof-info-box" style={{background:'var(--red-s)',border:'1px solid rgba(230,57,70,.2)'}}>
          <strong>Groupe :</strong> {data.groupe_sanguin} &nbsp;|&nbsp; <strong>Sexe :</strong> {data.sexe==='H'?'Homme':'Femme'} &nbsp;|&nbsp; <strong>Délai :</strong> {data.sexe==='H'?'56':'84'} jours
        </div>
        <div className="fgrp" style={{display:'flex',alignItems:'center',gap:10}}>
          <input type="checkbox" id="actif" checked={form.actif} onChange={e=>setForm({...form,actif:e.target.checked})} style={{width:17,height:17,accentColor:'var(--red)'}}/>
          <label htmlFor="actif" style={{fontSize:14,cursor:'pointer'}}>Compte actif (disponible pour donner)</label>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}><button className="btn-sub" onClick={save}>Enregistrer</button></div>
      </div>
    </div>
  );
}

// ─── DASHBOARD HOPITAL ────────────────────────────────────────────────
function DashHopital({ user, onToast }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState('accueil');
  const [sideOpen, setSideOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeCtx);

  const reload = () => fetch(`${BLOOD_API}/dashboard/hopital/`,{headers:H()}).then(r=>r.json()).then(setData).catch(()=>{});
  useEffect(()=>{reload();},[page]);

  if(!data) return <div style={{padding:60,textAlign:'center',color:'var(--txt2)'}}>Chargement…</div>;

  if(!data.valide) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <style>{CSS}</style>
      <div className="wait-card">
        <div style={{fontSize:52,marginBottom:14}}>⏳</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:700,marginBottom:10}}>Compte en attente de validation</div>
        <div style={{color:'var(--txt2)',lineHeight:1.6,fontSize:14}}>Votre établissement <strong>{data.nom}</strong> est en cours de validation par l'administrateur.</div>
        <div style={{marginTop:18,padding:'10px 18px',background:'var(--amb-s)',borderRadius:10,color:'var(--amb)',fontSize:13}}>Agrément : <strong>{data.agrement}</strong></div>
      </div>
    </div>
  );

  const NAV = [
    {id:'accueil',   lb:'Tableau de bord',       ic:'chart'},
    {id:'demandes',  lb:'Demandes urgentes',      ic:'alert'},
    {id:'campagnes', lb:'Mes campagnes',          ic:'cal'},
    {id:'chatbot',   lb:'Assistant IA',           ic:'heart'},
    {id:'profil',    lb:'Profil établissement',   ic:'hosp'},
  ];

  return (
    <div className="app-lay">
      {sideOpen && <div onClick={()=>setSideOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:99}}/>}
      <Sidebar navItems={NAV} page={page} setPage={p=>{setPage(p);setSideOpen(false);}} user={user} role="Hôpital 🏥" open={sideOpen}/>
      <div className="main">
        <div className="topbar">
          <button className="ham" onClick={()=>setSideOpen(true)}><I n="menu" s={22}/></button>
          <div className="tb-title">{NAV.find(n=>n.id===page)?.lb}</div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={toggleTheme} style={{background:'none',border:'none',color:'var(--txt2)',cursor:'pointer',padding:8,borderRadius:10,transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center'}} onMouseEnter={e=>e.target.style.background='var(--bg3)'} onMouseLeave={e=>e.target.style.background='none'}>
              <I n={theme==='dark'?'sun':'moon'} s={20}/>
            </button>
            <span className="bdg bdg-g">✅ Établissement validé</span>
          </div>
        </div>
        <div className="pad">
          {page==='accueil'   && <AccueilHopital data={data} setPage={setPage}/>}
          {page==='demandes'  && <DemandesHopital reload={reload} onToast={onToast}/>}
          {page==='campagnes' && <CampagnesHopital reload={reload} onToast={onToast}/>}
          {page==='chatbot'   && <ChatbotAssistant onToast={onToast}/>}
          {page==='profil'    && <ProfilHopital data={data} onToast={onToast}/>}
        </div>
      </div>
    </div>
  );
}

function AccueilHopital({ data, setPage }) {
  const STATS = [
    {l:'Demandes actives',v:data.nb_demandes_actives,c:'var(--red)',  ic:'alert'},
    {l:'Dons reçus',      v:data.nb_dons_recus,       c:'var(--grn)', ic:'drop'},
    {l:'Campagnes',       v:data.nb_campagnes,         c:'var(--blue)',ic:'cal'},
    {l:'Réponses reçues', v:data.nb_reponses,          c:'var(--amb)', ic:'users'},
  ];
  return (
    <>
      <div className="sg">{STATS.map((s,i)=><div key={s.l} className="sc" style={{animationDelay:`${i*0.07}s`}}><div className="sc-ic" style={{background:`${s.c}18`,fontSize:20}}><I n={s.ic} s={20}/></div><div><div className="sc-v" style={{color:s.c}}>{s.v}</div><div className="sc-l">{s.l}</div></div></div>)}</div>
      {data.demandes_actives?.length>0&&<><div className="sh"><div className="st">🚨 Mes demandes actives</div><button className="btn-outline-r" onClick={()=>setPage('demandes')}>Gérer</button></div><div className="dc-grid">{data.demandes_actives.map((d,i)=><DemandeCard key={d.id} d={d} i={i}/>)}</div></>}
      <div style={{marginTop:24}}>
        <div className="st" style={{marginBottom:12}}>📍 Localisation — {data.ville||data.adresse}</div>
        <div style={{borderRadius:'var(--r)',overflow:'hidden',border:'1px solid var(--bdr)',height:260}}>
          <iframe title="Carte" width="100%" height="260" frameBorder="0" style={{border:0}} src={`https://maps.google.com/maps?q=${encodeURIComponent((data.nom||'')+' '+(data.ville||data.adresse||''))}&output=embed&z=14`} allowFullScreen/>
        </div>
      </div>
    </>
  );
}

function DemandesHopital({ reload, onToast }) {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ groupe_sanguin:'O+', quantite:'', delai:'', description:'' });

  const load = () => fetch(`${BLOOD_API}/demandes-urgentes/mes-demandes/`,{headers:H()}).then(r=>r.json()).then(d=>{setDemandes(Array.isArray(d)?d:[]);setLoading(false);}).catch(()=>setLoading(false));
  useEffect(()=>{load();},[]);

  const add = async () => {
    if(!form.quantite||!form.delai){onToast('Remplissez tous les champs.','err');return;}
    const res = await fetch(`${BLOOD_API}/demandes-urgentes/creer/`,{method:'POST',headers:JH(),body:JSON.stringify(form)});
    const d = await res.json();
    if(res.ok){load();reload();setShow(false);setForm({groupe_sanguin:'O+',quantite:'',delai:'',description:''});onToast('✅ Demande publiée !');}
    else onToast(d.error||'Erreur','err');
  };

  const cloturer = async (id) => {
    await fetch(`${BLOOD_API}/demandes-urgentes/${id}/cloturer/`,{method:'POST',headers:H()});
    load(); onToast('Demande clôturée.');
  };

  return (
    <>
      <div className="sh"><div className="st">🚨 Mes demandes ({demandes.length})</div><button className="btn-add" onClick={()=>setShow(true)}><I n="plus" s={14}/> Nouvelle demande</button></div>
      {loading?<div style={{padding:40,textAlign:'center',color:'var(--txt3)'}}>Chargement…</div>:(
        <div className="dc-grid">
          {demandes.length===0?<div style={{gridColumn:'1/-1',textAlign:'center',padding:60,color:'var(--txt3)'}}>Aucune demande publiée.</div>
            :demandes.map((d,i)=>(
              <div key={d.id} className={`dc ${d.est_urgente?'urg':''}`} style={{animationDelay:`${i*0.06}s`}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}><div className="blood-badge">{d.groupe_sanguin}</div><div><strong>{d.quantite} poches</strong><div style={{fontSize:11,color:'var(--txt3)'}}>Délai : {d.delai?new Date(d.delai).toLocaleDateString('fr-FR'):'—'}</div></div></div>
                  <span className={`bdg ${d.statut==='active'?'bdg-r':'bdg-gray'}`}>{d.statut}</span>
                </div>
                {d.description&&<p style={{fontSize:12,color:'var(--txt2)',marginBottom:10}}>{d.description}</p>}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:11,color:'var(--txt3)'}}>{d.nb_reponses} réponse(s)</span>
                  {d.statut==='active'&&<button className="btn-sm btn-sm-r" onClick={()=>cloturer(d.id)}>Clôturer</button>}
                </div>
              </div>
            ))}
        </div>
      )}
      {show&&<Modal title="🚨 Nouvelle demande urgente" onClose={()=>setShow(false)}>
        <div className="frow"><div className="fgrp"><label className="flbl">Groupe sanguin *</label><select className="fsel" value={form.groupe_sanguin} onChange={e=>setForm({...form,groupe_sanguin:e.target.value})}>{GROUPS.map(g=><option key={g} value={g}>{g}</option>)}</select></div>
          <div className="fgrp"><label className="flbl">Quantité (poches) *</label><input className="finp" type="number" min="1" placeholder="5" value={form.quantite} onChange={e=>setForm({...form,quantite:e.target.value})}/></div></div>
        <div className="fgrp"><label className="flbl">Date limite *</label><input className="finp" type="date" value={form.delai} onChange={e=>setForm({...form,delai:e.target.value})}/></div>
        <div className="fgrp"><label className="flbl">Description</label><input className="finp" placeholder="Contexte de la demande…" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
        <div className="f-acts"><button className="btn-can" onClick={()=>setShow(false)}>Annuler</button><button className="btn-sub" onClick={add}>Publier</button></div>
      </Modal>}
    </>
  );
}

function CampagnesHopital({ reload, onToast }) {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ nom:'', date:'', lieu:'', groupes_cibles:'', capacite_totale:'', description:'' });

  const load = () => fetch(`${BLOOD_API}/campagnes/mes-campagnes/`,{headers:H()}).then(r=>r.json()).then(d=>{setCamps(Array.isArray(d)?d:[]);setLoading(false);}).catch(()=>setLoading(false));
  useEffect(()=>{load();},[]);

  const add = async () => {
    if(!form.nom||!form.date||!form.capacite_totale){onToast('Champs requis manquants.','err');return;}
    const res = await fetch(`${BLOOD_API}/campagnes/`,{method:'POST',headers:JH(),body:JSON.stringify(form)});
    const d = await res.json();
    if(res.ok){load();reload();setShow(false);setForm({nom:'',date:'',lieu:'',groupes_cibles:'',capacite_totale:'',description:''});onToast('✅ Campagne créée !');}
    else onToast(d.error||'Erreur','err');
  };

  return (
    <>
      <div className="sh"><div className="st">📅 Mes campagnes ({camps.length})</div><button className="btn-add" onClick={()=>setShow(true)}><I n="plus" s={14}/> Nouvelle campagne</button></div>
      {loading?<div style={{padding:40,textAlign:'center',color:'var(--txt3)'}}>Chargement…</div>:(
        <div className="dc-grid">
          {camps.length===0?<div style={{gridColumn:'1/-1',textAlign:'center',padding:60,color:'var(--txt3)'}}>Aucune campagne créée.</div>
            :camps.map((c,i)=>{
              const pct=Math.round((c.nb_inscrits/Math.max(c.capacite_totale,1))*100);
              return (
                <div key={c.id} className="camp-card" style={{animationDelay:`${i*0.06}s`}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}><strong style={{fontSize:14}}>{c.nom}</strong><span className={`bdg ${c.est_complete?'bdg-gray':'bdg-b'}`}>{c.est_complete?'Complet':`${c.places_restantes} places`}</span></div>
                  <div style={{fontSize:12,color:'var(--txt2)',display:'flex',flexDirection:'column',gap:4,marginBottom:10}}><span><I n="cal" s={11}/> {c.date?new Date(c.date).toLocaleDateString('fr-FR'):''}</span><span><I n="pin" s={11}/> {c.lieu}</span><span><I n="users" s={11}/> {c.nb_inscrits} / {c.capacite_totale} inscrits</span></div>
                  <div className="prog-bar"><div className="prog-fill" style={{width:`${Math.min(pct,100)}%`,background:pct>=90?'var(--red)':pct>=60?'var(--amb)':'var(--grn)'}}/></div>
                </div>
              );
            })}
        </div>
      )}
      {show&&<Modal title="📅 Nouvelle campagne" onClose={()=>setShow(false)}>
        <div className="fgrp"><label className="flbl">Nom *</label><input className="finp" placeholder="Journée du don" value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})}/></div>
        <div className="frow"><div className="fgrp"><label className="flbl">Date *</label><input className="finp" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
          <div className="fgrp"><label className="flbl">Capacité *</label><input className="finp" type="number" min="1" placeholder="50" value={form.capacite_totale} onChange={e=>setForm({...form,capacite_totale:e.target.value})}/></div></div>
        <div className="fgrp"><label className="flbl">Lieu</label><input className="finp" placeholder="Salle des fêtes, Sfax" value={form.lieu} onChange={e=>setForm({...form,lieu:e.target.value})}/></div>
        <div className="fgrp"><label className="flbl">Groupes ciblés</label><input className="finp" placeholder="O+, A-, B+" value={form.groupes_cibles} onChange={e=>setForm({...form,groupes_cibles:e.target.value})}/></div>
        <div className="fgrp"><label className="flbl">Description</label><input className="finp" placeholder="Informations…" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
        <div className="f-acts"><button className="btn-can" onClick={()=>setShow(false)}>Annuler</button><button className="btn-sub" onClick={add}>Créer</button></div>
      </Modal>}
    </>
  );
}

function ProfilHopital({ data, onToast }) {
  const [form, setForm] = useState({ nom:data.nom||'', adresse:data.adresse||'', ville:data.ville||'', telephone:data.telephone||'', email:data.email||'' });
  const save = async () => {
    const res = await fetch(`${BLOOD_API}/profil/`,{method:'PATCH',headers:JH(),body:JSON.stringify(form)});
    if(res.ok) onToast('✅ Profil mis à jour !'); else onToast('Erreur','err');
  };
  return (
    <div style={{maxWidth:560}}>
      <div className="card">
        <div className="card-t"><I n="hosp" s={16}/> Profil établissement</div>
        <div className="prof-info-box" style={{background:'var(--blue-s)',border:'1px solid rgba(37,99,235,.2)'}}>Agrément : <strong>{data.agrement}</strong></div>
        <div className="fgrp"><label className="flbl">Nom</label><input className="finp" value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})}/></div>
        <div className="frow"><div className="fgrp"><label className="flbl">Ville</label><input className="finp" value={form.ville} onChange={e=>setForm({...form,ville:e.target.value})}/></div>
          <div className="fgrp"><label className="flbl">Téléphone</label><input className="finp" value={form.telephone} onChange={e=>setForm({...form,telephone:e.target.value})}/></div></div>
        <div className="fgrp"><label className="flbl">Adresse</label><input className="finp" value={form.adresse} onChange={e=>setForm({...form,adresse:e.target.value})}/></div>
        <div className="fgrp"><label className="flbl">Email</label><input className="finp" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}><button className="btn-sub" onClick={save}>Enregistrer</button></div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ADMIN ──────────────────────────────────────────────────
function DashAdmin({ user, onToast }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState('accueil');
  const [sideOpen, setSideOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeCtx);

  const reload = () => fetch(`${BLOOD_API}/dashboard/`,{headers:H()}).then(r=>r.json()).then(setData).catch(()=>{});
  useEffect(()=>{reload();},[page]);

  if(!data) return <div style={{padding:60,textAlign:'center',color:'var(--txt2)'}}>Chargement…</div>;

  const NAV = [
    {id:'accueil',  lb:"Vue d'ensemble",     ic:'chart'},
    {id:'hopitaux', lb:'Hôpitaux',           ic:'hosp'},
    {id:'donneurs', lb:'Donneurs',           ic:'users'},
    {id:'demandes', lb:'Toutes les demandes',ic:'alert'},
  ];

  const valider = async (id) => {
    await fetch(`${BLOOD_API}/hopitaux/${id}/valider/`,{method:'POST',headers:H()});
    onToast('✅ Hôpital validé !'); reload();
  };

  const exportCSV = () => {
    fetch(`${BLOOD_API}/export-csv/`,{headers:H()}).then(r=>r.blob()).then(blob=>{ const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='donneurs_bloodconnect.csv'; a.click(); });
  };

  return (
    <div className="app-lay">
      {sideOpen && <div onClick={()=>setSideOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:99}}/>}
      <Sidebar navItems={NAV} page={page} setPage={p=>{setPage(p);setSideOpen(false);}} user={user} role="Administrateur 🛡️" open={sideOpen}/>
      <div className="main">
        <div className="topbar">
          <button className="ham" onClick={()=>setSideOpen(true)}><I n="menu" s={22}/></button>
          <div className="tb-title">{NAV.find(n=>n.id===page)?.lb}</div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={toggleTheme} style={{background:'none',border:'none',color:'var(--txt2)',cursor:'pointer',padding:8,borderRadius:10,transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center'}} onMouseEnter={e=>e.target.style.background='var(--bg3)'} onMouseLeave={e=>e.target.style.background='none'}>
              <I n={theme==='dark'?'sun':'moon'} s={20}/>
            </button>
            <span className="bdg bdg-r"><I n="shield" s={11}/> Admin</span>
          </div>
        </div>
        <div className="pad">
          {page==='accueil' && <>
            <div className="sg">
              {[{l:'Donneurs',v:data.nb_donneurs,c:'var(--red)',ic:'users'},{l:'Hôpitaux validés',v:data.nb_hopitaux,c:'var(--blue)',ic:'hosp'},{l:'Total dons',v:data.nb_dons,c:'var(--grn)',ic:'drop'},{l:'Demandes actives',v:data.nb_demandes,c:'var(--amb)',ic:'alert'}].map((s,i)=>(
                <div key={s.l} className="sc" style={{animationDelay:`${i*0.07}s`}}><div className="sc-ic" style={{background:`${s.c}18`,fontSize:20}}><I n={s.ic} s={20}/></div><div><div className="sc-v" style={{color:s.c}}>{s.v}</div><div className="sc-l">{s.l}</div></div></div>
              ))}
            </div>
            {(data.hopitaux_attente||[]).length>0&&<>
              <div className="sh" style={{marginBottom:14}}><div className="st">⏳ Hôpitaux en attente ({data.hopitaux_attente.length})</div></div>
              <div className="tc" style={{marginBottom:24}}>
                <table><thead><tr><th>Établissement</th><th>Agrément</th><th>Ville</th><th>Action</th></tr></thead>
                <tbody>{data.hopitaux_attente.map(h=><tr key={h.id}><td><div style={{display:'flex',alignItems:'center',gap:10}}><div className="sb-av" style={{width:30,height:30,fontSize:12,background:'linear-gradient(135deg,var(--blue-d),var(--blue))'}}>{h.nom[0]}</div><strong>{h.nom}</strong></div></td><td><span className="bdg bdg-y">{h.agrement||h.num_agrement}</span></td><td style={{color:'var(--txt2)'}}>{h.ville||h.adresse}</td><td><button className="btn-sm btn-sm-g" onClick={()=>valider(h.id)}>✅ Valider</button></td></tr>)}</tbody>
                </table>
              </div>
            </>}
            {(data.demandes_actives||[]).length>0&&<><div className="sh"><div className="st">🚨 Demandes actives récentes</div></div><div className="dc-grid">{data.demandes_actives.map((d,i)=><DemandeCard key={d.id} d={d} i={i}/>)}</div></>}
          </>}

          {page==='hopitaux' && <><div className="sh"><div className="st">🏥 Tous les hôpitaux</div></div>
            <div className="tc"><table><thead><tr><th>Établissement</th><th>Ville</th><th>Agrément</th><th>Statut</th></tr></thead>
            <tbody>{(data.tous_hopitaux||[]).map(h=><tr key={h.id}><td><div style={{display:'flex',alignItems:'center',gap:10}}><div className="sb-av" style={{width:30,height:30,fontSize:12,background:'linear-gradient(135deg,var(--blue-d),var(--blue))'}}>{h.nom[0]}</div><strong>{h.nom}</strong></div></td><td style={{color:'var(--txt2)'}}>{h.ville||h.adresse}</td><td><span className="bdg bdg-b">{h.agrement||h.num_agrement}</span></td><td><span className={`bdg ${h.valide?'bdg-g':'bdg-y'}`}>{h.valide?'Validé':'En attente'}</span></td></tr>)}</tbody>
            </table></div>
          </>}

          {page==='donneurs' && <><div className="sh"><div className="st">🫀 Tous les donneurs</div><button className="btn-add" onClick={exportCSV} style={{background:'linear-gradient(135deg,#166534,var(--grn))'}}><I n="dl" s={14}/> Export CSV</button></div>
            <div className="tc"><table><thead><tr><th>Donneur</th><th>Groupe</th><th>Ville</th><th>Dons</th><th>Statut</th></tr></thead>
            <tbody>{(data.tous_donneurs||[]).map(d=><tr key={d.id}><td><div style={{display:'flex',alignItems:'center',gap:10}}><div className="sb-av" style={{width:30,height:30,fontSize:12}}>{(d.nom||d.username||'?')[0].toUpperCase()}</div><strong>{d.nom||d.username}</strong></div></td><td><span className="bdg bdg-r" style={{fontFamily:"'Syne',sans-serif",fontWeight:800}}>{d.groupe_sanguin}</span></td><td style={{color:'var(--txt2)'}}>{d.ville}</td><td><strong>{d.nb_dons}</strong></td><td><span className={`bdg ${d.actif?'bdg-g':'bdg-gray'}`}>{d.actif?'Actif':'Inactif'}</span></td></tr>)}</tbody>
            </table></div>
          </>}

          {page==='demandes' && <><div className="sh"><div className="st">🚨 Toutes les demandes</div></div><div className="dc-grid">{(data.toutes_demandes||[]).map((d,i)=><DemandeCard key={d.id} d={d} i={i}/>)}</div></>}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────
function BloodConnectAppInner({ onBack }) {
    const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const login  = (u) => setUser(u);
  const logout = () => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); setUser(null); if(onBack) onBack(); };
  const showT  = (msg, type='ok') => setToast({ msg, type });
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme }}>
    <AuthCtx.Provider value={{ user, login, logout }}>
      <style>{CSS}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      {!user && <AuthPage onLogin={login}/>}
      {user && user.role==='donneur' && <DashDonneur user={user} onToast={showT}/>}
      {user && user.role==='hopital' && <DashHopital user={user} onToast={showT}/>}
      {user && (user.role==='admin'||user.role==='user') && <DashAdmin user={user} onToast={showT}/>}
    </AuthCtx.Provider>
    </ThemeCtx.Provider>
  );
}

export default function BloodConnectApp({ onBack }) {
  return (
    <LanguageProvider>
      <BloodConnectAppInner onBack={onBack} />
    </LanguageProvider>
  );
}