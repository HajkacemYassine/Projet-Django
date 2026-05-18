import { useState, useEffect, createContext, lazy, Suspense } from "react";
import appBg from './assets/honeyhouse_bg.png';
import bloodBg from './assets/bloodconnect_bg.png';
import { SuiviLivraisonContent } from './SuiviLivraisonMap';
const BloodConnectApp = lazy(() => import('./BloodConnectApp'));
import React from 'react';
 
// ─── Constants ────────────────────────────────────────────────────────
const DJANGO_URL = "http://localhost:8000";
const AuthContext = createContext(null);

// ─── Helper: Get CSRF Token from Cookies ──────────────────────────────
const getCsrfToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// ─── Helper: Make API Requests with CSRF Token ────────────────────────
const fetchAPI = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add CSRF token for POST/PUT/DELETE/PATCH requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase())) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }
  
  return fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });
};
 
// ─── Global CSS ───────────────────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary: #8b5cf6;
    --primary-dark: #6d28d9;
    --primary-soft: rgba(139, 92, 246, 0.15);
    
    --secondary: #ec4899;
    --secondary-dark: #be185d;
    
    --accent: #0ea5e9;
    --accent-dark: #0284c7;

    --bg-glass: rgba(15, 23, 42, 0.6);
    --bg-glass-hover: rgba(15, 23, 42, 0.75);
    --bg-card: rgba(30, 41, 59, 0.7);
    --border-glass: rgba(255, 255, 255, 0.1);
    --border-glass-hover: rgba(255, 255, 255, 0.2);
    
    --text-main: #f8fafc;
    --text-muted: #cbd5e1;
    --text-dim: #94a3b8;
    
    --radius: 20px;
    --radius-sm: 12px;
    
    --shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    --font-heading: 'Space Grotesk', sans-serif;
    --font-body: 'Outfit', sans-serif;
    --sidebar-width: 280px;
  }

  html { scroll-behavior: smooth; }
  body { 
    font-family: var(--font-body); 
    background-color: #0f172a; 
    color: var(--text-main); 
    min-height: 100vh; 
    overflow-x: hidden; 
  }
  body::before { 
    content:''; 
    position:fixed; 
    inset:0; 
    background:url('${appBg}') center/cover no-repeat fixed; 
    opacity: 1; 
    z-index:-1; 
    pointer-events:none; 
  }
  
  /* Adding an overlay to make text readable */
  body::after {
    content:'';
    position:fixed;
    inset:0;
    background: radial-gradient(circle at top left, rgba(15,23,42,0.4), rgba(15,23,42,0.8));
    z-index:-1;
    pointer-events:none;
  }

  ::-webkit-scrollbar { width: 6px; } 
  ::-webkit-scrollbar-track { background: transparent; } 
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }

  /* ── Animations ───────────────────────────────────────────────────── */
  @keyframes fadeUp   { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes slideR   { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
  @keyframes float    { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
  @keyframes shimmer  { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
  @keyframes blobPulse{ 0%,100%{transform:scale(1) rotate(0deg);opacity:.4;} 50%{transform:scale(1.1) rotate(5deg);opacity:.6;} }

  /* ── Auth Page ────────────────────────────────────────────────────── */
  .auth-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding: 20px; position:relative; overflow:hidden; }
  .auth-wrap::before { content:''; position:absolute; inset:0; background:url('${appBg}') center/cover no-repeat; z-index:0; filter: blur(8px); transform: scale(1.05); }
  .auth-wrap::after { content:''; position:absolute; inset:0; background: linear-gradient(135deg, rgba(15,23,42,0.7) 0%, rgba(15,23,42,0.9) 100%); z-index:1; }

  .auth-left { display:none; }
  .auth-right { background:transparent; display:flex; align-items:center; justify-content:center; padding:40px; position:relative; z-index:2; width: 100%; max-width: 480px; }
  
  .auth-card { 
    width:100%; 
    animation:fadeUp .6s cubic-bezier(0.16, 1, 0.3, 1); 
    background: rgba(15, 23, 42, 0.6); 
    backdrop-filter: blur(24px); 
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 28px; 
    padding: 48px; 
    box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1); 
  }
  .auth-title { font-family:var(--font-heading); font-size:36px; font-weight:800; margin-bottom:8px; color: #fff; letter-spacing: -1px; }
  .auth-sub { color:var(--text-muted); font-size:15px; margin-bottom:32px; }
  
  .auth-tabs { display:flex; gap:8px; background: rgba(0,0,0,0.3); border-radius:16px; padding:6px; margin-bottom:32px; border: 1px solid rgba(255,255,255,0.05); }
  .auth-tab { flex:1; padding:12px; border:none; border-radius:12px; background:none; color:var(--text-muted); font-size:14px; font-weight:600; font-family:var(--font-body); cursor:pointer; transition:all .3s; }
  .auth-tab.active { background: rgba(255,255,255,0.1); color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
  
  .form-group { margin-bottom:20px; }
  .form-label { display:block; font-size:12px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
  .input-w { position:relative; }
  .input-ic { position:absolute; left:16px; top:50%; transform:translateY(-50%); color:var(--text-dim); display:flex; pointer-events:none; }
  .form-inp { 
    width:100%; 
    background: rgba(0,0,0,0.2); 
    border: 1.5px solid rgba(255,255,255,0.08); 
    border-radius: var(--radius-sm); 
    padding: 14px 46px; 
    color: #fff; 
    font-family: var(--font-body); 
    font-size: 15px; 
    outline: none; 
    transition: all .3s; 
  }
  .form-inp:focus { 
    border-color: var(--primary); 
    background: rgba(0,0,0,0.4);
    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2); 
  }
  .form-inp::placeholder { color:var(--text-dim); }
  .inp-plain { padding-left:16px !important; }
  .inp-right { position:absolute; right:16px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-dim); cursor:pointer; display:flex; transition: color .2s; }
  .inp-right:hover { color: #fff; }
  
  .btn-main { 
    width:100%; 
    padding:16px; 
    border:none; 
    border-radius: var(--radius-sm); 
    font-family:var(--font-heading); 
    font-size:16px; 
    font-weight:700; 
    letter-spacing: 0.5px;
    cursor:pointer; 
    transition:all .3s cubic-bezier(0.16, 1, 0.3, 1); 
    margin-top:12px; 
    position: relative;
    overflow: hidden;
  }
  .btn-violet { 
    background: linear-gradient(135deg, var(--primary), var(--secondary)); 
    color:#fff; 
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
  }
  .btn-violet:hover { 
    transform:translateY(-3px); 
    box-shadow: 0 12px 28px rgba(139, 92, 246, 0.5); 
    filter: brightness(1.1);
  }
  .btn-red { background:linear-gradient(135deg,#e11d48,#be123c); color:#fff; }
  .btn-red:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(225,29,72,.45); }
  .btn-disabled { opacity:.6; cursor:not-allowed !important; transform:none !important; }
  
  .err-msg { background:rgba(225,29,72,.15); border:1px solid rgba(225,29,72,.3); border-radius:var(--radius-sm); padding:12px 16px; color:#fb7185; font-size:14px; margin-bottom:20px; display:flex; align-items:center; gap:10px; font-weight: 500; }
  
  .form-sel { width:100%; background:rgba(0,0,0,0.2); border:1.5px solid rgba(255,255,255,0.08); border-radius:var(--radius-sm); padding:14px 16px; color:#fff; font-family:var(--font-body); font-size:15px; outline:none; cursor:pointer; transition:all .3s; }
  .form-sel:focus { border-color:var(--primary); background: rgba(0,0,0,0.4); }
  .form-sel option { background: #0f172a; color: #fff; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }

  /* ── Project Selector ─────────────────────────────────────────────── */
  .bg-layer {
    position: fixed; inset: 0; background-size: cover; background-position: center; background-repeat: no-repeat;
    z-index: -1; transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 2s ease-out; opacity: 0; pointer-events: none;
  }
  .bg-layer.active { opacity: 0.8; transform: scale(1.05); }
  
  .selector-page { z-index: 1; }
  
  .proj-card.myshop:hover {
    box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(139, 92, 246, 0.1);
  }
  .proj-card.blood:hover {
    box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(225, 29, 72, 0.3), inset 0 0 20px rgba(225, 29, 72, 0.1);
  }

  .selector-page { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; position:relative; z-index: 1; }
  .selector-title { font-family:var(--font-heading); font-size:56px; font-weight:800; text-align:center; margin-bottom:16px; line-height:1.1; animation:fadeUp .6s ease; letter-spacing: -1.5px; }
  .grad-text { background:linear-gradient(135deg, #38bdf8, #818cf8, #f472b6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .selector-sub { color:var(--text-muted); font-size:18px; text-align:center; margin-bottom:60px; animation:fadeUp .6s .1s ease backwards; }
  
  .selector-cards { display:grid; grid-template-columns:1fr 1fr; gap:32px; max-width:800px; width:100%; animation:fadeUp .6s .2s ease backwards; }
  @media(max-width:768px){ .selector-cards{grid-template-columns:1fr;} .selector-title{font-size:40px;} }
  
  .proj-card { 
    background: rgba(15, 23, 42, 0.4); 
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1); 
    border-radius: 32px; 
    padding: 40px 32px; 
    cursor:pointer; 
    transition:all .4s cubic-bezier(0.16, 1, 0.3, 1); 
    position:relative; 
    overflow:hidden; 
  }
  .proj-card::before { 
    content:''; position:absolute; inset:0; opacity:0; transition:opacity .4s; border-radius:32px; z-index: -1;
  }
  .proj-card.myshop::before { background: radial-gradient(circle at top left, rgba(139, 92, 246, 0.2), transparent 70%); }
  .proj-card.blood::before { background: radial-gradient(circle at top left, rgba(225, 29, 72, 0.2), transparent 70%); }
  
  .proj-card:hover { transform:translateY(-8px); box-shadow: 0 30px 60px rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.2); }
  .proj-card:hover::before { opacity:1; }
  
  .proj-strip { height:6px; border-radius:6px; margin-bottom:32px; width: 60px; }
  .proj-strip.v { background:linear-gradient(90deg, #818cf8, #c084fc); }
  .proj-strip.r { background:linear-gradient(90deg, #fb7185, #e11d48); }
  
  .proj-icon { font-size:64px; margin-bottom:24px; display:block; animation:float 6s ease-in-out infinite; text-shadow: 0 10px 20px rgba(0,0,0,0.3); }
  .proj-name { font-family:var(--font-heading); font-size:28px; font-weight:800; margin-bottom:12px; color: #fff; }
  .proj-desc { color:var(--text-muted); font-size:15px; line-height:1.6; margin-bottom:28px; }
  
  .proj-stats { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:32px; }
  .proj-tag { padding:6px 14px; border-radius:20px; font-size:12px; font-weight:600; border: 1px solid rgba(255,255,255,0.1); }
  .tag-v { background:rgba(139, 92, 246, 0.15); color:#c084fc; border-color: rgba(139, 92, 246, 0.3); }
  .tag-r { background:rgba(225, 29, 72, 0.15); color:#fb7185; border-color: rgba(225, 29, 72, 0.3); }
  .tag-b { background:rgba(14, 165, 233, 0.15); color:#38bdf8; border-color: rgba(14, 165, 233, 0.3); }
  
  .proj-btn { width:100%; padding:14px; border:none; border-radius:16px; font-family:var(--font-heading); font-size:15px; font-weight:700; cursor:pointer; transition:all .3s; }
  
  .selector-user { 
    position:absolute; top:32px; right:32px; display:flex; align-items:center; gap:14px; 
    background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(12px); border:1px solid rgba(255,255,255,0.1); 
    border-radius:40px; padding:8px 20px 8px 8px; animation:fadeIn .8s ease; 
  }
  .user-av { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #c084fc, #38bdf8); display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; color: #fff; }
  .user-nm { font-size:14px; font-weight:600; color: #fff; }
  .user-dot { width:8px; height:8px; border-radius:50%; background:#4ade80; box-shadow: 0 0 10px #4ade80; }
  .logout-btn { padding:6px 14px; background:rgba(225,29,72,.15); border:1px solid rgba(225,29,72,.3); border-radius:20px; color:#fb7185; font-size:12px; font-weight:600; cursor:pointer; font-family:var(--font-body); transition:all .2s; margin-left: 8px; }
  .logout-btn:hover { background:rgba(225,29,72,.3); color: #fff; }

  
  /* ── Cinematic Transition ────────────────────────────────────────── */
  .cine-overlay {
    position: fixed; inset: 0; z-index: 9999; pointer-events: none;
    display: flex; align-items: center; justify-content: center;
  }
  .cine-circle {
    width: 10px; height: 10px; border-radius: 50%; opacity: 0;
    transition: transform 1s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.3s ease;
  }
  .cine-circle.expand {
    opacity: 1; transform: scale(300); /* scale large enough to cover screen */
  }
  .cine-circle.myshop { background: radial-gradient(circle, #8b5cf6, #0f172a); }
  .cine-circle.blood { background: radial-gradient(circle, #e11d48, #09090b); }

  /* ── Typing Effect ─────────────────────────────────────────────── */
  .typing-eff {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    border-right: 3px solid #fff;
    animation: type 2s steps(40, end), blink 0.75s step-end infinite;
    max-width: fit-content;
  }
  @keyframes type { from { width: 0; } to { width: 100%; } }
  @keyframes blink { 50% { border-color: transparent; } }

  /* ── App Layout ───────────────────────────────────────────────────── */
  .app-layout { display:flex; min-height:100vh; }
  .sidebar { 
    width:var(--sidebar-width); 
    background: rgba(15, 23, 42, 0.6); 
    backdrop-filter: blur(20px);
    border-right:1px solid rgba(255,255,255,0.08); 
    position:fixed; top:0; left:0; bottom:0; z-index:100; display:flex; flex-direction:column; transition:transform .4s cubic-bezier(0.16, 1, 0.3, 1); 
  }
  .sb-logo { padding:32px 24px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:14px; }
  .sb-logo-ic { width:44px; height:44px; border-radius:14px; background:linear-gradient(135deg, var(--primary), var(--secondary)); display:flex; align-items:center; justify-content:center; font-size:22px; box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3); }
  .sb-logo-txt { font-family:var(--font-heading); font-size:22px; font-weight:800; letter-spacing: -0.5px; color:#fff;}
  .sb-logo-txt span { background:linear-gradient(135deg, #c084fc, #38bdf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  
  .sb-nav { flex:1; padding:24px 16px; overflow-y:auto; }
  .nav-lbl { font-size:11px; font-weight:700; color:var(--text-dim); text-transform:uppercase; letter-spacing:1.5px; padding:6px 16px; margin-top:12px; margin-bottom: 8px; }
  .nav-it { 
    display:flex; align-items:center; gap:14px; padding:12px 16px; border-radius:14px; 
    color:var(--text-muted); font-size:15px; font-weight:500; cursor:pointer; border:none; background:none; 
    width:100%; text-align:left; transition:all .2s; margin-bottom:4px; position:relative; 
  }
  .nav-it:hover { background: rgba(255,255,255,0.05); color:#fff; }
  .nav-it.active { background: linear-gradient(90deg, rgba(139, 92, 246, 0.2), transparent); color:#c084fc; font-weight:600; border-left: 3px solid #c084fc; border-radius: 4px 14px 14px 4px; }
  
  .back-btn { display:flex; align-items:center; gap:8px; background:none; border:none; color:var(--text-dim); font-size:14px; cursor:pointer; padding:8px 0; margin-bottom:12px; font-family:var(--font-body); font-weight: 500; transition:color .2s; }
  .back-btn:hover { color:#fff; }
  
  .sb-user { padding:24px 16px; border-top:1px solid rgba(255,255,255,0.05); }
  .sb-user-chip { display:flex; align-items:center; gap:12px; padding:12px 16px; background:rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius:16px; margin-bottom:16px; }
  .sb-av { width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, #c084fc, #38bdf8); display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; flex-shrink:0; color: #fff; }
  .sb-uname { font-size:14px; font-weight:600; color: #fff; }
  .sb-role { font-size:12px; color:var(--text-dim); }
  
  .sb-logout { width:100%; padding:12px; background:rgba(225,29,72,.1); border:1px solid rgba(225,29,72,.2); border-radius:12px; color:#fb7185; font-size:14px; font-weight:600; font-family:var(--font-body); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .2s; }
  .sb-logout:hover { background:rgba(225,29,72,.25); color: #fff; }

  .main-c { margin-left:var(--sidebar-width); flex:1; display: flex; flex-direction: column; }
  .topbar { 
    background: rgba(15, 23, 42, 0.4); 
    backdrop-filter: blur(20px);
    border-bottom:1px solid rgba(255,255,255,0.08); 
    padding:20px 40px; display:flex; align-items:center; gap:24px; position:sticky; top:0; z-index:50; 
  }
  .topbar-title { font-family:var(--font-heading); font-size:24px; font-weight:800; flex:1; letter-spacing: -0.5px; color:#fff;}
  .search-box { 
    display:flex; align-items:center; gap:12px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); 
    border-radius:40px; padding:10px 20px; flex:1; max-width:360px; transition:all .3s; 
  }
  .search-box:focus-within { border-color:var(--primary); background: rgba(0,0,0,0.4); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2); }
  .search-box input { background:none; border:none; outline:none; color:#fff; font-family:var(--font-body); font-size:15px; flex:1; }
  .search-box input::placeholder { color:var(--text-dim); }
  .ham { display:none; background:none; border:none; color:#fff; cursor:pointer; }
  
  @media(max-width:1024px){ .sidebar{transform:translateX(-100%);} .sidebar.open{transform:translateX(0);} .main-c{margin-left:0;} .ham{display:flex;} .topbar{padding:16px 20px;} .page-pad{padding:20px!important;} }

  .page-pad { padding:40px; position:relative; flex: 1; }

  /* ── Cards & Stats ────────────────────────────────────────────────── */
  .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:24px; margin-bottom:32px; }
  .stat-card { 
    background: rgba(30, 41, 59, 0.5); 
    backdrop-filter: blur(12px);
    border:1px solid rgba(255,255,255,0.08); 
    border-radius: 24px; 
    padding:24px; display:flex; align-items:center; gap:20px; transition:all .3s cubic-bezier(0.16, 1, 0.3, 1); animation:fadeUp .5s ease backwards; 
  }
  .stat-card:hover { transform:translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.2); background: rgba(30, 41, 59, 0.7); }
  .stat-ic { width:56px; height:56px; border-radius:16px; background: rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:24px; border: 1px solid rgba(255,255,255,0.1); }
  .stat-val { font-family:var(--font-heading); font-size:32px; font-weight:800; letter-spacing:-1px; margin-bottom: 4px; color: #fff; }
  .stat-lbl { font-size:14px; font-weight: 500; color:var(--text-muted); }
  
  .card { 
    background: rgba(30, 41, 59, 0.5); 
    backdrop-filter: blur(12px);
    border:1px solid rgba(255,255,255,0.08); 
    border-radius: 24px; 
    padding:32px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
  }
  .card-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
  .card-ttl { font-family:var(--font-heading); font-size:18px; font-weight:800; display:flex; align-items:center; gap:10px; color: #fff; }
  .sec-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
  .sec-ttl { font-family:var(--font-heading); font-size:24px; font-weight:800; letter-spacing: -0.5px; color:#fff;}

  /* ── Products Grid ────────────────────────────────────────────────── */
  .prod-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:24px; }
  .prod-card { 
    background: rgba(30, 41, 59, 0.6); 
    backdrop-filter: blur(12px);
    border:1px solid rgba(255,255,255,0.08); 
    border-radius: 24px; 
    overflow:hidden; transition:all .3s cubic-bezier(0.16, 1, 0.3, 1); animation:fadeUp .5s ease backwards; 
  }
  .prod-card:hover { 
    transform:translateY(-8px); 
    box-shadow: 0 24px 48px rgba(0,0,0,.6); 
    border-color:rgba(139, 92, 246, 0.4); 
  }
  .prod-img { height:220px; background: rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; font-size:64px; position:relative; overflow:hidden; }
  .prod-img img { width:100%; height:100%; object-fit:cover; transition: transform 0.5s ease; }
  .prod-card:hover .prod-img img { transform: scale(1.05); }
  
  .type-badge { position:absolute; top:12px; right:12px; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); }
  .tb-em { background:rgba(14, 165, 233, 0.8); color:#fff; }
  .tb-fr { background:rgba(34,197,94,.8); color:#fff; }
  .tb-cs { background:rgba(245,158,11,.8); color:#fff; }
  
  .wish-btn { position:absolute; top:12px; left:12px; width:36px; height:36px; border-radius:50%; background:rgba(15,23,42,.6); border:1px solid rgba(255,255,255,0.1); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; transition:all .2s; backdrop-filter:blur(8px); color: #fff; }
  .wish-btn:hover,.wish-btn.on { background:rgba(225,29,72,.9); border-color: transparent; }
  
  .prod-body { padding:20px; }
  .prod-cat { font-size:12px; color:var(--text-dim); margin-bottom:8px; display:flex; align-items:center; gap:6px; font-weight: 500; }
  .prod-name { font-family:var(--font-heading); font-size:18px; font-weight:700; margin-bottom:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color: #fff; }
  .prod-desc { font-size:13px; color:var(--text-muted); line-height:1.6; margin-bottom:12px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .prod-stars { display:flex; align-items:center; gap:4px; font-size:14px; color:#fbbf24; margin-bottom:16px; }
  .prod-foot { display:flex; align-items:center; justify-content:space-between; }
  .prod-price { font-family:var(--font-heading); font-size:22px; font-weight:800; color: #c084fc; }
  .prod-price span { font-size:13px; color:var(--text-dim); font-family:var(--font-body); font-weight: 500; }
  .prod-btns { display:flex; gap:8px; }
  
  .btn-sm { padding:8px 14px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; font-family:var(--font-body); transition:all .2s; border:none; }
  .btn-avis-sm { background:rgba(245,158,11,.15); border:1px solid rgba(245,158,11,.3) !important; color:#fbbf24; }
  .btn-avis-sm:hover { background:rgba(245,158,11,.3); color: #fff; }
  .btn-cart-sm { background:linear-gradient(135deg, var(--primary), var(--secondary)); color:#fff; }
  .btn-cart-sm:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(139, 92, 246, 0.4); }

  /* ── Skeleton ─────────────────────────────────────────────────────── */
  .skel { background:linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%); background-size:400% 100%; animation:shimmer 1.5s infinite; border-radius:12px; }
  .skel-card { background:rgba(30, 41, 59, 0.4); border:1px solid rgba(255,255,255,0.05); border-radius:24px; overflow:hidden; }
  .skel-img { height:220px; border-radius: 0; } .skel-body { padding:20px; display:flex; flex-direction:column; gap:12px; }
  .skel-l { height:14px; } .skel-l.s { width:60%; } .skel-l.m { width:80%; }

  /* ── Table ────────────────────────────────────────────────────────── */
  .tbl-card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(12px); border:1px solid rgba(255,255,255,0.08); border-radius:24px; overflow:hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
  table { width:100%; border-collapse:collapse; }
  thead tr { border-bottom:1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); }
  th { padding:16px 20px; text-align:left; font-size:12px; font-weight:700; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px; }
  td { padding:18px 20px; font-size:14px; border-bottom:1px solid rgba(255,255,255,0.05); vertical-align:middle; color: var(--text-muted); }
  tr:last-child td { border-bottom:none; }
  tbody tr { transition:background .2s; }
  tbody tr:hover { background: rgba(255,255,255,0.03); }
  .av-sm { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #c084fc, #38bdf8); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; color: #fff; }

  /* ── Badges ───────────────────────────────────────────────────────── */
  .badge { display:inline-flex; align-items:center; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:600; border: 1px solid rgba(255,255,255,0.1); }
  .badge-v { background:rgba(139, 92, 246, 0.15); color:#c084fc; border-color: rgba(139, 92, 246, 0.3); }
  .badge-r { background:rgba(225, 29, 72, 0.15); color:#fb7185; border-color: rgba(225, 29, 72, 0.3); }
  .badge-b { background:rgba(14, 165, 233, 0.15); color:#38bdf8; border-color: rgba(14, 165, 233, 0.3); }
  .badge-g { background:rgba(34, 197, 94, 0.15); color:#4ade80; border-color: rgba(34, 197, 94, 0.3); }
  .badge-y { background:rgba(245, 158, 11, 0.15); color:#fbbf24; border-color: rgba(245, 158, 11, 0.3); }
  .badge-gray { background:rgba(255,255,255,.1); color:var(--text-muted); border-color: rgba(255,255,255,0.2); }

  /* ── Modal ────────────────────────────────────────────────────────── */
  .overlay { position:fixed; inset:0; background:rgba(15, 23, 42, 0.8); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:200; animation:fadeIn .3s ease; padding: 20px; }
  .modal { 
    background: rgba(30, 41, 59, 0.85); 
    backdrop-filter: blur(24px); 
    border: 1px solid rgba(255,255,255,0.15); 
    border-radius: 28px; 
    padding:40px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto; 
    animation:fadeUp .4s cubic-bezier(0.16, 1, 0.3, 1); position:relative; box-shadow:0 30px 80px rgba(0,0,0,.7); 
  }
  .modal::-webkit-scrollbar { width: 4px; }
  .modal-ttl { font-family:var(--font-heading); font-size:24px; font-weight:800; margin-bottom:32px; color: #fff; letter-spacing: -0.5px; }
  .modal-x { position:absolute; top:24px; right:24px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:var(--text-muted); cursor:pointer; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; transition:all .2s; }
  .modal-x:hover { background:rgba(225,29,72,.2); color:#fb7185; border-color: rgba(225,29,72,.4); }
  
  .form-actions { display:flex; gap:16px; margin-top:32px; justify-content:flex-end; }
  .btn-sec { padding:12px 24px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius-sm); color:var(--text-muted); font-family:var(--font-body); font-weight: 600; font-size:15px; cursor:pointer; transition:all .2s; }
  .btn-sec:hover { background:rgba(255,255,255,0.1); color:#fff; }
  .btn-sub { padding:12px 28px; background:linear-gradient(135deg, var(--primary), var(--secondary)); border:none; border-radius:var(--radius-sm); color:#fff; font-family:var(--font-heading); font-size:16px; font-weight:700; cursor:pointer; transition:all .3s; }
  .btn-sub:hover { transform:translateY(-2px); box-shadow:0 10px 24px rgba(139, 92, 246, 0.4); }
  
  .btn-add { padding:10px 20px; background:linear-gradient(135deg, var(--primary), var(--secondary)); border:none; border-radius:40px; color:#fff; font-size:14px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px; font-family:var(--font-body); transition:all .3s; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); }
  .btn-add:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(139, 92, 246, 0.5); }
  
  .btn-outline { padding:10px 20px; background:rgba(139, 92, 246, 0.1); border:1.5px solid #c084fc; border-radius:var(--radius-sm); color:#c084fc; font-size:14px; font-weight:600; cursor:pointer; font-family:var(--font-body); transition:all .2s; }
  .btn-outline:hover { background:rgba(139, 92, 246, 0.2); color: #fff; }

  /* ── Toast ────────────────────────────────────────────────────────── */
  .toast { 
    position:fixed; bottom:32px; right:32px; 
    background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(16px);
    border:1px solid rgba(255,255,255,0.1); border-left:4px solid #4ade80; 
    border-radius:16px; padding:16px 24px; display:flex; align-items:center; gap:12px; 
    box-shadow: 0 20px 40px rgba(0,0,0,0.5); z-index:300; font-size:15px; font-weight: 500; color: #fff;
    animation:fadeUp .4s cubic-bezier(0.16, 1, 0.3, 1); max-width:400px; 
  }
  .toast.error { border-left-color:#fb7185; }

  /* ── Filter chips ─────────────────────────────────────────────────── */
  .filter-row { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:32px; }
  .chip { padding:8px 20px; border-radius:40px; font-size:14px; font-weight:600; cursor:pointer; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); color:var(--text-muted); transition:all .3s; backdrop-filter: blur(4px); }
  .chip.on { background:linear-gradient(135deg, var(--primary), var(--secondary)); border-color:transparent; color:#fff; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); }
  .chip:not(.on):hover { background: rgba(255,255,255,0.1); color:#fff; transform: translateY(-2px); }

  /* ── Avis Stars ───────────────────────────────────────────────────── */
  .star { font-size:24px; cursor:pointer; transition:transform .2s; display:inline-block; }
  .star:hover { transform:scale(1.3); }
  .star.on { color:#fbbf24; filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.5)); } .star.off { color:rgba(255,255,255,0.2); }

  /* ── Admin Bar Chart ──────────────────────────────────────────────── */
  .bar-chart { display:flex; flex-direction:column; gap:16px; margin-top:24px; }
  .bar-row { display:flex; align-items:center; gap:16px; }
  .bar-lbl { font-size:13px; font-weight: 600; color:var(--text-muted); width:110px; flex-shrink:0; }
  .bar-track { flex:1; height:10px; background:rgba(0,0,0,0.3); border-radius:5px; overflow:hidden; border: 1px solid rgba(255,255,255,0.05); }
  .bar-fill { height:100%; border-radius:5px; transition:width 1.5s cubic-bezier(0.16, 1, 0.3, 1); background: linear-gradient(90deg, var(--primary), var(--secondary)); box-shadow: 0 0 10px rgba(139, 92, 246, 0.5); }
  .bar-val { font-size:13px; font-weight:800; width:36px; text-align:right; color: #fff; }

  /* ── Image upload preview ─────────────────────────────────────────── */
  .img-preview { width:100px; height:100px; border-radius:16px; object-fit:cover; border:1px solid rgba(255,255,255,0.2); margin-top:12px; }
  .file-inp { width:100%; padding:16px; background:rgba(0,0,0,0.2); border:2px dashed rgba(255,255,255,0.15); border-radius:var(--radius-sm); color:var(--text-muted); cursor:pointer; font-size:14px; font-weight: 500; font-family:var(--font-body); transition:all .3s; text-align: center; }
  .file-inp:hover { border-color:var(--primary); background: rgba(139, 92, 246, 0.05); color: #fff; }

  /* ── Avis card ────────────────────────────────────────────────────── */
  .avis-item { padding:20px 0; border-bottom:1px solid rgba(255,255,255,0.08); }
  .avis-item:last-child { border-bottom:none; padding-bottom: 0; }
  .avis-hdr { display:flex; align-items:center; gap:12px; margin-bottom:12px; }

  /* ── Promo ────────────────────────────────────────────────────────── */
  .promo-row { display:flex; gap:12px; margin-top:12px; }
  .promo-inp { flex:1; background:rgba(0,0,0,0.2); border:1.5px solid rgba(255,255,255,0.08); border-radius:var(--radius-sm); padding:12px 16px; color:#fff; font-family:var(--font-body); font-size:15px; outline:none; text-transform:uppercase; letter-spacing: 1px; font-weight: 600; transition: border-color .3s; }
  .promo-inp:focus { border-color:#4ade80; }
  .promo-btn { padding:12px 24px; background:linear-gradient(135deg,#059669,#10b981); border:none; border-radius:var(--radius-sm); color:#fff; font-family:var(--font-heading); font-size:15px; font-weight:700; cursor:pointer; transition: all .3s; }
  .promo-btn:hover { box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4); transform: translateY(-2px); }
  .promo-ok { background:rgba(16, 185, 129, 0.15); border:1px solid rgba(16, 185, 129, 0.3); border-radius:var(--radius-sm); padding:12px 16px; color:#4ade80; font-size:14px; font-weight: 600; display:flex; align-items:center; gap:10px; margin-top:16px; }

  /* ── Suivi steps ──────────────────────────────────────────────────── */
  .steps-row { display:flex; align-items:center; margin:32px 0; }
  .step-c { display:flex; flex-direction:column; align-items:center; flex:1; }
  .step-ic { width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; border:2px solid rgba(255,255,255,0.1); background:rgba(30, 41, 59, 0.8); margin-bottom:12px; transition:all .4s; z-index: 2; color: var(--text-dim); }
  .step-ic.done { background:#10b981; border-color:#10b981; color: #fff; box-shadow: 0 0 16px rgba(16, 185, 129, 0.4); }
  .step-ic.active { background:var(--primary); border-color:var(--primary); color: #fff; box-shadow:0 0 20px rgba(139, 92, 246, 0.6); }
  .step-lbl { font-size:12px; font-weight: 600; color:var(--text-muted); text-align:center; }
  .step-line { flex:1; height:3px; background:rgba(255,255,255,0.1); margin-top:-28px; z-index: 1; transition: background .5s; }
  .step-line.done { background:#10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.5); }
  /* ── Suivi Commande ── */
  .suivi-timeline { display:flex; align-items:center; margin:24px 0; overflow-x:auto; padding:8px 0; }
  .suivi-step { display:flex; flex-direction:column; align-items:center; flex:1; min-width:80px; }
  .suivi-step-ic { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; border:2px solid var(--border,rgba(255,255,255,0.1)); background:var(--bg2,#13161e); margin-bottom:8px; transition:all .3s; flex-shrink:0; }
  .suivi-step-ic.done   { background:#22c55e; border-color:#22c55e; box-shadow:0 0 12px rgba(34,197,94,.4); }
  .suivi-step-ic.active { background:var(--violet,#7c3aed); border-color:var(--violet,#7c3aed); box-shadow:0 0 16px rgba(124,58,237,.5); animation:pulse-step 2s infinite; }
  @keyframes pulse-step { 0%,100%{box-shadow:0 0 16px rgba(124,58,237,.5);} 50%{box-shadow:0 0 28px rgba(124,58,237,.8);} }
  .suivi-step-lbl { font-size:11px; text-align:center; color:var(--txt2,#8892a4); transition:color .3s; }
  .suivi-step-lbl.active { color:var(--violet,#7c3aed); font-weight:700; }
  .suivi-step-lbl.done   { color:#22c55e; }
  .suivi-line { flex:1; height:2px; background:var(--border,rgba(255,255,255,0.1)); margin-top:-24px; transition:background .5s; min-width:20px; }
  .suivi-line.done { background:#22c55e; }
  .etape-item { display:flex; gap:14px; padding:12px 0; border-bottom:1px solid var(--border,rgba(255,255,255,0.07)); }
  .etape-item:last-child { border-bottom:none; }
  .etape-dot { width:12px; height:12px; border-radius:50%; background:var(--violet,#7c3aed); flex-shrink:0; margin-top:4px; }
  .etape-dot.last { background:#22c55e; box-shadow:0 0 8px rgba(34,197,94,.5); }
  .tracking-card { background:var(--bg2,#13161e); border:1px solid var(--border,rgba(255,255,255,0.07)); border-radius:16px; padding:24px; margin-bottom:16px; }
  .tracking-num { font-family:monospace; color:var(--violet,#7c3aed); font-size:16px; font-weight:700; letter-spacing:2px; }
  .livreur-card { display:flex; align-items:center; gap:12px; padding:14px 18px; background:var(--bg3,#1a1e2a); border-radius:12px; margin-top:12px; }
  .livreur-av { width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg,#22c55e,#16a34a); display:flex; align-items:center; justify-content:center; font-size:18px; }
 
  
 
  /* ── Portail Fournisseur ── */
  .f-card { background:var(--bg2); border:1.5px solid var(--border); border-radius:16px; padding:20px; transition:all .25s; animation:fadeUp .4s ease backwards; cursor:pointer; }
  .f-card:hover { transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,.4); border-color:rgba(124,58,237,.3); }
  .f-score { display:flex; flex-direction:column; align-items:center; }
  .f-score-ring { position:relative; width:64px; height:64px; }
  .f-score-val { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:14px; font-weight:800; }
  .stat-mini { display:flex; align-items:center; gap:6px; padding:6px 10px; background:var(--bg3); border-radius:8px; font-size:12px; }
  .stat-mini-val { font-weight:700; }
  .cmd-f-row { display:flex; align-items:center; gap:14px; padding:12px 16px; border-bottom:1px solid var(--border); transition:background .15s; }
  .cmd-f-row:hover { background:var(--bg3); }
  .cmd-f-row:last-child { border-bottom:none; }
 
  /* ── Chatbot ── */
  .chat-fab { position:fixed; bottom:24px; right:24px; width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,var(--violet-d,#6d28d9),var(--violet,#7c3aed)); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:24px; box-shadow:0 8px 24px rgba(124,58,237,.5); z-index:150; transition:all .25s; }
  .chat-fab:hover { transform:scale(1.1) translateY(-2px); box-shadow:0 12px 32px rgba(124,58,237,.7); }
  .chat-fab .notif-cnt { position:absolute; top:0; right:0; }
  .chat-window { position:fixed; bottom:90px; right:24px; width:360px; height:520px; background:var(--bg2,#13161e); border:1px solid var(--border); border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,.6); z-index:150; display:flex; flex-direction:column; overflow:hidden; animation:slideUp .3s ease; }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .chat-header { padding:16px 18px; background:linear-gradient(135deg,var(--violet-d,#6d28d9),var(--violet,#7c3aed)); display:flex; align-items:center; gap:12px; flex-shrink:0; }
  .chat-av { width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .chat-name { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#fff; }
  .chat-status { font-size:11px; color:rgba(255,255,255,.7); display:flex; align-items:center; gap:4px; }
  .chat-online-dot { width:7px; height:7px; border-radius:50%; background:#22c55e; }
  .chat-close { margin-left:auto; background:rgba(255,255,255,.15); border:none; color:#fff; cursor:pointer; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; transition:background .2s; }
  .chat-close:hover { background:rgba(255,255,255,.3); }
  .chat-msgs { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; }
  .chat-msgs::-webkit-scrollbar { width:4px; }
  .chat-msgs::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
  .msg-row { display:flex; gap:8px; animation:fadeUp .3s ease; }
  .msg-row.bot { align-self:flex-start; }
  .msg-row.user { align-self:flex-end; flex-direction:row-reverse; }
  .msg-av { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,var(--violet-d),var(--violet)); display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; align-self:flex-end; }
  .msg-av.user-av { background:linear-gradient(135deg,var(--red-d,#c1121f),var(--red,#e63946)); }
  .msg-bubble { max-width:240px; padding:10px 14px; border-radius:16px; font-size:13px; line-height:1.5; }
  .msg-bubble.bot  { background:var(--bg3,#1a1e2a); border:1px solid var(--border); border-bottom-left-radius:4px; color:var(--txt); }
  .msg-bubble.user { background:linear-gradient(135deg,var(--violet-d),var(--violet)); color:#fff; border-bottom-right-radius:4px; }
  .msg-time { font-size:10px; color:var(--txt3); margin-top:3px; }
  .chat-suggestions { display:flex; gap:6px; flex-wrap:wrap; padding:0 16px 10px; }
  .chat-sug { padding:5px 12px; background:var(--bg3); border:1px solid var(--border); border-radius:20px; font-size:11px; color:var(--txt2); cursor:pointer; transition:all .2s; flex-shrink:0; font-family:var(--font-b); }
  .chat-sug:hover { border-color:var(--violet); color:var(--txt); }
  .chat-typing { display:flex; gap:5px; padding:8px 12px; background:var(--bg3); border-radius:12px; align-self:flex-start; }
  .chat-typing span { width:7px; height:7px; border-radius:50%; background:var(--txt3); animation:typing-dot 1.4s infinite; }
  .chat-typing span:nth-child(2) { animation-delay:.2s; }
  .chat-typing span:nth-child(3) { animation-delay:.4s; }
  @keyframes typing-dot { 0%,80%,100%{opacity:.3;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
  .chat-input-row { padding:12px 14px; border-top:1px solid var(--border); display:flex; gap:8px; flex-shrink:0; }
  .chat-inp { flex:1; background:var(--bg3); border:1.5px solid var(--border); border-radius:24px; padding:9px 16px; color:var(--txt); font-family:var(--font-b); font-size:13px; outline:none; transition:border-color .2s; }
  .chat-inp:focus { border-color:var(--violet); }
  .chat-send { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,var(--violet-d),var(--violet)); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#fff; font-size:16px; transition:all .2s; flex-shrink:0; }
  .chat-send:hover { transform:scale(1.1); }
  .chat-send:disabled { opacity:.5; cursor:not-allowed; transform:none; }
  .chat-categorie { font-size:10px; color:var(--txt3); margin-top:2px; text-transform:uppercase; letter-spacing:.5px; }
`;
 
// ─── SVG Icons ────────────────────────────────────────────────────────
const Icon = ({ n, s = 18 }) => {
  const icons = {
    shop: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    home: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 002 2h14a2 2 0 002-2V6h-14z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    tag:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    pkg:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    users:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
    chart:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    srch: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    plus: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    eye:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    eyeo: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    user: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    lock: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    out:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    menu: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    ok:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    cart: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
    heart:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    star: <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    dlvr: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    gift: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>,
    order:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    admin:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    wish: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    x:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  };
  return icons[n] || null;
};
 
// ─── Helpers ──────────────────────────────────────────────────────────
const authH = () => {
  const t = localStorage.getItem('access_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};
const jsonH = () => ({ ...authH(), 'Content-Type': 'application/json' });
 
function Toast({ msg, type = 'ok', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className={`toast ${type === 'error' ? 'error' : ''}`}><Icon n={type === 'error' ? 'x' : 'ok'} s={16} />{msg}</div>;
}
 
function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-x" onClick={onClose}><Icon n="x" s={14} /></button>
        <div className="modal-ttl">{title}</div>
        {children}
      </div>
    </div>
  );
}
 
// ─── Auth ─────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({ x: -(y / rect.height) * 20, y: (x / rect.width) * 20 });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });
  const [showP, setShowP] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', email: '', first_name: '', last_name: '' });
 
  const handle = async () => {
    setLoading(true); setErr('');
    try {
      const url = tab === 'login' ? '/api/auth/login/' : '/api/auth/register/';
      const body = tab === 'login' ? { username: form.username, password: form.password } : form;
      const res = await fetch(`${DJANGO_URL}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        if (tab === 'login') {
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          onLogin(data.user);
        } else { setTab('login'); setErr(''); }
      } else { setErr(data.error || data.detail || 'Erreur'); }
    } catch { setErr('Impossible de joindre le serveur.'); }
    setLoading(false);
  };
 
  return (
    <div className="auth-wrap">
      {/* Left */}
      <div className="auth-left">
        <div className="auth-left-img" />
        <div className="blob blob1" /><div className="blob blob2" /><div className="blob blob3" />
        <div className="auth-left-content">
          <div className="auth-logo">Honey House 2026</div>
          <p className="auth-tagline">Votre plateforme unifiée — gérez votre catalogue et connectez vos projets.</p>
          <div className="auth-stat-row">
            <div className="auth-stat"><div className="auth-stat-n">500+</div><div className="auth-stat-l">Produits</div></div>
            <div className="auth-stat"><div className="auth-stat-n">100+</div><div className="auth-stat-l">Fournisseurs</div></div>
            <div className="auth-stat"><div className="auth-stat-n">2K+</div><div className="auth-stat-l">Commandes</div></div>
          </div>
        </div>
      </div>
      {/* Right */}
      <div className="auth-right" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ perspective: "1000px" }}>
        <div className="auth-card" style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: tilt.x === 0 ? "transform 0.5s ease" : "none" }}>
          <div className="auth-title"><span className="typing-eff" key={tab}>{tab === 'login' ? 'Bon retour 👋' : 'Créer un compte'}</span></div>
          <div className="auth-sub">{tab === 'login' ? 'Connectez-vous à votre espace de gestion' : 'Rejoignez Honey House'}</div>
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Connexion</button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Inscription</button>
          </div>
          {err && <div className="err-msg"><Icon n="x" s={14} />{err}</div>}
          {tab === 'register' && (
            <div className="form-row" style={{ marginBottom: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Prénom</label>
                <input className="form-inp inp-plain" placeholder="Yassine" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nom</label>
                <input className="form-inp inp-plain" placeholder="Ben Ali" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
              </div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Nom d'utilisateur</label>
            <div className="input-w">
              <span className="input-ic"><Icon n="user" s={15} /></span>
              <input className="form-inp" placeholder="username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} onKeyDown={e => e.key === 'Enter' && handle()} />
            </div>
          </div>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-inp inp-plain" type="email" placeholder="email@exemple.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div className="input-w">
              <span className="input-ic"><Icon n="lock" s={15} /></span>
              <input className="form-inp" type={showP ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === 'Enter' && handle()} />
              <button className="inp-right" onClick={() => setShowP(!showP)}><Icon n={showP ? 'eyeo' : 'eye'} s={16} /></button>
            </div>
          </div>
          <button className={`btn-main btn-violet ${loading ? 'btn-disabled' : ''}`} onClick={handle} disabled={loading}>
            {loading ? 'Chargement…' : tab === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ─── Project Selector ─────────────────────────────────────────────────
function ProjectSelector({ user, onSelect, onLogout }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="selector-page">
      <div className={`bg-layer ${hovered === 'myshop' ? 'active' : ''}`} style={{ backgroundImage: `url(${appBg})` }} />
      <div className={`bg-layer ${hovered === 'blood' ? 'active' : ''}`} style={{ backgroundImage: `url(${bloodBg})` }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at center, rgba(15,23,42,0.6), rgba(15,23,42,0.95))', zIndex: -1, pointerEvents: 'none' }} />
      <div className="blob blob1" style={{ position: 'fixed', width: 600, height: 600, top: -200, left: -200, opacity: .15 }} />
      <div className="blob blob2" style={{ position: 'fixed', width: 500, height: 500, bottom: -200, right: -200, opacity: .12 }} />
 
      <div className="selector-user">
        <div className="user-av">{(user.username || 'U')[0].toUpperCase()}</div>
        <span className="user-nm">{user.username}</span>
        <div className="user-dot" />
        <button className="logout-btn" onClick={onLogout}><Icon n="out" s={12} /> Déconnexion</button>
      </div>
 
      <div className="selector-title">
        Bienvenue, <span className="grad-text">{user.username}</span> 👋
      </div>
      <p className="selector-sub">Choisissez votre espace de travail</p>
 
      <div className="selector-cards">
        {/* Honey House Card */}
        <div className="proj-card myshop" onClick={() => onSelect('myshop')} onMouseEnter={() => setHovered('myshop')} onMouseLeave={() => setHovered(null)}>
          <div className="proj-strip v" />
          <span className="proj-icon">🛍️</span>
          <div className="proj-name">Honey House</div>
          <div className="proj-desc">Gérez votre catalogue produits, fournisseurs, commandes et administration.</div>
          <div className="proj-stats">
            <span className="proj-tag tag-v">Catalogue</span>
            <span className="proj-tag tag-b">Fournisseurs</span>
            <span className="proj-tag tag-v">Commandes</span>
          </div>
          <button className="proj-btn btn-main btn-violet">Accéder à Honey House →</button>
        </div>
 
        {/* BloodConnect Card */}
        <div className="proj-card blood" onClick={() => onSelect('miniprojet')} onMouseEnter={() => setHovered('blood')} onMouseLeave={() => setHovered(null)}>
          <div className="proj-strip r" />
          <span className="proj-icon" style={{ animationDelay: '.5s' }}>🩸</span>
          <div className="proj-name">BloodConnect</div>
          <div className="proj-desc">Plateforme de don de sang — connectez donneurs et hôpitaux en temps réel.</div>
          <div className="proj-stats">
            <span className="proj-tag tag-r">Donneurs</span>
            <span className="proj-tag tag-r">Hôpitaux</span>
            <span className="proj-tag tag-r">Campagnes</span>
          </div>
          <button className="proj-btn btn-main btn-red">Accéder à BloodConnect →</button>
        </div>
      </div>
 
      {/* Features */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, maxWidth: 700, width: '100%', marginTop: 48, animation: 'fadeUp .6s .35s ease backwards' }}>
        {[
          { ic: '🔐', t: 'Sécurisé', d: 'Authentification JWT robuste' },
          { ic: '⚡', t: 'Temps Réel', d: 'API Django REST performante' },
          { ic: '🎯', t: 'Intelligent', d: 'Matching & Gamification IA' },
        ].map(f => (
          <div key={f.t} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{f.ic}</div>
            <div style={{ fontFamily: 'var(--font-d)', fontWeight: 700, marginBottom: 4 }}>{f.t}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{f.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
 
// ─── Catalogue Page ────────────────────────────────────────────────────
function CataloguePage({ onToast, search, isAdmin, onViewDetail }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFil, setCatFil] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showAvis, setShowAvis] = useState(null);
  const [wishIds, setWishIds] = useState([]);
  const [form, setForm] = useState({ libelle: '', prix: '', type: 'em', description: '', Categorie: '', Fournisseur: '', img: null });
 
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rP, rC, rF, rW] = await Promise.all([
        fetch(`${DJANGO_URL}/api/produits/`, { headers: authH() }).catch(() => ({ json: () => [] })),
        fetch(`${DJANGO_URL}/api/categories/`, { headers: authH() }).catch(() => ({ json: () => [] })),
        fetch(`${DJANGO_URL}/api/fournisseurs/`, { headers: authH() }).catch(() => ({ json: () => [] })),
        fetch(`${DJANGO_URL}/api/wishlist/ids/`, { headers: authH() }).catch(() => ({ json: () => [] })),
      ]);
      setProducts(await rP.json().then(d => Array.isArray(d) ? d : d?.results || []).catch(() => []));
      setCategories(await rC.json().then(d => Array.isArray(d) ? d : d?.results || []).catch(() => []));
      setFournisseurs(await rF.json().then(d => Array.isArray(d) ? d : d?.results || []).catch(() => []));
      setWishIds(await rW.json().then(d => Array.isArray(d) ? d : []).catch(() => []));
    } catch { /* network error – silently ignore */ }
    setLoading(false);
  };
 
  useEffect(() => {
    let active = true;
    (async () => {
      if (active) await fetchAll();
    })();
    return () => { active = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
 
  const toggleWish = async (id) => {
    try {
      const res = await fetch(`${DJANGO_URL}/api/wishlist/${id}/toggle/`, { method: 'POST', headers: authH() });
      const d = await res.json();
      if (res.ok) {
        setWishIds(prev => d.action === 'added' ? [...prev, id] : prev.filter(x => x !== id));
        onToast(d.message);
      }
    } catch { /* network error – silently ignore */ }
  };
 
  const addProduit = async () => {
    if (!form.libelle || !form.prix) return;
    try {
      const fd = new FormData();
      ['libelle', 'prix', 'type', 'description'].forEach(k => fd.append(k, form[k]));
      if (form.Categorie) fd.append('Categorie', form.Categorie);
      if (form.Fournisseur) fd.append('Fournisseur', form.Fournisseur);
      if (form.img) fd.append('img', form.img);
      const res = await fetch(`${DJANGO_URL}/api/produits/`, { method: 'POST', headers: authH(), body: fd });
      if (res.ok) { await fetchAll(); setShowAdd(false); setForm({ libelle: '', prix: '', type: 'em', description: '', Categorie: '', Fournisseur: '', img: null }); onToast('✅ Produit ajouté !'); }
      else { const d = await res.json(); onToast(JSON.stringify(d), 'error'); }
    } catch { onToast('Erreur réseau', 'error'); }
  };
 
  const addCart = async (id, name) => {
    try {
      const res = await fetchAPI(`${DJANGO_URL}/api/panier/ajouter/`, { 
        method: 'POST', 
        body: JSON.stringify({ produit_id: id, quantite: 1 }) 
      });
      if (res.ok) onToast(`🛒 ${name} ajouté au panier !`);
      else {
        const data = await res.json();
        onToast(`Erreur: ${data.error || data.detail || 'Erreur serveur'}`, 'error');
      }
    } catch { onToast('Erreur réseau', 'error'); }
  };
 
  const filtered = products.filter(p => {
    const ms = !search || p.libelle?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const mc = !catFil || p.Categorie === parseInt(catFil) || p.categorie_nom === catFil;
    return ms && mc;
  });
 
  const TYPE_MAP = { em: { l: 'Emballé', c: 'tb-em' }, fr: { l: 'Frais', c: 'tb-fr' }, cs: { l: 'Conserve', c: 'tb-cs' } };
  const imgSrc = img => img ? (img.startsWith('http') ? img : `${DJANGO_URL}/media/${img.replace(/^\/media\//, '')}`) : null;
 
  return (
    <>
      <div className="sec-hdr" style={{ marginBottom: 16 }}>
        <div className="sec-ttl">Catalogue <span style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--font-b)', fontWeight: 400 }}>({filtered.length})</span></div>
        {isAdmin && <button className="btn-add" onClick={() => setShowAdd(true)}><Icon n="plus" s={14} /> Ajouter</button>}
      </div>
 
      {/* Category filter */}
      <div className="filter-row">
        <button className={`chip ${!catFil ? 'on' : ''}`} onClick={() => setCatFil('')}>Tous</button>
        {categories.map(c => <button key={c.id} className={`chip ${catFil === String(c.id) ? 'on' : ''}`} onClick={() => setCatFil(catFil === String(c.id) ? '' : String(c.id))}>{c.nom}</button>)}
      </div>
 
      {loading ? (
        <div className="prod-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skel-card"><div className="skel skel-img" /><div className="skel-body"><div className="skel skel-l s" /><div className="skel skel-l m" /><div className="skel skel-l" /></div></div>
          ))}
        </div>
      ) : (
        <div className="prod-grid">
          {filtered.length === 0 ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text3)' }}>Aucun produit trouvé</div>
            : filtered.map((p, i) => (
              <div key={p.id} className="prod-card" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="prod-img" onClick={() => onViewDetail(p.id)} style={{ cursor: 'pointer' }}>
                  {imgSrc(p.img) ? <img src={imgSrc(p.img)} alt={p.libelle} onError={e => e.target.style.display = 'none'} /> : <span>📦</span>}
                  {p.type && <span className={`type-badge ${TYPE_MAP[p.type]?.c || 'tb-em'}`}>{TYPE_MAP[p.type]?.l || p.type}</span>}
                  <button className={`wish-btn ${wishIds.includes(p.id) ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); toggleWish(p.id); }}>
                    {wishIds.includes(p.id) ? '♥' : '♡'}
                  </button>
                </div>
                <div className="prod-body">
                  <div className="prod-cat"><Icon n="tag" s={11} />{p.categorie_nom || '—'}</div>
                  <div className="prod-name" onClick={() => onViewDetail(p.id)} style={{ cursor: 'pointer' }}>{p.libelle}</div>
                  <div className="prod-desc">{p.description}</div>
                  {p.moyenne_avis > 0 && <div className="prod-stars">{'★'.repeat(Math.round(p.moyenne_avis))}{'☆'.repeat(5 - Math.round(p.moyenne_avis))}<span style={{ color: 'var(--text3)', marginLeft: 4 }}>({p.nb_avis})</span></div>}
                  <div className="prod-foot">
                    <div className="prod-price">{p.prix} <span>DT</span></div>
                    <div className="prod-btns">
                      <button className="btn-sm btn-avis-sm" onClick={() => setShowAvis(p.id)}>⭐</button>
                      <button className="btn-sm btn-cart-sm" onClick={() => addCart(p.id, p.libelle)}><Icon n="cart" s={13} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
 
      {/* Add Modal */}
      {isAdmin && showAdd && (
        <Modal title="➕ Nouveau Produit" onClose={() => setShowAdd(false)}>
          <div className="form-group"><label className="form-label">Libellé *</label><input className="form-inp inp-plain" placeholder="Nom du produit" value={form.libelle} onChange={e => setForm({ ...form, libelle: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Prix (DT) *</label><input className="form-inp inp-plain" type="number" placeholder="0.00" value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Type</label><select className="form-sel" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="em">Emballé</option><option value="fr">Frais</option><option value="cs">Conserve</option></select></div>
          </div>
          <div className="form-group"><label className="form-label">Catégorie</label><select className="form-sel" value={form.Categorie} onChange={e => setForm({ ...form, Categorie: e.target.value })}><option value="">-- Choisir --</option>{categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Fournisseur</label><select className="form-sel" value={form.Fournisseur} onChange={e => setForm({ ...form, Fournisseur: e.target.value })}><option value="">-- Choisir --</option>{fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-inp inp-plain" rows={3} placeholder="Description…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Photo</label><input type="file" accept="image/*" className="file-inp" onChange={e => setForm({ ...form, img: e.target.files[0] })} />{form.img && <img className="img-preview" src={URL.createObjectURL(form.img)} alt="" />}</div>
          <div className="form-actions"><button className="btn-sec" onClick={() => setShowAdd(false)}>Annuler</button><button className="btn-sub" onClick={addProduit}>Ajouter le produit</button></div>
        </Modal>
      )}
 
      {/* Avis Modal */}
      {showAvis && <AvisModal pid={showAvis} onClose={() => { setShowAvis(null); fetchAll(); }} onToast={onToast} />}
    </>
  );
}
 
// ─── Product Detail Page ──────────────────────────────────────────────
function ProductDetailPage({ productId, onBack, onToast }) {
  const [product, setProduct] = useState(null);
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWished, setIsWished] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const [pRes, aRes, wRes] = await Promise.all([
          fetch(`${DJANGO_URL}/api/produits/${productId}/`, { headers: authH() }),
          fetch(`${DJANGO_URL}/api/produits/${productId}/avis/`, { headers: authH() }),
          fetch(`${DJANGO_URL}/api/wishlist/ids/`, { headers: authH() }).catch(() => ({ json: () => [] })),
        ]);
        const pData = await pRes.json();
        const aData = await aRes.json();
        const wData = await wRes.json();
        setProduct(pData);
        setAvis(aData.avis || []);
        setIsWished(wData.includes(productId));
      } catch {
        onToast('Erreur de chargement', 'error');
      }
      setLoading(false);
    };
    loadProduct();
  }, [productId, onToast]);

  const toggleWish = async () => {
    try {
      const res = await fetch(`${DJANGO_URL}/api/wishlist/${productId}/toggle/`, { method: 'POST', headers: authH() });
      const d = await res.json();
      if (res.ok) {
        setIsWished(d.action === 'added');
        onToast(d.message);
      }
    } catch { /* network error */ }
  };

  const addCart = async () => {
    try {
      const res = await fetchAPI(`${DJANGO_URL}/api/panier/ajouter/`, { 
        method: 'POST', 
        body: JSON.stringify({ produit_id: productId, quantite: quantity }) 
      });
      if (res.ok) onToast(`🛒 ${quantity}x ${product.libelle} ajouté au panier !`);
      else {
        const data = await res.json();
        onToast(`Erreur: ${data.error || data.detail || 'Erreur serveur'}`, 'error');
      }
    } catch (e) { onToast(`Erreur réseau: ${e.message}`, 'error'); }
  };

  const imgSrc = img => img ? (img.startsWith('http') ? img : `${DJANGO_URL}/media/${img.replace(/^\/media\//, '')}`) : null;
  const TYPE_MAP = { em: { l: 'Emballé', c: 'badge-v' }, fr: { l: 'Frais', c: 'badge-g' }, cs: { l: 'Conserve', c: 'badge-y' } };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text3)' }}>Chargement…</div>;
  if (!product) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text3)' }}>Produit introuvable</div>;

  return (
    <>
      <button className="back-btn" onClick={onBack} style={{ marginBottom: 20, fontSize: 14 }}>
        ← Retour au catalogue
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
        {/* Image Section */}
        <div className="card" style={{ position: 'relative' }}>
          <div style={{ width: '100%', height: 400, background: 'var(--bg3)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 16 }}>
            {imgSrc(product.img) ? <img src={imgSrc(product.img)} alt={product.libelle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span style="font-size:80px">📦</span>'; }} /> : <span style={{ fontSize: 80 }}>📦</span>}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {product.type && <span className={`badge ${TYPE_MAP[product.type]?.c || 'badge-v'}`}>{TYPE_MAP[product.type]?.l || product.type}</span>}
            {product.categorie_nom && <span className="badge badge-b"><Icon n="tag" s={11} /> {product.categorie_nom}</span>}
            {product.fournisseur_nom && <span className="badge badge-gray">🏭 {product.fournisseur_nom}</span>}
          </div>
        </div>

        {/* Info Section */}
        <div>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 32, fontWeight: 800, marginBottom: 8 }}>{product.libelle}</h1>
            {product.moyenne_avis > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ color: '#f59e0b', fontSize: 16 }}>{'★'.repeat(Math.round(product.moyenne_avis))}{'☆'.repeat(5 - Math.round(product.moyenne_avis))}</div>
                <span style={{ fontSize: 14, color: 'var(--text3)' }}>({product.nb_avis} avis)</span>
              </div>
            )}
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 40, fontWeight: 800, color: 'var(--violet)', marginBottom: 16 }}>
              {product.prix} <span style={{ fontSize: 20, color: 'var(--text3)', fontFamily: 'var(--font-b)' }}>DT</span>
            </div>
          </div>

          {product.description && (
            <div className="card" style={{ marginBottom: 20, background: 'var(--bg3)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Description</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text2)' }}>{product.description}</p>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="card" style={{ background: 'var(--bg3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Quantité :</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>−</button>
                <input type="number" min="1" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: 60, textAlign: 'center', padding: '6px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-b)' }} />
                <button onClick={() => setQuantity(quantity + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>+</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-sub" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={addCart}>
                <Icon n="cart" s={16} /> Ajouter au panier
              </button>
              <button onClick={toggleWish} style={{ padding: '10px 20px', background: isWished ? 'var(--red-soft)' : 'var(--bg2)', border: `1.5px solid ${isWished ? 'var(--red)' : 'var(--border)'}`, borderRadius: 'var(--r-sm)', color: isWished ? 'var(--red)' : 'var(--text2)', cursor: 'pointer', fontSize: 18, transition: 'all .2s' }}>
                {isWished ? '♥' : '♡'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Avis Section */}
      <div className="card">
        <div className="card-hdr">
          <div className="card-ttl">⭐ Avis clients ({avis.length})</div>
        </div>
        {avis.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Aucun avis pour le moment</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {avis.map(a => (
              <div key={a.id} className="avis-item">
                <div className="avis-hdr">
                  <div className="av-sm">{a.username[0].toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: 14 }}>{a.username}</strong>
                      {a.is_mine && <span className="badge badge-v" style={{ fontSize: 10 }}>Vous</span>}
                    </div>
                    <div style={{ color: '#f59e0b', fontSize: 13 }}>{'★'.repeat(a.note)}{'☆'.repeat(5 - a.note)} <span style={{ color: 'var(--text3)', fontSize: 12 }}>{a.date_avis}</span></div>
                  </div>
                </div>
                {a.commentaire && <p style={{ fontSize: 13, color: 'var(--text2)', paddingLeft: 42, lineHeight: 1.6, marginTop: 8 }}>{a.commentaire}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
 
// ─── Avis Modal ───────────────────────────────────────────────────────
function AvisModal({ pid, onClose, onToast }) {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    note: 0,
    commentaire: ''
  });

  const [hov, setHov] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${DJANGO_URL}/api/produits/${pid}/avis/`, {
      headers: jsonH()
    })
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [pid]);

  const submit = async () => {
    if (!form.note) {
      onToast('Choisissez une note !', 'error');
      return;
    }

    const res = await fetch(
      `${DJANGO_URL}/api/produits/${pid}/avis/`,
      {
        method: 'POST',
        headers: jsonH(),
        body: JSON.stringify(form)
      }
    );

    const d = await res.json();

    if (res.ok) {
      onToast(
        d.action === 'updated'
          ? '✅ Avis mis à jour !'
          : '✅ Avis publié !'
      );

      onClose();
    } else {
      onToast(d.error || 'Erreur', 'error');
    }
  };

  const del = async () => {
    await fetch(
      `${DJANGO_URL}/api/produits/${pid}/avis/supprimer/`,
      {
        method: 'DELETE',
        headers: jsonH()
      }
    );

    onToast('Avis supprimé.');
    onClose();
  };

  return (
    <Modal
      title="⭐ Avis & Évaluations"
      onClose={onClose}
    >
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: 40,
            color: 'var(--text3)'
          }}
        >
          Chargement…
        </div>
      ) : (
        <>
          {data?.count > 0 && (
            <div
              style={{
                display: 'flex',
                gap: 20,
                padding: 16,
                background: 'var(--bg3)',
                borderRadius: 12,
                marginBottom: 20
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-d)',
                    fontSize: 36,
                    fontWeight: 800,
                    color: '#f59e0b'
                  }}
                >
                  {data.moyenne}
                </div>

                <div
                  style={{
                    color: '#f59e0b',
                    fontSize: 14
                  }}
                >
                  {'★'.repeat(Math.round(data.moyenne))}
                  {'☆'.repeat(5 - Math.round(data.moyenne))}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text3)',
                    marginTop: 4
                  }}
                >
                  {data.count} avis
                </div>
              </div>

              <div style={{ flex: 1 }}>
                {[5, 4, 3, 2, 1].map(n => (
                  <div
                    key={n}
                    className="bar-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 6
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text3)',
                        width: 14
                      }}
                    >
                      {n}
                    </span>

                    <span
                      style={{
                        color: '#f59e0b',
                        fontSize: 11,
                        marginRight: 6
                      }}
                    >
                      ★
                    </span>

                    <div
                      className="bar-track"
                      style={{
                        flex: 1,
                        height: 8,
                        background: 'rgba(255,255,255,.08)',
                        borderRadius: 999,
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        className="bar-fill"
                        style={{
                          height: '100%',
                          background: '#f59e0b',
                          borderRadius: 999,
                          width: data.count
                            ? `${(
                                ((data.repartition?.[n] || 0) /
                                  data.count) *
                                100
                              ).toFixed(0)}%`
                            : '0%'
                        }}
                      />
                    </div>

                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text3)',
                        width: 16,
                        textAlign: 'right',
                        marginLeft: 6
                      }}
                    >
                      {data.repartition?.[n] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              background: 'var(--bg3)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 10
              }}
            >
              Votre note
            </div>

            <div
              style={{
                display: 'flex',
                gap: 4,
                marginBottom: 12
              }}
            >
              {[1, 2, 3, 4, 5].map(i => (
                <span
                  key={i}
                  className={`star ${
                    i <= (hov || form.note)
                      ? 'on'
                      : 'off'
                  }`}
                  onMouseEnter={() => setHov(i)}
                  onMouseLeave={() => setHov(0)}
                  onClick={() =>
                    setForm({
                      ...form,
                      note: i
                    })
                  }
                  style={{
                    cursor: 'pointer',
                    fontSize: 26,
                    color:
                      i <= (hov || form.note)
                        ? '#f59e0b'
                        : '#555'
                  }}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              className="form-inp inp-plain"
              rows={3}
              placeholder="Partagez votre expérience…"
              value={form.commentaire}
              onChange={e =>
                setForm({
                  ...form,
                  commentaire: e.target.value
                })
              }
            />

            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 10
              }}
            >
              <button
                className="btn-sub"
                style={{ flex: 1 }}
                onClick={submit}
              >
                Publier
              </button>

              {data?.avis?.some(a => a.is_mine) && (
                <button
                  onClick={del}
                  style={{
                    padding: '8px 14px',
                    background:
                      'rgba(230,57,70,.1)',
                    border:
                      '1px solid rgba(230,57,70,.2)',
                    borderRadius: 8,
                    color: 'var(--red)',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontFamily: 'var(--font-b)'
                  }}
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>

          {data?.avis?.map(a => (
            <div
              key={a.id}
              className="avis-item"
              style={{
                padding: 14,
                borderBottom:
                  '1px solid rgba(255,255,255,.06)'
              }}
            >
              <div
                className="avis-hdr"
                style={{
                  display: 'flex',
                  gap: 12
                }}
              >
                <div
                  className="av-sm"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700
                  }}
                >
                  {a.username[0].toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <strong
                      style={{ fontSize: 14 }}
                    >
                      {a.username}
                    </strong>

                    {a.is_mine && (
                      <span
                        className="badge badge-v"
                        style={{
                          fontSize: 10
                        }}
                      >
                        Vous
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      color: '#f59e0b',
                      fontSize: 12
                    }}
                  >
                    {'★'.repeat(a.note)}
                    {'☆'.repeat(5 - a.note)}

                    <span
                      style={{
                        color: 'var(--text3)',
                        fontSize: 12,
                        marginLeft: 6
                      }}
                    >
                      {a.date_avis}
                    </span>
                  </div>
                </div>
              </div>

              {a.commentaire && (
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text2)',
                    paddingLeft: 46,
                    lineHeight: 1.5,
                    marginTop: 8
                  }}
                >
                  {a.commentaire}
                </p>
              )}
            </div>
          ))}
        </>
      )}
    </Modal>
  );
}
 
// ─── Fournisseurs Page ─────────────────────────────────────────────────
function FournisseursPage({ onToast, isAdmin }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', adresse: '' });

  const fetch_ = () => fetch(`${DJANGO_URL}/api/fournisseurs/`, { headers: authH() }).then(r => r.json()).then(d => setData(Array.isArray(d) ? d : d?.results || [])).catch(() => setData([])).finally(() => setLoading(false));
  useEffect(() => { let active = true; if (active) fetch_(); return () => { active = false; }; }, []); // eslint-disable-line

  const add = async () => {
    if (!form.nom) { onToast('Le nom est obligatoire', 'error'); return; }
    const res = await fetch(`${DJANGO_URL}/api/fournisseurs/`, { method: 'POST', headers: jsonH(), body: JSON.stringify(form) });
    if (res.ok) { fetch_(); setShow(false); setForm({ nom: '', email: '', telephone: '', adresse: '' }); onToast('✅ Fournisseur ajouté !'); }
    else { const d = await res.json(); onToast(d?.error || JSON.stringify(d), 'error'); }
  };

  return (
    <>
      <div className="sec-hdr" style={{ marginBottom: 20 }}>
        <div className="sec-ttl">Fournisseurs <span style={{ fontSize: 14, color: 'var(--txt3)', fontFamily: 'var(--font-b)', fontWeight: 400 }}>({data.length})</span></div>
        {isAdmin && <button className="btn-add" onClick={() => setShow(true)}><Icon n="plus" s={14} /> Ajouter</button>}
      </div>
      <div className="tbl-card">
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--txt3)' }}>Chargement…</div> : (
          <table>
            <thead><tr><th>Fournisseur</th><th>Email</th><th>Téléphone</th><th>Adresse</th></tr></thead>
            <tbody>
              {data.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--txt3)' }}>Aucun fournisseur</td></tr>
                : data.map(f => (
                  <tr key={f.id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div className="av-sm">{(f.nom || 'F')[0].toUpperCase()}</div><strong>{f.nom}</strong></div></td>
                    <td style={{ color: 'var(--txt2)' }}>{f.email || '—'}</td>
                    <td>{f.telephone || '—'}</td>
                    <td style={{ color: 'var(--txt2)', fontSize: 13 }}>{f.adresse || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
      {isAdmin && show && (
        <Modal title="➕ Nouveau Fournisseur" onClose={() => setShow(false)}>
          <div className="form-group"><label className="form-label">Nom *</label><input className="form-inp inp-plain" placeholder="Nom du fournisseur" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Email</label><input className="form-inp inp-plain" type="email" placeholder="email@..." value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Téléphone</label><input className="form-inp inp-plain" placeholder="+216..." value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} /></div>
          </div>
          <div className="form-group"><label className="form-label">Adresse</label><textarea className="form-inp inp-plain" rows={2} placeholder="Adresse complète" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} /></div>
          <div className="form-actions"><button className="btn-sec" onClick={() => setShow(false)}>Annuler</button><button className="btn-sub" onClick={add}>Ajouter</button></div>
        </Modal>
      )}
    </>
  );
}
// ─── Panier & Commandes Page ──────────────────────────────────────────
function PanierCommandesPage({ onToast }) {
  const [panier, setPanier] = useState({ items: {}, total: 0, nb_items: 0 });
  const [commandes, setCommandes] = useState([]);
  const [onglet, setOnglet] = useState('panier');
  const [loading, setLoading] = useState(true);
  const [showCommande, setShowCommande] = useState(false);
  const [showSuivi, setShowSuivi] = useState(null); // ← AJOUT : état suivi
  const [formCommande, setFormCommande] = useState({ adresse_livraison: '', telephone: '', notes: '' });

  const loadPanier = () => fetch(`${DJANGO_URL}/api/panier/`, { credentials: 'include' }).then(r => r.json()).then(d => setPanier(d || { items: {}, total: 0, nb_items: 0 })).catch(() => {});
  const loadCommandes = () => fetch(`${DJANGO_URL}/api/commandes/mes-commandes/`, { headers: authH() }).then(r => r.json()).then(d => setCommandes(d || [])).catch(() => {});

  useEffect(() => { Promise.all([loadPanier(), loadCommandes()]).then(() => setLoading(false)); }, []); // eslint-disable-line

  const modifierPanier = async (produitId, quantite) => {
    await fetch(`${DJANGO_URL}/api/panier/modifier/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ produit_id: produitId, quantite }) });
    loadPanier();
  };

  const viderPanier = async () => { await fetch(`${DJANGO_URL}/api/panier/vider/`, { method: 'DELETE', credentials: 'include' }); loadPanier(); onToast('Panier vidé'); };

  const passerCommande = async () => {
    if (!formCommande.adresse_livraison || !formCommande.telephone) { onToast('Adresse et téléphone requis', 'error'); return; }
    const res = await fetch(`${DJANGO_URL}/api/commandes/passer/`, { method: 'POST', headers: { ...authH(), 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(formCommande) });
    const d = await res.json();
    if (res.ok) { loadPanier(); loadCommandes(); setShowCommande(false); setFormCommande({ adresse_livraison: '', telephone: '', notes: '' }); onToast('✅ Commande passée avec succès !'); setOnglet('commandes'); }
    else onToast(d.error || 'Erreur', 'error');
  };

  const imgSrc = img => img ? (img.startsWith('http') ? img : `${DJANGO_URL}${img}`) : null;
  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--txt3)' }}>Chargement…</div>;

  return (
    <>
      <div className="auth-tabs" style={{ marginBottom: 24, maxWidth: 400 }}>
        <button className={`auth-tab ${onglet === 'panier' ? 'active' : ''}`} onClick={() => setOnglet('panier')}>🛒 Panier ({panier.nb_items})</button>
        <button className={`auth-tab ${onglet === 'commandes' ? 'active' : ''}`} onClick={() => setOnglet('commandes')}>📦 Mes commandes ({commandes.length})</button>
      </div>

      {onglet === 'panier' && (
        <>
          {Object.keys(panier.items).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80 }}><div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div><div style={{ fontFamily: 'var(--font-d)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Votre panier est vide</div><div style={{ color: 'var(--txt2)' }}>Ajoutez des produits depuis le catalogue</div></div>
          ) : (
            <>
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {Object.entries(panier.items).map(([id, item]) => (
                    <div key={id} style={{ display: 'flex', gap: 16, padding: 16, background: 'var(--bg3)', borderRadius: 'var(--r)', alignItems: 'center' }}>
                      {item.image && <img src={imgSrc(item.image)} alt={item.libelle} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10 }} onError={e => e.target.style.display = 'none'} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.libelle}</div>
                        <div style={{ fontSize: 14, color: 'var(--txt2)' }}>{item.prix} DT</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                          <button onClick={() => modifierPanier(id, item.quantite - 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--txt)', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>−</button>
                          <span style={{ fontSize: 14, fontWeight: 600, minWidth: 30, textAlign: 'center' }}>{item.quantite}</span>
                          <button onClick={() => modifierPanier(id, item.quantite + 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--txt)', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>+</button>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800, color: 'var(--violet)', marginBottom: 8 }}>{(parseFloat(item.prix) * item.quantite).toFixed(2)} DT</div>
                        <button onClick={() => modifierPanier(id, 0)} style={{ fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retirer</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{ background: 'var(--bg3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: 20, fontWeight: 800 }}>Total</div>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: 28, fontWeight: 800, color: 'var(--violet)' }}>{panier.total} DT</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn-sec" onClick={viderPanier} style={{ flex: 1 }}>Vider le panier</button>
                  <button className="btn-sub" onClick={() => setShowCommande(true)} style={{ flex: 2 }}>Commander →</button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {onglet === 'commandes' && (
        commandes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}><div style={{ fontSize: 64, marginBottom: 16 }}>📦</div><div style={{ fontFamily: 'var(--font-d)', fontSize: 22, fontWeight: 700 }}>Aucune commande</div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {commandes.map((c, i) => (
              <div key={c.id} className="card" style={{ animationDelay: `${i * 0.06}s`, animation: 'fadeUp .35s ease backwards' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div><div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Commande #{c.id}</div><div style={{ fontSize: 13, color: 'var(--txt2)' }}>{c.date_commande}</div></div>
                  <span className={`badge ${c.statut === 'livree' ? 'badge-g' : c.statut === 'annulee' ? 'badge-gray' : 'badge-y'}`}>{c.statut === 'livree' ? '✅ Livrée' : c.statut === 'annulee' ? '❌ Annulée' : '⏳ En attente'}</span>
                </div>
                <div style={{ marginBottom: 12, padding: 12, background: 'var(--bg3)', borderRadius: 8 }}>
                  {c.items?.map((item, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: j < c.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ fontSize: 13 }}>{item.produit} <span style={{ color: 'var(--txt3)' }}>x{item.quantite}</span></span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{item.sous_total} DT</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: 20, fontWeight: 800, color: 'var(--violet)' }}>{c.total} DT</div>
                  {/* ← BOUTON SUIVI AJOUTÉ ICI */}
                  <button className="btn-outline" onClick={() => setShowSuivi(c.id)}>📍 Suivre la commande</button>
                </div>
                <div style={{ marginTop: 10, padding: 10, background: 'var(--bg3)', borderRadius: 8, fontSize: 12, color: 'var(--txt2)' }}>
                  <div>📍 {c.adresse_livraison}</div><div>📞 {c.telephone}</div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {showCommande && (
        <Modal title="📦 Finaliser la commande" onClose={() => setShowCommande(false)}>
          <div style={{ marginBottom: 16, padding: 16, background: 'var(--bg3)', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 13, color: 'var(--txt2)' }}>Articles</span><span style={{ fontSize: 13, fontWeight: 600 }}>{panier.nb_items}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 15, fontWeight: 700 }}>Total</span><span style={{ fontSize: 20, fontWeight: 800, color: 'var(--violet)' }}>{panier.total} DT</span></div>
          </div>
          <div className="form-group"><label className="form-label">Adresse de livraison *</label><input className="form-inp inp-plain" placeholder="Rue, ville..." value={formCommande.adresse_livraison} onChange={e => setFormCommande({ ...formCommande, adresse_livraison: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Téléphone *</label><input className="form-inp inp-plain" placeholder="+216 XX XXX XXX" value={formCommande.telephone} onChange={e => setFormCommande({ ...formCommande, telephone: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Notes (optionnel)</label><textarea className="form-inp inp-plain" rows={3} placeholder="Instructions de livraison..." value={formCommande.notes} onChange={e => setFormCommande({ ...formCommande, notes: e.target.value })} style={{ resize: 'vertical' }} /></div>
          <div className="form-actions"><button className="btn-sec" onClick={() => setShowCommande(false)}>Annuler</button><button className="btn-sub" onClick={passerCommande}>Confirmer la commande</button></div>
        </Modal>
      )}

      {/* ← MODAL SUIVI AJOUTÉ ICI */}
      {showSuivi && (
        <Modal title={`📍 Suivi commande #${showSuivi}`} onClose={() => setShowSuivi(null)}>
          <SuiviLivraisonContent commandeId={showSuivi} onToast={onToast} />
        </Modal>
      )}
    </>
  );
}

// ─── Wishlist Page ────────────────────────────────────────────────────
function WishlistPage({ onToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
 
  const fetch_ = () => fetch(`${DJANGO_URL}/api/wishlist/`, { headers: authH() })
    .then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : [])).catch(() => setItems([])).finally(() => setLoading(false));
  useEffect(() => {
    let active = true;
    if (active) fetch_();
    return () => { active = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
 
  const retirer = async (id) => {
    await fetch(`${DJANGO_URL}/api/wishlist/${id}/toggle/`, { method: 'POST', headers: authH() });
    setItems(prev => prev.filter(i => i.produit_id !== id));
    onToast('Retiré de la wishlist.');
  };
 
  const addCart = async (id, name) => {
    try {
      const res = await fetchAPI(`${DJANGO_URL}/api/panier/ajouter/`, { 
        method: 'POST', 
        body: JSON.stringify({ produit_id: id, quantite: 1 }) 
      });
      if (res.ok) onToast(`🛒 ${name} ajouté au panier !`);
      else {
        const data = await res.json();
        onToast(`Erreur: ${data.error || data.detail || 'Erreur serveur'}`, 'error');
      }
    } catch { onToast('Erreur réseau', 'error'); }
  };
 
  const imgSrc = img => img ? (img.startsWith('http') ? img : `${DJANGO_URL}/media/${img.replace(/^\/media\//, '')}`) : null;
 
  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text3)' }}>Chargement…</div>;
  if (items.length === 0) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
      <div style={{ fontFamily: 'var(--font-d)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Votre Wishlist est vide</div>
      <div style={{ color: 'var(--text2)' }}>Ajoutez des produits depuis le catalogue en cliquant sur ♡</div>
    </div>
  );
 
  return (
    <>
      <div className="sec-hdr" style={{ marginBottom: 20 }}><div className="sec-ttl">Ma Wishlist <span style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--font-b)', fontWeight: 400 }}>({items.length})</span></div></div>
      <div className="prod-grid">
        {items.map((item, i) => (
          <div key={item.id} className="prod-card" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="prod-img">{imgSrc(item.img) ? <img src={imgSrc(item.img)} alt="" onError={e => e.target.style.display = 'none'} /> : <span>📦</span>}</div>
            <div className="prod-body">
              <div className="prod-name">{item.libelle}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>Ajouté le {item.date_ajout}</div>
              <div className="prod-foot">
                <div className="prod-price">{item.prix} <span>DT</span></div>
                <div className="prod-btns">
                  <button className="btn-sm" style={{ background: 'var(--red-soft)', color: 'var(--red)' }} onClick={() => retirer(item.produit_id)}>♥ Retirer</button>
                  <button className="btn-sm btn-cart-sm" onClick={() => addCart(item.produit_id, item.libelle)}>🛒</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
 
function LivraisonPage({ onToast }) {
  const [commandes, setCommandes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedSuivi, setSelectedSuivi] = React.useState(null);
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch(`${DJANGO_URL}/api/commandes/mes-commandes/`, {
      headers: authH()
    })
      .then(r => r.json())
      .then(d => setCommandes((d || []).filter(c => c.statut !== 'annulee')))
      .catch(() => setCommandes([]))
      .finally(() => setLoading(false));
  }, []);

  // fetch suivi when modal opens
  React.useEffect(() => {
    if (!selectedSuivi) return;

    fetch(`${DJANGO_URL}/api/commandes/${selectedSuivi}/suivi/`, {
      headers: authH()
    })
      .then(r => r.json())
      .then(setData);
  }, [selectedSuivi]);

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--text3)' }}>
        Chargement…
      </div>
    );
  }

  if (commandes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
        <div style={{ fontFamily: 'var(--font-d)', fontSize: 22 }}>
          Aucune livraison
        </div>
      </div>
    );
  }

  return (
    <>
      {/* LIST VIEW */}
      <div className="sec-hdr" style={{ marginBottom: 20 }}>
        <div className="sec-ttl">
          Suivi livraison ({commandes.length})
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {commandes.map((c) => (
          <div key={c.id} className="card">

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700 }}>
                  📦 Commande #{c.id}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                  {c.date_commande}
                </div>
              </div>

              <span className={`badge ${c.statut === 'livree' ? 'badge-g' : 'badge-y'}`}>
                {c.statut === 'livree' ? 'Livrée' : 'En cours'}
              </span>
            </div>

            <div style={{ marginTop: 10, fontSize: 13 }}>
              📍 {c.adresse_livraison}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <div style={{ fontWeight: 700, color: 'var(--violet)' }}>
                {c.total} DT
              </div>

              <button
                className="btn-outline"
                onClick={() => setSelectedSuivi(c.id)}
              >
                📦 Voir suivi
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL STYLE TRACKING */}
      {selectedSuivi && data && (
        <div className="overlay"
          onClick={(e) => e.target === e.currentTarget && setSelectedSuivi(null)}
        >
          <div className="modal" style={{ maxWidth: 580 }}>

            <button className="modal-x" onClick={() => setSelectedSuivi(null)}>
              ✕
            </button>

            <div className="modal-ttl">
              📦 Suivi Commande #{selectedSuivi}
            </div>

            {/* Tracking number */}
            <div className="tracking-card">
              <div>
                <div style={{ fontSize: 11 }}>N° suivi</div>
                <div className="tracking-num">
                  {data.numero_suivi}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                {data.date_estimee && (
                  <div>📅 {data.date_estimee}</div>
                )}
                {data.date_livraison && (
                  <div style={{ color: '#22c55e' }}>
                    ✅ {data.date_livraison}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="suivi-timeline">
              {data.timeline.map((step, i) => {
                const done = i < data.idx_actuel;
                const active = i === data.idx_actuel;

                return (
                  <React.Fragment key={step.statut}>
                    {i > 0 && (
                      <div className={`suivi-line ${i <= data.idx_actuel ? 'done' : ''}`} />
                    )}

                    <div className="suivi-step">
                      <div className={`suivi-step-ic ${done ? 'done' : active ? 'active' : ''}`}>
                        {step.icon}
                      </div>

                      <div className={`suivi-step-lbl ${done ? 'done' : active ? 'active' : ''}`}>
                        {step.label}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Current status */}
            <div style={{
              padding: 14,
              textAlign: 'center',
              borderRadius: 12,
              marginTop: 15,
              background: data.statut_actuel === 'livree'
                ? 'rgba(34,197,94,.1)'
                : 'rgba(124,58,237,.08)'
            }}>
              <div style={{ fontSize: 22 }}>
                {data.statut_actuel === 'livree' ? '✅' : '🚚'}
              </div>
              <div style={{ fontWeight: 700 }}>
                {data.timeline.find(t => t.statut === data.statut_actuel)?.label}
              </div>
            </div>

            {/* Livreur */}
            {data.livreur_nom && (
              <div className="livreur-card">
                <div>🧑‍💼</div>
                <div>
                  <div>{data.livreur_nom}</div>
                  {data.livreur_tel && <div>{data.livreur_tel}</div>}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}

// ─── Stock Management Page ──────────────────────────────────────────────
function StockPage({ onToast, isAdmin }) {
  const [stats, setStats] = useState(null);
  const [rupture, setRupture] = useState([]);
  const [alerte, setAlerte] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdjust, setShowAdjust] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ quantite: 0, operation: 'definir' });

  useEffect(() => {
    if (!isAdmin) return;
    fetch(`${DJANGO_URL}/api/stock/`, { headers: authH() })
      .then(r => r.json())
      .then(d => { setStats(d.stats); setRupture(d.rupture); setAlerte(d.alerte); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const adjustStock = async (produitId) => {
    const res = await fetch(`${DJANGO_URL}/api/stock/${produitId}/ajuster/`, {
      method: 'POST',
      headers: jsonH(),
      body: JSON.stringify(adjustForm)
    });
    if (res.ok) {
      onToast('✅ Stock mis à jour !');
      setShowAdjust(null);
      fetch(`${DJANGO_URL}/api/stock/`, { headers: authH() })
        .then(r => r.json())
        .then(d => { setStats(d.stats); setRupture(d.rupture); setAlerte(d.alerte); });
    } else onToast('Erreur', 'error');
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text3)' }}>Chargement…</div>;

  return (
    <>
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-ic" style={{ background: '#22c55e18', fontSize: 24 }}>📦</div><div><div className="stat-val" style={{ color: '#22c55e' }}>{stats?.produits_en_stock || 0}</div><div className="stat-lbl">En stock</div></div></div>
        <div className="stat-card"><div className="stat-ic" style={{ background: '#ef444418', fontSize: 24 }}>⚠️</div><div><div className="stat-val" style={{ color: '#ef4444' }}>{stats?.produits_rupture || 0}</div><div className="stat-lbl">En rupture</div></div></div>
        <div className="stat-card"><div className="stat-ic" style={{ background: '#f59e0b18', fontSize: 24 }}>🔔</div><div><div className="stat-val" style={{ color: '#f59e0b' }}>{stats?.produits_alerte || 0}</div><div className="stat-lbl">En alerte</div></div></div>
      </div>

      {rupture.length > 0 && (
        <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid #ef4444' }}>
          <div className="card-ttl" style={{ marginBottom: 16 }}>🚨 Produits en rupture ({rupture.length})</div>
          <div className="tbl-card">
            <table>
              <thead><tr><th>Produit</th><th>Fournisseur</th><th>Catégorie</th><th>Prix</th><th>Action</th></tr></thead>
              <tbody>
                {rupture.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.libelle}</strong></td>
                    <td style={{ color: 'var(--text2)' }}>{p.fournisseur || '—'}</td>
                    <td style={{ color: 'var(--text2)' }}>{p.categorie || '—'}</td>
                    <td><strong style={{ color: 'var(--violet)' }}>{p.prix} DT</strong></td>
                    <td><button className="btn-sm" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }} onClick={() => { setShowAdjust(p.id); setAdjustForm({ quantite: 0, operation: 'definir' }); }}>Ajuster</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {alerte.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="card-ttl" style={{ marginBottom: 16 }}>⚠️ Produits en alerte ({alerte.length})</div>
          <div className="tbl-card">
            <table>
              <thead><tr><th>Produit</th><th>Stock</th><th>Seuil</th><th>Catégorie</th><th>Action</th></tr></thead>
              <tbody>
                {alerte.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.libelle}</strong></td>
                    <td><span className="badge badge-y">{p.quantite_stock}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{p.seuil_alerte}</td>
                    <td style={{ color: 'var(--text2)' }}>{p.categorie || '—'}</td>
                    <td><button className="btn-sm" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }} onClick={() => { setShowAdjust(p.id); setAdjustForm({ quantite: p.quantite_stock, operation: 'definir' }); }}>Ajuster</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdjust && (
        <Modal title="📦 Ajuster le stock" onClose={() => setShowAdjust(null)}>
          <div className="form-group"><label className="form-label">Opération</label><select className="form-sel" value={adjustForm.operation} onChange={e => setAdjustForm({ ...adjustForm, operation: e.target.value })}><option value="definir">Définir</option><option value="ajouter">Ajouter</option><option value="retirer">Retirer</option></select></div>
          <div className="form-group"><label className="form-label">Quantité</label><input className="form-inp inp-plain" type="number" value={adjustForm.quantite} onChange={e => setAdjustForm({ ...adjustForm, quantite: parseInt(e.target.value) || 0 })} /></div>
          <div className="form-actions"><button className="btn-sec" onClick={() => setShowAdjust(null)}>Annuler</button><button className="btn-sub" onClick={() => adjustStock(showAdjust)}>Confirmer</button></div>
        </Modal>
      )}
    </>
  );
}

// ─── Notifications Page ──────────────────────────────────────────────────
function NotificationsPage({}) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = () => {
    fetch(`${DJANGO_URL}/api/notifications/`, { headers: authH() })
      .then(r => r.json())
      .then(d => setNotifs(d.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    await fetch(`${DJANGO_URL}/api/notifications/${id}/lire/`, { method: 'POST', headers: authH() });
    loadNotifs();
  };

  const markAllRead = async () => {
    await fetch(`${DJANGO_URL}/api/notifications/tout-lire/`, { method: 'POST', headers: authH() });
    loadNotifs();
  };

  const deleteNotif = async (id) => {
    await fetch(`${DJANGO_URL}/api/notifications/${id}/supprimer/`, { method: 'DELETE', headers: authH() });
    loadNotifs();
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text3)' }}>Chargement…</div>;

  const unread = notifs.filter(n => !n.lue).length;

  return (
    <>
      <div className="sec-hdr" style={{ marginBottom: 20 }}>
        <div className="sec-ttl">Notifications <span style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--font-b)', fontWeight: 400 }}>({notifs.length})</span></div>
        {unread > 0 && <button className="btn-add" onClick={markAllRead}><Icon n="ok" s={14} /> Tout marquer comme lu</button>}
      </div>

      {notifs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔔</div>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Aucune notification</div>
          <div style={{ color: 'var(--text2)' }}>Vous êtes à jour !</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifs.map((n, i) => (
            <div key={n.id} className="card" style={{ background: n.lue ? 'var(--bg3)' : 'rgba(139, 92, 246, 0.1)', borderLeft: `4px solid ${n.lue ? 'var(--border)' : 'var(--violet)'}`, animationDelay: `${i * 0.05}s`, animation: 'fadeUp .35s ease backwards' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 24 }}>{n.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <strong style={{ fontSize: 15 }}>{n.titre}</strong>
                    {!n.lue && <span className="badge badge-v" style={{ fontSize: 10 }}>Nouveau</span>}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>{n.message}</p>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{n.date_rel}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!n.lue && <button className="btn-sm" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }} onClick={() => markAsRead(n.id)}>Lire</button>}
                  <button className="btn-sm" style={{ background: 'var(--red-soft)', color: 'var(--red)' }} onClick={() => deleteNotif(n.id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Factures Page ────────────────────────────────────────────────────────
function FacturesPage({ onToast }) {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${DJANGO_URL}/api/factures/`, { headers: authH() })
      .then(r => r.json())
      .then(d => setFactures(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const downloadPDF = async (id) => {
    try {
      const res = await fetch(`${DJANGO_URL}/api/commandes/${id}/facture/`, { headers: authH() });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture_${id}.pdf`;
        a.click();
        onToast('✅ Facture téléchargée !');
      }
    } catch { onToast('Erreur de téléchargement', 'error'); }
  };

  const STATUT_BADGE = {
    en_attente: { cls: 'badge-y',    label: '⏳ En attente' },
    confirmee:  { cls: 'badge-v',    label: '✅ Confirmée'  },
    expediee:   { cls: 'badge-b',    label: '🚚 Expédiée'   },
    livree:     { cls: 'badge-g',    label: '🎉 Livrée'     },
    annulee:    { cls: 'badge-gray', label: '❌ Annulée'    },
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text3)' }}>Chargement…</div>;

  return (
    <>
      <div className="sec-hdr" style={{ marginBottom: 20 }}>
        <div className="sec-ttl">
          Mes Factures <span style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--font-b)', fontWeight: 400 }}>({factures.length})</span>
        </div>
      </div>

      {factures.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📄</div>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Aucune facture</div>
          <div style={{ color: 'var(--text2)' }}>Vos factures apparaîtront ici dès qu'une commande est passée</div>
        </div>
      ) : (
        <div className="tbl-card">
          <table>
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Date</th>
                <th>Client</th>
                <th>Total TTC</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {factures.map(f => {
                const s = STATUT_BADGE[f.statut] || { cls: 'badge-gray', label: f.statut };
                return (
                  <tr key={f.id}>
                    <td><code style={{ color: 'var(--violet)', fontWeight: 700 }}>{f.numero}</code></td>
                    <td style={{ color: 'var(--text2)' }}>{f.date}</td>
                    <td style={{ color: 'var(--text2)' }}>{f.client}</td>
                    <td><strong style={{ color: 'var(--violet)' }}>{f.total_ttc} DT</strong></td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td>
                      <button className="btn-sm btn-cart-sm" onClick={() => downloadPDF(f.id)}>
                        📥 Télécharger
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ─── Analytics Page ──────────────────────────────────────────────────────
function AnalyticsPage({  isAdmin }) {
  const [data, setData] = useState(null);
  const [periode, setPeriode] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    fetch(`${DJANGO_URL}/api/analytics/?periode=${periode}`, { headers: authH() })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [periode, isAdmin]);

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text3)' }}>Chargement…</div>;
  if (!data) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text3)' }}>Aucune donnée</div>;

  return (
    <>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[7, 30, 90, 365].map(p => (
          <button key={p} className={`chip ${periode === p ? 'on' : ''}`} onClick={() => setPeriode(p)}>
            {p === 7 ? '7j' : p === 30 ? '30j' : p === 90 ? '90j' : '1an'}
          </button>
        ))}
      </div>

      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-ic" style={{ background: 'var(--violet-soft)', fontSize: 24 }}>💰</div><div><div className="stat-val" style={{ color: 'var(--violet)' }}>{data.ca_total?.toFixed(2)} DT</div><div className="stat-lbl">CA Total</div></div></div>
        <div className="stat-card"><div className="stat-ic" style={{ background: '#22c55e18', fontSize: 24 }}>📈</div><div><div className="stat-val" style={{ color: '#22c55e' }}>{data.evolution_ca}%</div><div className="stat-lbl">Évolution</div></div></div>
        <div className="stat-card"><div className="stat-ic" style={{ background: '#3b82f618', fontSize: 24 }}>📦</div><div><div className="stat-val" style={{ color: '#3b82f6' }}>{data.nb_commandes}</div><div className="stat-lbl">Commandes</div></div></div>
        <div className="stat-card"><div className="stat-ic" style={{ background: '#f59e0b18', fontSize: 24 }}>🛒</div><div><div className="stat-val" style={{ color: '#f59e0b' }}>{data.panier_moyen?.toFixed(2)} DT</div><div className="stat-lbl">Panier moyen</div></div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-ttl" style={{ marginBottom: 16 }}>📊 Ventes par jour</div>
          {data.ventes_par_jour?.slice(-7).map((v, i) => (
            <div key={i} className="bar-row">
              <span className="bar-lbl">{v.date}</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${(v.total / Math.max(...data.ventes_par_jour.map(x => x.total), 1)) * 100}%` }} /></div>
              <span className="bar-val">{v.nb}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-ttl" style={{ marginBottom: 16 }}>🏆 Top produits</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.top_produits?.slice(0, 5).map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, background: 'var(--bg3)', borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.libelle}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.total_vendu} vendus</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--violet)' }}>{p.ca?.toFixed(2)} DT</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-ttl" style={{ marginBottom: 16 }}>👥 Top clients</div>
        <div className="tbl-card">
          <table>
            <thead><tr><th>Client</th><th>Commandes</th><th>Total dépensé</th></tr></thead>
            <tbody>
              {data.top_clients?.map(c => (
                <tr key={c.username}>
                  <td><strong>{c.username}</strong><br/><span style={{ fontSize: 11, color: 'var(--text3)' }}>{c.email}</span></td>
                  <td>{c.nb_commandes}</td>
                  <td><strong style={{ color: 'var(--violet)' }}>{c.total_depense?.toFixed(2)} DT</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Administration Page ───────────────────────────────────────────────
function AdminPage({ onToast, isAdmin }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [promos, setPromos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPromo, setShowPromo] = useState(false);
  const [showCat, setShowCat] = useState(false);
  const [catNom, setCatNom] = useState('');
  const [pForm, setPForm] = useState({ code: '', type: 'pct', valeur: '', date_fin: '', usage_max: 100 });
 
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const base = [
          fetch(`${DJANGO_URL}/api/categories/`, { headers: authH() }).then(r => r.json()).catch(() => []),
        ];
        const adminReqs = isAdmin ? [
          fetch(`${DJANGO_URL}/api/dashboard/`, { headers: authH() }).then(r => r.json()).catch(() => ({})),
          fetch(`${DJANGO_URL}/api/users/`, { headers: authH() }).then(r => r.json()).catch(() => []),
          fetch(`${DJANGO_URL}/api/commandes/`, { headers: authH() }).then(r => r.json()).catch(() => []),
          fetch(`${DJANGO_URL}/api/promo/`, { headers: authH() }).then(r => r.json()).catch(() => []),
        ] : [];
        const results = await Promise.all([...base, ...adminReqs]);
        if (!active) return;
        const [cats, s, u, c, p] = results;
        setCategories(Array.isArray(cats) ? cats : cats?.results || []);
        if (isAdmin) {
          setStats(s); setUsers(Array.isArray(u) ? u : u?.results || []);
          setCommandes(Array.isArray(c) ? c : c?.results || []); setPromos(Array.isArray(p) ? p : []);
        }
        setLoading(false);
      } catch {
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => { active = false; };
  }, [isAdmin]);
 
  const addCategorie = async () => {
    if (!catNom.trim()) return;
    const res = await fetch(`${DJANGO_URL}/api/categories/`, { method: 'POST', headers: jsonH(), body: JSON.stringify({ nom: catNom }) });
    const d = await res.json();
    if (res.ok) { setCategories(prev => [...prev, d]); setShowCat(false); setCatNom(''); onToast(`✅ Catégorie "${d.nom}" créée !`); }
    else onToast(d.error || JSON.stringify(d), 'error');
  };
 
  const addPromo = async () => {
    if (!pForm.code || !pForm.valeur || !pForm.date_fin) return;
    const res = await fetch(`${DJANGO_URL}/api/promo/`, { method: 'POST', headers: jsonH(), body: JSON.stringify(pForm) });
    const d = await res.json();
    if (res.ok) { setPromos(prev => [...prev, d]); setShowPromo(false); onToast(`✅ Code "${d.code}" créé !`); }
    else onToast(d.error || 'Erreur', 'error');
  };
 
  const STAT_DEFS = [
    { key: 'nb_produits', lbl: 'Produits', ic: '📦', color: 'var(--violet)' },
    { key: 'nb_fournisseurs', lbl: 'Fournisseurs', ic: '🏭', color: 'var(--blue)' },
    { key: 'nb_categories', lbl: 'Catégories', ic: '🏷️', color: 'var(--red)' },
    { key: 'nb_users', lbl: 'Utilisateurs', ic: '👥', color: '#22c55e' },
  ];
 
  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text3)' }}>Chargement…</div>;
 
  const catData = (stats?.produits_par_categorie || []).slice(0, 8);
  const maxCat = Math.max(...catData.map(c => c.count || c.nb || 1), 1);
 
  return (
    <>
      {/* ── Catégories (visible par tous) ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-hdr">
          <div className="card-ttl">🏷️ Catégories ({categories.length})</div>
          {isAdmin && <button className="btn-add" onClick={() => setShowCat(true)}><Icon n="plus" s={14} /> Ajouter</button>}
        </div>
        <div className="tbl-card">
          <table>
            <thead><tr><th>Nom</th></tr></thead>
            <tbody>
              {categories.length === 0
                ? <tr><td style={{ textAlign: 'center', padding: 24, color: 'var(--text3)' }}>Aucune catégorie</td></tr>
                : categories.map(c => <tr key={c.id}><td><span className="badge badge-v">{c.nom}</span></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
 
      {isAdmin && showCat && (
        <Modal title="🏷️ Nouvelle Catégorie" onClose={() => setShowCat(false)}>
          <div className="form-group"><label className="form-label">Nom *</label><input className="form-inp inp-plain" placeholder="Ex: Électronique" value={catNom} onChange={e => setCatNom(e.target.value)} /></div>
          <div className="form-actions"><button className="btn-sec" onClick={() => setShowCat(false)}>Annuler</button><button className="btn-sub" onClick={addCategorie}>Créer</button></div>
        </Modal>
      )}
 
      {/* ── Dashboard admin uniquement ── */}
      {isAdmin && (
        <>
          <div className="stats-grid" style={{ marginBottom: 28 }}>
            {STAT_DEFS.map((s, i) => (
              <div key={s.key} className="stat-card" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="stat-ic" style={{ background: `${s.color}18`, fontSize: 24 }}>{s.ic}</div>
                <div><div className="stat-val" style={{ color: s.color }}>{stats?.[s.key] || 0}</div><div className="stat-lbl">{s.lbl}</div></div>
              </div>
            ))}
          </div>
 
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div className="card">
              <div className="card-ttl">📊 Produits par catégorie</div>
              {catData.length === 0 ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>Aucune donnée</div> : (
                <div className="bar-chart">
                  {catData.map((c, i) => {
                    const n = c.count || c.nb || 0;
                    const colors = ['var(--violet)', 'var(--blue)', 'var(--red)', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#f97316'];
                    return (
                      <div key={i} className="bar-row">
                        <span className="bar-lbl">{c.nom || c.categorie || `Cat ${i + 1}`}</span>
                        <div className="bar-track"><div className="bar-fill" style={{ width: `${(n / maxCat) * 100}%`, background: colors[i % colors.length] }} /></div>
                        <span className="bar-val">{n}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="card">
              <div className="card-ttl">👥 Utilisateurs ({users.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 260, overflowY: 'auto' }}>
                {users.slice(0, 8).map(u => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="av-sm">{(u.username || 'U')[0].toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{u.username}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.email}</div>
                    </div>
                    <span className={`badge ${u.is_staff ? 'badge-v' : 'badge-gray'}`}>{u.is_staff ? 'Admin' : 'User'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
 
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-hdr"><div className="card-ttl">📋 Dernières commandes ({commandes.length})</div></div>
            <div className="tbl-card">
              <table>
                <thead><tr><th>Commande</th><th>Date</th><th>Total</th><th>Statut</th></tr></thead>
                <tbody>
                  {commandes.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--text3)' }}>Aucune commande</td></tr>
                    : commandes.slice(0, 8).map(c => (
                      <tr key={c.id}>
                        <td><code style={{ color: 'var(--violet)', fontFamily: 'monospace' }}>#{String(c.id).padStart(4, '0')}</code></td>
                        <td style={{ color: 'var(--text2)' }}>{c.date_commande ? new Date(c.date_commande).toLocaleDateString('fr-FR') : '—'}</td>
                        <td><strong style={{ color: 'var(--violet)' }}>{c.totalCde || '—'} DT</strong></td>
                        <td><span className="badge badge-g">✅ Confirmée</span></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
 
          <div className="card">
            <div className="card-hdr">
              <div className="card-ttl">🎁 Codes Promo ({promos.length})</div>
              <button className="btn-add" onClick={() => setShowPromo(true)}><Icon n="plus" s={14} /> Créer</button>
            </div>
            <div className="tbl-card">
              <table>
                <thead><tr><th>Code</th><th>Type</th><th>Valeur</th><th>Expire</th><th>Utilisé</th><th>Statut</th></tr></thead>
                <tbody>
                  {promos.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text3)' }}>Aucun code</td></tr>
                    : promos.map(p => (
                      <tr key={p.id}>
                        <td><code style={{ color: '#22c55e', fontWeight: 700 }}>{p.code}</code></td>
                        <td style={{ color: 'var(--text2)' }}>{p.type === 'pct' ? 'Pourcentage (%)' : 'Fixe'}</td>
                        <td><strong>{p.valeur}{p.type === 'pct' ? '%' : ' DT'}</strong></td>
                        <td style={{ color: 'var(--text2)' }}>{p.date_fin ? new Date(p.date_fin).toLocaleDateString('fr-FR') : '—'}</td>
                        <td>{p.nb_utilise}/{p.usage_max}</td>
                        <td><span className={`badge ${p.est_valide ? 'badge-g' : 'badge-gray'}`}>{p.est_valide ? '✅ Actif' : '❌ Expiré'}</span></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
 
          {showPromo && (
            <Modal title="🎁 Nouveau Code Promo" onClose={() => setShowPromo(false)}>
              <div className="form-group"><label className="form-label">Code *</label><input className="form-inp inp-plain" placeholder="PROMO20" value={pForm.code} onChange={e => setPForm({ ...pForm, code: e.target.value.toUpperCase() })} /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Type</label><select className="form-sel" value={pForm.type} onChange={e => setPForm({ ...pForm, type: e.target.value })}><option value="pct">Pourcentage (%)</option><option value="fixe">Montant fixe (DT)</option></select></div>
                <div className="form-group"><label className="form-label">Valeur *</label><input className="form-inp inp-plain" type="number" value={pForm.valeur} onChange={e => setPForm({ ...pForm, valeur: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Date fin *</label><input className="form-inp inp-plain" type="date" value={pForm.date_fin} onChange={e => setPForm({ ...pForm, date_fin: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Usage max</label><input className="form-inp inp-plain" type="number" value={pForm.usage_max} onChange={e => setPForm({ ...pForm, usage_max: e.target.value })} /></div>
              </div>
              <div className="form-actions"><button className="btn-sec" onClick={() => setShowPromo(false)}>Annuler</button><button className="btn-sub" onClick={addPromo}>Créer le code</button></div>
            </Modal>
          )}
        </>
      )}
    </>
  );
}
// ═══════════════════════════════════════════════════════════════════════
// 1. SUIVI COMMANDE — Composant complet
// ═══════════════════════════════════════════════════════════════════════
 
function SuiviCommandeModal({ commandeId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    fetch(`${DJANGO_URL}/api/commandes/${commandeId}/suivi/`, { headers: authH() })
      .then(r => r.json()).then(setData).catch(() => {})
      .finally(() => setLoading(false));
  }, [commandeId]);
 
  if (loading) return (
    <div className="overlay">
      <div className="modal" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
        <div style={{ color: 'var(--txt2)' }}>Chargement du suivi…</div>
      </div>
    </div>
  );
 
  if (!data) return null;
 
  const STATUT_ICONS = {
    en_attente: '📋', confirmee: '✅', preparation: '📦',
    expediee: '🚚', en_transit: '📍', livree: '🎉', annulee: '❌'
  };
 
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <button className="modal-x" onClick={onClose}>✕</button>
        <div className="modal-ttl" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          📦 Suivi Commande #{commandeId}
        </div>
 
        {/* Numéro de suivi */}
        <div className="tracking-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>N° de suivi</div>
              <div className="tracking-num">{data.numero_suivi}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {data.date_estimee && <div style={{ fontSize: 12, color: 'var(--txt2)' }}>Livraison estimée : <strong>{data.date_estimee}</strong></div>}
              {data.date_livraison && <div style={{ fontSize: 12, color: '#22c55e', marginTop: 4 }}>✅ Livré le {data.date_livraison}</div>}
            </div>
          </div>
        </div>
 
        {/* Timeline */}
        <div className="suivi-timeline">
          {data.timeline.map((step, i) => {
            const isDone   = i < data.idx_actuel;
            const isActive = i === data.idx_actuel;
            return (
              <React.Fragment key={step.statut}>
                {i > 0 && <div className={`suivi-line ${i <= data.idx_actuel ? 'done' : ''}`} />}
                <div className="suivi-step">
                  <div className={`suivi-step-ic ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                    {step.icon}
                  </div>
                  <div className={`suivi-step-lbl ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                    {step.label}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
 
        {/* Statut actuel */}
        <div style={{
          padding: '14px 20px', borderRadius: 12, marginBottom: 20, textAlign: 'center',
          background: data.statut_actuel === 'livree' ? 'rgba(34,197,94,.1)' : 'rgba(124,58,237,.08)',
          border: `1px solid ${data.statut_actuel === 'livree' ? 'rgba(34,197,94,.2)' : 'rgba(124,58,237,.2)'}`,
        }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>{STATUT_ICONS[data.statut_actuel]}</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>
            {data.timeline.find(t => t.statut === data.statut_actuel)?.label || data.statut_actuel}
          </div>
        </div>
 
        {/* Livreur */}
        {data.livreur_nom && (
          <div className="livreur-card">
            <div className="livreur-av">🧑‍💼</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Livreur : {data.livreur_nom}</div>
              {data.livreur_tel && <div style={{ fontSize: 12, color: 'var(--txt2)' }}>📞 {data.livreur_tel}</div>}
            </div>
          </div>
        )}
 
        {/* Historique étapes */}
        {data.etapes?.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: 'var(--txt2)' }}>
              📋 Historique des étapes
            </div>
            {[...data.etapes].reverse().map((e, i) => (
              <div key={i} className="etape-item">
                <div className={`etape-dot ${i === 0 ? 'last' : ''}`} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{e.description}</div>
                  {e.localisation && <div style={{ fontSize: 11, color: 'var(--txt3)' }}>📍 {e.localisation}</div>}
                  <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{e.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
 
 
// ═══════════════════════════════════════════════════════════════════════
// 1b. ADMIN — Gestion Suivi (dans AdministrationPage)
// ═══════════════════════════════════════════════════════════════════════
 
function GestionCommandesAdmin({ onToast }) {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState('');
  const [showSuivi, setShowSuivi] = useState(null);
  const [avancerModal, setAvancerModal] = useState(null);
  const [avancerForm, setAvancerForm] = useState({ localisation: '', livreur_nom: '', livreur_tel: '' });
 
  const fetchCmds = () => {
    const url = filtreStatut
      ? `${DJANGO_URL}/api/admin/commandes/?statut=${filtreStatut}`
      : `${DJANGO_URL}/api/admin/commandes/`;
    fetch(url, { headers: authH() })
      .then(r => r.json())
      .then(d => { setCommandes(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { fetchCmds(); }, [filtreStatut]);
 
  const avancer = async () => {
    const res = await fetch(`${DJANGO_URL}/api/commandes/${avancerModal}/avancer/`, {
      method: 'POST', headers: jsonH(), body: JSON.stringify(avancerForm)
    });
    const d = await res.json();
    if (res.ok) { onToast(`✅ ${d.message}`); setAvancerModal(null); fetchCmds(); }
    else onToast(d.error || 'Erreur', 'error');
  };
 
  const STATUTS = ['en_attente', 'confirmee', 'preparation', 'expediee', 'en_transit', 'livree', 'annulee'];
  const STATUT_COLORS = {
    en_attente: 'badge-y', confirmee: 'badge-b', preparation: 'badge-v',
    expediee: 'badge-b', en_transit: 'badge-b', livree: 'badge-g', annulee: 'badge-r'
  };
  const STATUT_LABELS = {
    en_attente: '⏳ En attente', confirmee: '✅ Confirmée', preparation: '📦 Préparation',
    expediee: '🚚 Expédiée', en_transit: '📍 En transit', livree: '🎉 Livrée', annulee: '❌ Annulée'
  };
 
  return (
    <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button className={`chip ${!filtreStatut ? 'on' : ''}`} onClick={() => setFiltreStatut('')}>Toutes</button>
        {STATUTS.map(s => (
          <button key={s} className={`chip ${filtreStatut === s ? 'on' : ''}`} onClick={() => setFiltreStatut(s)}>
            {STATUT_LABELS[s]}
          </button>
        ))}
      </div>
 
      <div className="tbl-card">
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--txt3)' }}>Chargement…</div> : (
          <table>
            <thead>
              <tr><th>Commande</th><th>Client</th><th>Date</th><th>Total</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {commandes.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--txt3)' }}>Aucune commande</td></tr>
                : commandes.map(c => (
                  <tr key={c.id}>
                    <td><code style={{ color: 'var(--violet)', fontFamily: 'monospace' }}>#{String(c.id).padStart(4, '0')}</code></td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c.client}</div>
                      <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{c.email}</div>
                    </td>
                    <td style={{ color: 'var(--txt2)', fontSize: 13 }}>{c.date}</td>
                    <td><strong style={{ color: 'var(--violet)' }}>{c.total.toFixed(3)} DT</strong></td>
                    <td><span className={`badge ${STATUT_COLORS[c.statut] || 'badge-gray'}`}>{STATUT_LABELS[c.statut] || c.statut}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-sm btn-sm-b" onClick={() => setShowSuivi(c.id)}>👁 Suivi</button>
                        {!['livree', 'annulee'].includes(c.statut) && (
                          <button className="btn-sm btn-sm-g" onClick={() => { setAvancerModal(c.id); setAvancerForm({ localisation: '', livreur_nom: '', livreur_tel: '' }); }}>
                            ▶ Avancer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
 
      {showSuivi && <SuiviCommandeModal commandeId={showSuivi} onClose={() => setShowSuivi(null)} />}
 
      {avancerModal && (
        <Modal title={`▶ Avancer commande #${avancerModal}`} onClose={() => setAvancerModal(null)}>
          <div className="fgrp"><label className="flbl">Localisation</label><input className="finp" placeholder="Sfax, Tunisie" value={avancerForm.localisation} onChange={e => setAvancerForm({ ...avancerForm, localisation: e.target.value })} /></div>
          <div className="frow">
            <div className="fgrp"><label className="flbl">Livreur (optionnel)</label><input className="finp" placeholder="Nom du livreur" value={avancerForm.livreur_nom} onChange={e => setAvancerForm({ ...avancerForm, livreur_nom: e.target.value })} /></div>
            <div className="fgrp"><label className="flbl">Téléphone livreur</label><input className="finp" placeholder="+216..." value={avancerForm.livreur_tel} onChange={e => setAvancerForm({ ...avancerForm, livreur_tel: e.target.value })} /></div>
          </div>
          <div className="f-acts"><button className="btn-can" onClick={() => setAvancerModal(null)}>Annuler</button><button className="btn-sub" onClick={avancer}>▶ Confirmer l'avancement</button></div>
        </Modal>
      )}
    </>
  );
}
 
 
// ═══════════════════════════════════════════════════════════════════════
// 2. PORTAIL FOURNISSEUR (Admin)
// ═══════════════════════════════════════════════════════════════════════
 
function PortailFournisseur({ onToast }) {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [commandes, setCommandes] = useState([]);
  const [showCmd, setShowCmd] = useState(false);
  const [cmdForm, setCmdForm] = useState({ produit_id: '', quantite: '', prix_unitaire: '', notes: '' });
 
  const fetchF = () => {
    Promise.all([
      fetch(`${DJANGO_URL}/api/fournisseurs/portail/`, { headers: authH() }).then(r => r.json()),
      fetch(`${DJANGO_URL}/api/fournisseurs/commandes/`, { headers: authH() }).then(r => r.json()),
    ]).then(([f, c]) => {
      setFournisseurs(Array.isArray(f) ? f : []);
      setCommandes(Array.isArray(c) ? c : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchF(); }, []);
 
  const commander = async () => {
    if (!selected || !cmdForm.produit_id || !cmdForm.quantite) return;
    const res = await fetch(`${DJANGO_URL}/api/fournisseurs/${selected.id}/commander/`, {
      method: 'POST', headers: jsonH(), body: JSON.stringify(cmdForm)
    });
    const d = await res.json();
    if (res.ok) { onToast(`✅ ${d.message}`); setShowCmd(false); fetchF(); }
    else onToast(d.error || 'Erreur', 'error');
  };
 
  const recevoir = async (cmdId) => {
    const res = await fetch(`${DJANGO_URL}/api/fournisseurs/commandes/${cmdId}/recevoir/`, { method: 'POST', headers: authH() });
    const d = await res.json();
    if (res.ok) { onToast(`✅ ${d.message}`); fetchF(); }
    else onToast(d.error || 'Erreur', 'error');
  };
 
  const PERF_COLOR = (score) => score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#e63946';
  const C = 2 * Math.PI * 26;
 
  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--txt3)' }}>Chargement…</div>;
 
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Liste fournisseurs */}
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, marginBottom: 16 }}>
            🏭 Fournisseurs ({fournisseurs.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fournisseurs.map((f, i) => {
              const color = PERF_COLOR(f.score_perf);
              const off   = C * (1 - f.score_perf / 100);
              return (
                <div key={f.id} className="f-card" onClick={() => setSelected(f)}
                  style={{ borderColor: selected?.id === f.id ? 'rgba(124,58,237,.4)' : undefined, animationDelay: `${i * 0.06}s` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div className="f-score">
                      <div className="f-score-ring">
                        <svg width={64} height={64} viewBox="0 0 64 64">
                          <circle cx={32} cy={32} r={26} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={8} />
                          <circle cx={32} cy={32} r={26} fill="none" stroke={color} strokeWidth={8}
                            strokeDasharray={C} strokeDashoffset={off} strokeLinecap="round"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s ease' }} />
                        </svg>
                        <div className="f-score-val" style={{ color }}>{f.score_perf}%</div>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{f.nom}</div>
                      <div style={{ fontSize: 12, color: 'var(--txt2)', marginBottom: 8 }}>{f.email}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span className="stat-mini"><span>📦</span><span className="stat-mini-val">{f.nb_produits}</span> produits</span>
                        <span className="stat-mini"><span style={{ color: '#22c55e' }}>✅</span><span className="stat-mini-val">{f.en_stock}</span> en stock</span>
                        {f.rupture > 0 && <span className="stat-mini"><span style={{ color: '#e63946' }}>❌</span><span className="stat-mini-val">{f.rupture}</span> rupture</span>}
                      </div>
                    </div>
                    <button className="btn-add" style={{ flexShrink: 0 }} onClick={e => { e.stopPropagation(); setSelected(f); setShowCmd(true); }}>
                      + Commander
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
 
        {/* Commandes fournisseurs */}
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, marginBottom: 16 }}>
            📋 Commandes fournisseurs
          </div>
          <div className="tbl-card">
            {commandes.length === 0
              ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--txt3)' }}>Aucune commande</div>
              : commandes.map(c => (
                <div key={c.id} className="cmd-f-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.fournisseur}</div>
                    <div style={{ fontSize: 12, color: 'var(--txt2)' }}>{c.produit} × {c.quantite}</div>
                    <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{c.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--violet)', fontSize: 13 }}>{c.total.toFixed(3)} DT</div>
                    <span className={`badge ${c.statut === 'recue' ? 'badge-g' : c.statut === 'annulee' ? 'badge-r' : 'badge-y'}`} style={{ fontSize: 10 }}>
                      {c.statut}
                    </span>
                  </div>
                  {c.statut === 'confirmee' && (
                    <button className="btn-sm btn-sm-g" onClick={() => recevoir(c.id)}>✅ Reçu</button>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
 
      {showCmd && selected && (
        <Modal title={`📦 Commander à ${selected.nom}`} onClose={() => setShowCmd(false)}>
          <div style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
            <strong>{selected.nb_produits}</strong> produits · Score performance : <strong style={{ color: PERF_COLOR(selected.score_perf) }}>{selected.score_perf}%</strong>
          </div>
          <div className="fgrp"><label className="flbl">Produit (ID) *</label><input className="finp" type="number" placeholder="ID du produit" value={cmdForm.produit_id} onChange={e => setCmdForm({ ...cmdForm, produit_id: e.target.value })} /></div>
          <div className="frow">
            <div className="fgrp"><label className="flbl">Quantité *</label><input className="finp" type="number" min="1" placeholder="10" value={cmdForm.quantite} onChange={e => setCmdForm({ ...cmdForm, quantite: e.target.value })} /></div>
            <div className="fgrp"><label className="flbl">Prix unitaire (DT)</label><input className="finp" type="number" placeholder="0.000" value={cmdForm.prix_unitaire} onChange={e => setCmdForm({ ...cmdForm, prix_unitaire: e.target.value })} /></div>
          </div>
          <div className="fgrp"><label className="flbl">Notes</label><textarea className="finp" rows={2} placeholder="Instructions spéciales…" value={cmdForm.notes} onChange={e => setCmdForm({ ...cmdForm, notes: e.target.value })} /></div>
          <div className="f-acts"><button className="btn-can" onClick={() => setShowCmd(false)}>Annuler</button><button className="btn-sub" onClick={commander}>Envoyer la commande</button></div>
        </Modal>
      )}
    </>
  );
}

 
// ═══════════════════════════════════════════════════════════════════════
// 4. CHATBOT SUPPORT CLIENT
// ═══════════════════════════════════════════════════════════════════════
 
function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: 'bot', text: '👋 Bonjour ! Je suis l\'assistant Honey House. Comment puis-je vous aider ?', suggestions: ['Où est ma commande ?', 'Code promo', 'Retourner un produit', 'Contacter le support'] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const msgEndRef = React.useRef(null);
 
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);
 
  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
 
    setMsgs(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
 
    // Indicateur de frappe
    setMsgs(prev => [...prev, { role: 'typing' }]);
 
    try {
      const res = await fetch(`${DJANGO_URL}/api/chatbot/`, {
        method: 'POST',
        headers: { ...jsonH(), ...authH() },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
 
      setMsgs(prev => [
        ...prev.filter(m => m.role !== 'typing'),
        { role: 'bot', text: data.reponse, suggestions: data.suggestions || [], categorie: data.categorie }
      ]);
    } catch {
      setMsgs(prev => [
        ...prev.filter(m => m.role !== 'typing'),
        { role: 'bot', text: '😕 Désolé, je ne peux pas vous répondre pour le moment. Contactez-nous à contact@honeyhouse.tn', suggestions: [] }
      ]);
    }
    setLoading(false);
  };
 
  const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
 
  return (
    <>
      {/* FAB */}
      <button className="chat-fab" onClick={() => setOpen(!open)} title="Support client">
        {open ? '✕' : '💬'}
      </button>
 
      {/* Fenêtre chat */}
      {open && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-av">🍯</div>
            <div>
              <div className="chat-name">Assistant Honey House</div>
              <div className="chat-status"><div className="chat-online-dot" /> En ligne</div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>
 
          {/* Messages */}
          <div className="chat-msgs">
            {msgs.map((m, i) => {
              if (m.role === 'typing') return (
                <div key={i} className="msg-row bot">
                  <div className="msg-av">🍯</div>
                  <div className="chat-typing">
                    <span /><span /><span />
                  </div>
                </div>
              );
              return (
                <div key={i} className={`msg-row ${m.role}`}>
                  {m.role === 'bot' && <div className="msg-av">🍯</div>}
                  {m.role === 'user' && <div className="msg-av user-av">👤</div>}
                  <div>
                    <div className={`msg-bubble ${m.role}`}>{m.text}</div>
                    {m.categorie && <div className="chat-categorie">{m.categorie}</div>}
                    <div className="msg-time">{now}</div>
                  </div>
                </div>
              );
            })}
            <div ref={msgEndRef} />
          </div>
 
          {/* Suggestions */}
          {msgs[msgs.length - 1]?.suggestions?.length > 0 && (
            <div className="chat-suggestions">
              {msgs[msgs.length - 1].suggestions.map((s, i) => (
                <button key={i} className="chat-sug" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}
 
          {/* Input */}
          <div className="chat-input-row">
            <input
              className="chat-inp"
              placeholder="Tapez votre message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              disabled={loading}
            />
            <button className="chat-send" onClick={() => send()} disabled={loading || !input.trim()}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
 
// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(() => { try { const u = localStorage.getItem('myshop_user'); return u ? JSON.parse(u) : null; } catch { return null; } });
  const [project, setProject] = useState(null);
  const [page, setPage] = useState('catalogue');
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [sideOpen, setSideOpen] = useState(false);
  const [showBlood, setShowBlood] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [CineMode, setCineMode] = useState(null);

  const showToast = (msg, type = 'ok') => setToast({ msg, type });
  const handleLogin = (u) => { setUser(u); localStorage.setItem('myshop_user', JSON.stringify(u)); };
  const handleLogout = () => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); localStorage.removeItem('myshop_user'); setUser(null); setProject(null); setShowBlood(false); };
  const handleSelect = (choice) => {
    setCineMode(choice);
    setTimeout(() => {
      if (choice === 'miniprojet') setShowBlood(true);
      else { setProject('myshop'); setPage('catalogue'); setSelectedProduct(null); }
      setTimeout(() => setCineMode(null), 500);
    }, 800);
  };
  const handleViewDetail = (id) => { setSelectedProduct(id); setPage('detail'); };
  const handleBackToCatalogue = () => { setSelectedProduct(null); setPage('catalogue'); };

  if (showBlood) return <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}>Chargement…</div>}><BloodConnectApp onBack={() => setShowBlood(false)} /></Suspense>;
  if (!user) return <><style>{globalCSS}</style><AuthPage onLogin={handleLogin} /></>;
  if (!project) return <><style>{globalCSS}</style><ProjectSelector user={user} onSelect={handleSelect} onLogout={handleLogout} /></>;

  // ── NAV avec toutes les pages admin ────────────────────────────────
  const NAV = [
    { id: 'catalogue',      label: 'Catalogue',          icon: 'shop' },
    { id: 'panier',         label: 'Panier & Commandes',  icon: 'cart' },
    { id: 'livraison',      label: 'Suivi Livraison',     icon: 'dlvr' },
    { id: 'wishlist',       label: 'Ma Wishlist',         icon: 'wish' },
    { id: 'fournisseur',    label: 'Fournisseurs',        icon: 'pkg' ,adminOnly: true},
    { id: 'stock',          label: 'Gestion Stock',       icon: 'pkg',   adminOnly: true },
    { id: 'suivi_admin',    label: 'Suivi Commandes',     icon: 'dlvr',  adminOnly: true },
    { id: 'portail_f',      label: 'Portail Fournisseur', icon: 'users', adminOnly: true },
    { id: 'notifications',  label: 'Notifications',       icon: 'gift' },
    { id: 'factures',       label: 'Mes Factures',        icon: 'order' },
    { id: 'analytics',      label: 'Analytics',           icon: 'chart', adminOnly: true },
    { id: 'administration', label: 'Administration',      icon: 'admin' ,adminOnly: true},
  ];

  const PAGE_TITLES = {
    catalogue: '🍯 Catalogue Produits', panier: '🛒 Panier & Commandes',
    livraison: '📦 Suivi Livraison', wishlist: '🎯 Ma Wishlist',
    fournisseur: '🏭 Fournisseurs', stock: '📦 Gestion de Stock',
    suivi_admin: '📋 Suivi des Commandes', portail_f: '🏭 Portail Fournisseur',
    notifications: '🔔 Notifications',
    factures: '📄 Mes Factures', analytics: '📈 Analytics',
    administration: '⚙️ Administration', detail: '📦 Détails du produit'
  };

  return (
    <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
      <style>{globalCSS}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {sideOpen && <div onClick={() => setSideOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 99 }} />}

      <aside className={`sidebar ${sideOpen ? 'open' : ''}`}>
        <div className="sb-logo"><div className="sb-logo-ic">🍯</div><div className="sb-logo-txt">Honey<span>House</span></div></div>
        <nav className="sb-nav">
          <button className="back-btn" onClick={() => setProject(null)}>← Changer de projet</button>
          <div className="nav-lbl">Navigation</div>
          {NAV.filter(n => !n.adminOnly || user.is_staff).map(n => (
            <button key={n.id} className={`nav-it ${(page === n.id || (page === 'detail' && n.id === 'catalogue')) ? 'active' : ''}`}
              onClick={() => { setPage(n.id); setSideOpen(false); setSelectedProduct(null); }}>
              <Icon n={n.icon} s={18} />{n.label}
            </button>
          ))}
        </nav>
        <div className="sb-user">
          <div className="sb-user-chip"><div className="sb-av">{(user.username || 'U')[0].toUpperCase()}</div><div><div className="sb-uname">{user.username}</div><div className="sb-role">{user.role || 'Utilisateur'}</div></div></div>
          <button className="sb-logout" onClick={handleLogout}><Icon n="out" s={14} /> Déconnexion</button>
        </div>
      </aside>

      <div className="main-c">
        <div className="topbar">
          <button className="ham" onClick={() => setSideOpen(true)}><Icon n="menu" s={22} /></button>
          <div className="topbar-title">{PAGE_TITLES[page] || 'Honey House'}</div>
          {page === 'catalogue' && <div className="search-box"><Icon n="srch" s={15} /><input placeholder="Rechercher un produit…" value={search} onChange={e => setSearch(e.target.value)} /></div>}
        </div>
        <div className="page-pad">
          {page === 'catalogue'      && <CataloguePage      onToast={showToast} search={search} isAdmin={user.is_staff === true} onViewDetail={handleViewDetail} />}
          {page === 'panier'         && <PanierCommandesPage onToast={showToast} />}
          {page === 'livraison'      && <LivraisonPage       onToast={showToast} />}
          {page === 'detail'         && <ProductDetailPage   productId={selectedProduct} onBack={handleBackToCatalogue} onToast={showToast} />}
          {page === 'wishlist'       && <WishlistPage        onToast={showToast} />}
          {page === 'fournisseur'    && <FournisseursPage    onToast={showToast} isAdmin={user.is_staff === true} />}
          {page === 'stock'          && <StockPage           onToast={showToast} isAdmin={user.is_staff === true} />}
          {page === 'suivi_admin'    && <GestionCommandesAdmin onToast={showToast} />}
          {page === 'portail_f'      && <PortailFournisseur  onToast={showToast} />}
          {page === 'notifications'  && <NotificationsPage   onToast={showToast} />}
          {page === 'factures'       && <FacturesPage        onToast={showToast} />}
          {page === 'analytics'      && <AnalyticsPage       onToast={showToast} isAdmin={user.is_staff === true} />}
          {page === 'administration' && <AdminPage           onToast={showToast} isAdmin={user.is_staff === true} />}
        </div>
      </div>

      {/* ← CHATBOT GLOBAL (présent sur toutes les pages) */}
      <ChatbotWidget />
    </AuthContext.Provider>
  );
}

