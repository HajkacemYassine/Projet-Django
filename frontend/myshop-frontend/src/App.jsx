import { useState, useEffect, createContext } from "react";

import BloodConnectApp from './BloodConnectApp';
const AuthContext = createContext(null);

const DJANGO_URL = "http://localhost:8000";

const Icon = ({ name, size = 20 }) => {
  const icons = {
    shop: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>),
    catalogue: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>),
    fournisseur: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>),
    admin: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>),
    logout: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>),
    eye: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>),
    eyeOff: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>),
    search: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
    cart: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/></svg>),
    tag: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>),
    box: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>),
    users: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>),
    chart: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>),
    check: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>),
    user: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
    mail: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>),
    lock: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>),
    menu: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>),
    close: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
    arrow: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>),
    refresh: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>),
  };
  return icons[name] || null;
};

const MOCK_FOURNISSEURS = [
  { id: 1, nom: "BioFresh Tunisia", adresse: "12 Rue de la Kasbah, Tunis", email: "contact@biofresh.tn", telephone: "+216 71 234 567" },
  { id: 2, nom: "Meubles & Co", adresse: "45 Avenue Bourguiba, Sfax", email: "info@meublesco.tn", telephone: "+216 74 456 789" },
  { id: 3, nom: "Textile Nord", adresse: "8 Rue Ibn Khaldoun, Bizerte", email: "ventes@textilenord.tn", telephone: "+216 72 890 123" },
];

const MOCK_CATEGORIES = ["Alimentaire", "Meuble", "Sanitaire", "Vaisselle", "Vêtement", "Jouets", "Linge de Maison", "Bijoux", "Décor"];
const TYPE_LABELS = { em: "Emballé", fr: "Frais", cs: "Conserve" };
const TYPE_COLORS = { em: "#3b82f6", fr: "#10b981", cs: "#f59e0b" };
const EMOJIS = { Alimentaire: "🥗", Meuble: "🪑", Sanitaire: "🧴", Vaisselle: "🍽️", "Vêtement": "👗", Jouets: "🧸", "Linge de Maison": "🛏️", Bijoux: "💍", Décor: "🌿" };

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0f; --surface: #12121a; --surface2: #1a1a26;
    --border: rgba(255,255,255,0.07); --accent: #6c63ff; --accent2: #ff6584; --accent3: #43e97b;
    --text: #f0f0f8; --text2: #8888aa; --text3: #555570;
    --radius: 16px; --radius-sm: 10px;
    --shadow: 0 8px 32px rgba(0,0,0,0.4); --glow: 0 0 40px rgba(108,99,255,0.15);
    --font-display: 'Syne', sans-serif; --font-body: 'DM Sans', sans-serif;
    --sidebar-w: 260px; --transition: 0.2s ease;
  }
  body { font-family: var(--font-body); background: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); position: relative; overflow: hidden; }
  .auth-bg-blob { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; opacity: 0.3; animation: pulse 8s ease-in-out infinite; }
  .auth-bg-blob.b1 { width: 500px; height: 500px; background: radial-gradient(circle, #6c63ff 0%, transparent 70%); top: -100px; left: -100px; }
  .auth-bg-blob.b2 { width: 400px; height: 400px; background: radial-gradient(circle, #ff6584 0%, transparent 70%); bottom: -100px; right: -100px; animation-delay: -4s; }
  @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.1); opacity: 0.5; } }
  .auth-card { position: relative; z-index: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 48px; width: 100%; max-width: 440px; box-shadow: var(--shadow), var(--glow); animation: slideUp 0.5s ease; }
  @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
  .auth-logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, var(--accent), var(--accent2)); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
  .auth-logo-text { font-family: var(--font-display); font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .auth-logo-text span { color: var(--accent); }
  .auth-title { font-family: var(--font-display); font-size: 28px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.5px; }
  .auth-subtitle { color: var(--text2); font-size: 14px; margin-bottom: 32px; }
  .form-group { margin-bottom: 20px; }
  .form-label { display: block; font-size: 13px; font-weight: 500; color: var(--text2); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .input-wrap { position: relative; }
  .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text3); pointer-events: none; }
  .input-icon-right { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--text3); cursor: pointer; background: none; border: none; display: flex; align-items: center; transition: color var(--transition); }
  .input-icon-right:hover { color: var(--text); }
  .form-input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 13px 44px; color: var(--text); font-family: var(--font-body); font-size: 15px; transition: border-color var(--transition), box-shadow var(--transition); outline: none; }
  .form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(108,99,255,0.15); }
  .form-input::placeholder { color: var(--text3); }
  .btn-primary { width: 100%; padding: 14px; background: linear-gradient(135deg, var(--accent), #9b59ff); border: none; border-radius: var(--radius-sm); color: white; font-family: var(--font-display); font-size: 15px; font-weight: 700; cursor: pointer; letter-spacing: 0.3px; transition: transform var(--transition), box-shadow var(--transition), opacity var(--transition); }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(108,99,255,0.4); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .auth-switch { text-align: center; margin-top: 24px; font-size: 14px; color: var(--text2); }
  .auth-switch button { background: none; border: none; color: var(--accent); font-family: var(--font-body); font-size: 14px; font-weight: 600; cursor: pointer; }
  .auth-switch button:hover { color: var(--accent2); }
  .error-msg { background: rgba(255,101,132,0.1); border: 1px solid rgba(255,101,132,0.3); border-radius: var(--radius-sm); padding: 12px 16px; color: var(--accent2); font-size: 13px; margin-bottom: 20px; }
  .success-msg { background: rgba(67,233,123,0.1); border: 1px solid rgba(67,233,123,0.3); border-radius: var(--radius-sm); padding: 12px 16px; color: var(--accent3); font-size: 13px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }

  .project-page { min-height: 100vh; background: var(--bg); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 48px; position: relative; overflow: hidden; animation: slideUp 0.5s ease; }
  .project-cards { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
  .project-card { width: 240px; padding: 40px 28px; background: var(--surface); border: 1px solid var(--border); border-radius: 24px; cursor: pointer; color: var(--text); font-family: var(--font-body); display: flex; flex-direction: column; align-items: center; gap: 20px; transition: all 0.25s ease; position: relative; overflow: hidden; }
  .project-card::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity 0.25s; border-radius: 24px; }
  .project-card.shop::before { background: radial-gradient(circle at 50% 0%, rgba(108,99,255,0.12) 0%, transparent 70%); }
  .project-card.mini::before { background: radial-gradient(circle at 50% 0%, rgba(255,101,132,0.12) 0%, transparent 70%); }
  .project-card:hover { transform: translateY(-6px); box-shadow: var(--shadow); }
  .project-card:hover::before { opacity: 1; }
  .project-card.shop:hover { border-color: var(--accent); }
  .project-card.mini:hover { border-color: var(--accent2); }
  .project-card-emoji { font-size: 56px; line-height: 1; }
  .project-card-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; }
  .project-card-desc { font-size: 13px; color: var(--text2); text-align: center; line-height: 1.5; }
  .project-card-arrow { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; margin-top: 4px; opacity: 0; transform: translateX(-8px); transition: all 0.2s; }
  .project-card.shop .project-card-arrow { color: var(--accent); }
  .project-card.mini .project-card-arrow { color: var(--accent2); }
  .project-card:hover .project-card-arrow { opacity: 1; transform: translateX(0); }
  .project-user-badge { display: flex; align-items: center; gap: 10px; padding: 10px 18px; background: var(--surface); border: 1px solid var(--border); border-radius: 40px; font-size: 14px; }
  .project-user-dot { width: 8px; height: 8px; background: var(--accent3); border-radius: 50%; }

  .app-layout { display: flex; min-height: 100vh; }
  .sidebar { width: var(--sidebar-w); background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; transition: transform var(--transition); }
  .sidebar-logo { padding: 28px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
  .sidebar-logo-icon { width: 38px; height: 38px; background: linear-gradient(135deg, var(--accent), var(--accent2)); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .sidebar-logo-text { font-family: var(--font-display); font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
  .sidebar-logo-text span { color: var(--accent); }
  .sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
  .nav-section-label { font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 1.5px; padding: 8px 12px; margin-top: 8px; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: var(--radius-sm); color: var(--text2); font-size: 14px; font-weight: 500; cursor: pointer; transition: all var(--transition); margin-bottom: 2px; border: none; background: none; width: 100%; text-align: left; position: relative; }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active { background: rgba(108,99,255,0.15); color: var(--text); }
  .nav-item.active::before { content: ''; position: absolute; left: 0; top: 25%; bottom: 25%; width: 3px; background: var(--accent); border-radius: 0 3px 3px 0; }
  .nav-item svg { flex-shrink: 0; }
  .sidebar-user { padding: 16px; border-top: 1px solid var(--border); }
  .user-info { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--surface2); }
  .user-avatar { width: 36px; height: 36px; background: linear-gradient(135deg, var(--accent), var(--accent2)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
  .user-name { font-size: 14px; font-weight: 600; }
  .user-role { font-size: 11px; color: var(--text3); }
  .btn-logout { width: 100%; margin-top: 10px; padding: 10px; background: rgba(255,101,132,0.08); border: 1px solid rgba(255,101,132,0.2); border-radius: var(--radius-sm); color: var(--accent2); font-size: 13px; font-weight: 500; font-family: var(--font-body); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all var(--transition); }
  .btn-logout:hover { background: rgba(255,101,132,0.15); }
  .btn-back { display: flex; align-items: center; gap: 6px; background: none; border: none; color: var(--text3); font-size: 12px; font-family: var(--font-body); cursor: pointer; padding: 6px 0; margin-bottom: 8px; transition: color var(--transition); }
  .btn-back:hover { color: var(--text2); }
  .main-content { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
  .topbar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 32px; display: flex; align-items: center; gap: 16px; position: sticky; top: 0; z-index: 50; }
  .topbar-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; flex: 1; }
  .search-box { display: flex; align-items: center; gap: 10px; background: var(--surface2); border: 1px solid var(--border); border-radius: 40px; padding: 8px 16px; transition: border-color var(--transition); min-width: 220px; }
  .search-box:focus-within { border-color: var(--accent); }
  .search-box input { background: none; border: none; outline: none; color: var(--text); font-family: var(--font-body); font-size: 14px; width: 160px; }
  .search-box input::placeholder { color: var(--text3); }
  .search-box svg { color: var(--text3); flex-shrink: 0; }
  .mobile-menu-btn { display: none; background: none; border: none; color: var(--text); cursor: pointer; padding: 4px; }
  .page-content { padding: 32px; flex: 1; }

  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; display: flex; align-items: flex-start; gap: 16px; transition: transform var(--transition), box-shadow var(--transition); animation: fadeIn 0.4s ease backwards; }
  .stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .stat-value { font-family: var(--font-display); font-size: 28px; font-weight: 800; letter-spacing: -1px; }
  .stat-label { font-size: 13px; color: var(--text2); margin-top: 2px; }

  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .section-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; }
  .btn-add { padding: 9px 18px; background: linear-gradient(135deg, var(--accent), #9b59ff); border: none; border-radius: 40px; color: white; font-size: 13px; font-weight: 600; font-family: var(--font-body); cursor: pointer; display: flex; align-items: center; gap: 6px; transition: transform var(--transition), box-shadow var(--transition); }
  .btn-add:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(108,99,255,0.35); }
  .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
  .filter-chip { padding: 6px 14px; border-radius: 40px; border: 1px solid var(--border); background: none; color: var(--text2); font-size: 13px; font-family: var(--font-body); cursor: pointer; transition: all var(--transition); }
  .filter-chip:hover { border-color: var(--accent); color: var(--text); }
  .filter-chip.active { background: var(--accent); border-color: var(--accent); color: white; }
  .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
  .product-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; transition: transform var(--transition), box-shadow var(--transition); animation: fadeIn 0.4s ease backwards; }
  .product-card:hover { transform: translateY(-4px); box-shadow: var(--shadow), var(--glow); }

  /* ── Image produit ── */
  .product-img { width: 100%; height: 180px; background: var(--surface2); display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; }
  .product-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .product-img .emoji-fallback { font-size: 52px; line-height: 1; }
  .product-type-badge { position: absolute; top: 12px; right: 12px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; color: white; }

  .product-body { padding: 18px; }
  .product-name { font-family: var(--font-display); font-size: 16px; font-weight: 700; margin-bottom: 6px; }
  .product-desc { font-size: 13px; color: var(--text2); margin-bottom: 12px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .product-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--border); }
  .product-price { font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--accent); }
  .product-price span { font-size: 13px; font-weight: 400; color: var(--text3); }
  .btn-cart { padding: 8px 14px; background: rgba(108,99,255,0.12); border: 1px solid rgba(108,99,255,0.25); border-radius: 8px; color: var(--accent); font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all var(--transition); font-family: var(--font-body); }
  .btn-cart:hover { background: var(--accent); color: white; border-color: var(--accent); }
  .product-category { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text3); margin-bottom: 8px; }

  /* Skeleton loading */
  .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
  .skeleton { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .skeleton-img { width: 100%; height: 180px; background: linear-gradient(90deg, var(--surface2) 25%, #22222e 50%, var(--surface2) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  .skeleton-body { padding: 18px; }
  .skeleton-line { height: 12px; background: linear-gradient(90deg, var(--surface2) 25%, #22222e 50%, var(--surface2) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; margin-bottom: 10px; }
  .skeleton-line.short { width: 60%; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  .table-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; animation: fadeIn 0.4s ease; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { border-bottom: 1px solid var(--border); }
  th { padding: 14px 20px; text-align: left; font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; }
  td { padding: 16px 20px; font-size: 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tbody tr { transition: background var(--transition); }
  tbody tr:hover { background: var(--surface2); }
  .avatar-sm { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }

  .admin-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
  .admin-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; animation: fadeIn 0.4s ease backwards; }
  .admin-card-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
  .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .bar-label { width: 90px; font-size: 12px; color: var(--text2); text-align: right; flex-shrink: 0; }
  .bar-track { flex: 1; height: 8px; background: var(--surface2); border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; transition: width 1s ease; }
  .bar-val { font-size: 12px; color: var(--text3); width: 30px; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeOverlay 0.2s ease; }
  @keyframes fadeOverlay { from { opacity: 0; } to { opacity: 1; } }
  .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 36px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease; position: relative; }
  .modal-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; margin-bottom: 24px; }
  .modal-close { position: absolute; top: 20px; right: 20px; background: none; border: none; color: var(--text3); cursor: pointer; padding: 4px; transition: color var(--transition); }
  .modal-close:hover { color: var(--text); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .select-input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 13px 16px; color: var(--text); font-family: var(--font-body); font-size: 15px; outline: none; cursor: pointer; transition: border-color var(--transition); }
  .select-input:focus { border-color: var(--accent); }
  .select-input option { background: var(--surface); }
  textarea.form-input { resize: vertical; min-height: 90px; padding: 13px 16px; }
  .form-actions { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; }
  .btn-secondary { padding: 11px 24px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text2); font-family: var(--font-body); font-size: 14px; cursor: pointer; transition: all var(--transition); }
  .btn-secondary:hover { color: var(--text); border-color: var(--text3); }
  .btn-submit { padding: 11px 24px; background: linear-gradient(135deg, var(--accent), #9b59ff); border: none; border-radius: var(--radius-sm); color: white; font-family: var(--font-display); font-size: 14px; font-weight: 700; cursor: pointer; transition: all var(--transition); }
  .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(108,99,255,0.4); }
  .toast { position: fixed; bottom: 24px; right: 24px; background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent3); border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; gap: 10px; box-shadow: var(--shadow); z-index: 300; font-size: 14px; animation: slideUp 0.3s ease; }

  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .main-content { margin-left: 0; }
    .topbar { padding: 14px 16px; }
    .page-content { padding: 16px; }
    .mobile-menu-btn { display: flex; }
    .form-row { grid-template-columns: 1fr; }
    .products-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
    .project-cards { flex-direction: column; align-items: center; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────

function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className="toast"><Icon name="check" size={16} />{message}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}><Icon name="close" size={20} /></button>
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  );
}

// ── Composant image avec fallback emoji si pas d'image ou erreur ──
function ProductImage({ img, categorie, type }) {
  const [error, setError] = useState(false);

  // Construire l'URL complète : img peut être "produits/photo.jpg" ou "/media/produits/photo.jpg"
  const imgUrl = img
    ? img.startsWith('http')
      ? img
      : `${DJANGO_URL}/media/${img.replace(/^\/media\//, "")}`
    : null;

  return (
    <div className="product-img">
      {imgUrl && !error ? (
        <img src={imgUrl} alt="" onError={() => setError(true)} />
      ) : (
        <span className="emoji-fallback">{EMOJIS[categorie] || "📦"}</span>
      )}
      <div className="product-type-badge" style={{ background: TYPE_COLORS[type] || "#6c63ff" }}>
        {TYPE_LABELS[type] || type}
      </div>
    </div>
  );
}

// ─── Auth ─────────────────────────────────────────────────────────────────

function LoginForm({ onLogin, onSwitch }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.password) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${DJANGO_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        onLogin(data.user);
      } else {
        setError(data.error || 'Identifiants incorrects.');
      }
    } catch { setError('Impossible de joindre le serveur Django.'); }
    setLoading(false);
  };

  return (
    <>
      <div className="auth-logo"><div className="auth-logo-icon"><Icon name="shop" size={22} /></div><div className="auth-logo-text">My<span>Shop</span> 2026</div></div>
      <div className="auth-title">Bon retour 👋</div>
      <div className="auth-subtitle">Connectez-vous à votre espace de gestion</div>
      {error && <div className="error-msg">{error}</div>}
      <div className="form-group">
        <label className="form-label">Nom d'utilisateur</label>
        <div className="input-wrap">
          <span className="input-icon"><Icon name="user" size={16} /></span>
          <input className="form-input" placeholder="admin" value={form.username}
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
      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
      <div className="auth-switch">Pas encore de compte ? <button onClick={onSwitch}>Créer un compte</button></div>
    </>
  );
}

function RegisterForm({ onSwitch }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password) { setError("Veuillez remplir tous les champs."); return; }
    if (form.password !== form.confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (form.password.length < 4) { setError("Minimum 4 caractères."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${DJANGO_URL}/api/auth/register/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password })
      });
      const data = await res.json();
      if (res.ok) { setSuccess(true); setTimeout(() => onSwitch(), 2000); }
      else setError(data.error || "Erreur lors de l'inscription.");
    } catch { setError('Impossible de joindre le serveur Django.'); }
    setLoading(false);
  };

  return (
    <>
      <div className="auth-logo"><div className="auth-logo-icon"><Icon name="shop" size={22} /></div><div className="auth-logo-text">My<span>Shop</span> 2026</div></div>
      <div className="auth-title">Créer un compte</div>
      <div className="auth-subtitle">Rejoignez la plateforme de gestion</div>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg"><Icon name="check" size={14} /> Compte créé ! Redirection…</div>}
      <div className="form-group">
        <label className="form-label">Nom d'utilisateur</label>
        <div className="input-wrap"><span className="input-icon"><Icon name="user" size={16} /></span>
          <input className="form-input" placeholder="yassine" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></div>
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <div className="input-wrap"><span className="input-icon"><Icon name="mail" size={16} /></span>
          <input className="form-input" placeholder="yassine@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
      </div>
      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Mot de passe</label>
          <div className="input-wrap"><span className="input-icon"><Icon name="lock" size={16} /></span>
            <input className="form-input" type={showPass ? "text" : "password"} placeholder="••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Confirmer</label>
          <div className="input-wrap"><span className="input-icon"><Icon name="lock" size={16} /></span>
            <input className="form-input" type={showPass ? "text" : "password"} placeholder="••••••" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
            <button className="input-icon-right" onClick={() => setShowPass(!showPass)}><Icon name={showPass ? "eyeOff" : "eye"} size={16} /></button>
          </div>
        </div>
      </div>
      <button className="btn-primary" style={{ marginTop: 20 }} onClick={handleSubmit} disabled={loading}>{loading ? "Création..." : "Créer le compte"}</button>
      <div className="auth-switch">Déjà un compte ? <button onClick={onSwitch}>Se connecter</button></div>
    </>
  );
}

// ─── Project Selector ─────────────────────────────────────────────────────

function ProjectSelector({ user, onSelect, onLogout }) {
  return (
    <div className="project-page">
      <div className="auth-bg-blob b1" /><div className="auth-bg-blob b2" />
      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, marginBottom: 10, letterSpacing: "-1px" }}>Choisir un projet</div>
        <div style={{ color: "var(--text2)", fontSize: 15 }}>Sélectionnez l'espace auquel vous souhaitez accéder</div>
      </div>
      <div className="project-cards" style={{ position: "relative", zIndex: 1 }}>
        <button className="project-card shop" onClick={() => onSelect("myshop")}>
          <div className="project-card-emoji">🛍️</div>
          <div><div className="project-card-title">MyShop</div><div className="project-card-desc">Gestion des produits, fournisseurs et catalogue</div></div>
          <div className="project-card-arrow">Accéder <Icon name="arrow" size={14} /></div>
        </button>
        <button className="project-card mini" onClick={() => onSelect("miniprojet")}>
          <div className="project-card-emoji">📋</div>
          <div><div className="project-card-title">Mini Projet</div><div className="project-card-desc">Fonctionnalités simplifiées du projet Django</div></div>
          <div className="project-card-arrow">Accéder <Icon name="arrow" size={14} /></div>
        </button>
      </div>
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div className="project-user-badge">
          <div className="project-user-dot" />
          <span style={{ color: "var(--text2)", fontSize: 13 }}>Connecté en tant que</span>
          <strong style={{ fontSize: 13 }}>{user.username}</strong>
        </div>
        <button onClick={onLogout} style={{ background: "none", border: "none", color: "var(--text3)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--accent2)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}>
          <Icon name="logout" size={14} /> Se déconnecter
        </button>
      </div>
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────

function CataloguePage({ onToast, search }) {
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ libelle: "", prix: "", type: "em", description: "", Categorie: "" ,img: null});

  const authHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rProd, rCat] = await Promise.all([
        fetch(`${DJANGO_URL}/api/produits/`, { headers: authHeaders() }),
        fetch(`${DJANGO_URL}/api/categories/`, { headers: authHeaders() }),
      ]);
      const dProd = await rProd.json();
      const dCat = await rCat.json();
      setProducts(Array.isArray(dProd) ? dProd : (dProd.results || []));
      setCategories(Array.isArray(dCat) ? dCat : (dCat.results || []));
    } catch { setProducts([]); setCategories([]); }
    setLoading(false);
  };

  
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll(); }, []);

  const catNames = categories.length > 0 ? categories.map(c => c.nom) : MOCK_CATEGORIES;
  const filters = ["Tous", ...catNames];

  const filtered = products.filter(p => {
    const cat = p.categorie_nom || "";
    const matchCat = activeFilter === "Tous" || cat === activeFilter;
    const q = (search || "").toLowerCase();
    const matchSearch = p.libelle.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleAdd = async () => {
    if (!form.libelle || !form.prix) return;
    try {
          const token = localStorage.getItem('access_token');
     const formData = new FormData();
        formData.append('libelle', form.libelle);
        formData.append('prix', form.prix);
        formData.append('type', form.type);
        formData.append('description', form.description);
        formData.append('Categorie', form.Categorie);
        if (form.Categorie && form.Categorie !== '')   
            formData.append('Categorie', form.Categorie);
        if (form.Fournisseur && form.Fournisseur !== '') 
            formData.append('Fournisseur', form.Fournisseur);
        if (form.img) 
            formData.append('img', form.img);
        if (form.img) {
            formData.append('img', form.img);  
        }
         const res = await fetch(`${DJANGO_URL}/api/produits/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });
        if (res.ok) {
            await fetchAll();
            setShowModal(false);
            setForm({ libelle: "", prix: "", type: "em", description: "", Categorie: "", img: null });
            onToast("Produit ajouté avec succès !");
        }
    } catch { onToast("Erreur lors de l'ajout."); }
  };

  return (
    <div className="page-content">
      <div className="section-header">
        <div className="section-title">
          Catalogue Produits
          {!loading && <span style={{ fontSize: 13, color: "var(--text3)", fontFamily: "var(--font-body)", fontWeight: 400, marginLeft: 10 }}>({filtered.length})</span>}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={fetchAll} style={{ padding: "9px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 40, color: "var(--text2)", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Icon name="refresh" size={15} />
          </button>
          <button className="btn-add" onClick={() => setShowModal(true)}><span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Ajouter</button>
        </div>
      </div>

      <div className="filter-bar">
        {filters.map(f => (
          <button key={f} className={`filter-chip ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
        ))}
      </div>

      {loading && (
        <div className="loading-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton">
              <div className="skeleton-img" />
              <div className="skeleton-body">
                <div className="skeleton-line short" /><div className="skeleton-line" /><div className="skeleton-line" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="products-grid">
          {filtered.map((p, i) => (
            <div key={p.id} className="product-card" style={{ animationDelay: `${i * 0.06}s` }}>
              {/* ✅ Image réelle depuis media/ avec fallback emoji */}
              <ProductImage img={p.img} categorie={p.categorie_nom || ""} type={p.type} />
              <div className="product-body">
                <div className="product-category"><Icon name="tag" size={11} />{p.categorie_nom || "—"}</div>
                <div className="product-name">{p.libelle}</div>
                <div className="product-desc">{p.description}</div>
                <div className="product-footer">
                  <div className="product-price">{p.prix} <span>DT</span></div>
                  <button className="btn-cart" onClick={() => onToast("Ajouté au panier !")}>
                    <Icon name="cart" size={13} /> Panier
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "var(--text3)" }}>Aucun produit trouvé</div>
          )}
        </div>
      )}

      {showModal && (
        <Modal title="Nouveau Produit" onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label className="form-label">Libellé</label>
            <input className="form-input" style={{ paddingLeft: 16 }} placeholder="Nom du produit" value={form.libelle} onChange={e => setForm({ ...form, libelle: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Prix (DT)</label>
              <input className="form-input" style={{ paddingLeft: 16 }} placeholder="0.00" type="number" value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Type</label>
              <select className="select-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="em">Emballé</option><option value="fr">Frais</option><option value="cs">Conserve</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Catégorie</label>
            <select className="select-input" value={form.Categorie} onChange={e => setForm({ ...form, Categorie: e.target.value })}>
              <option value="">-- Choisir --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" placeholder="Description…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
    <label className="form-label">Photo du produit</label>
    <input 
        type="file" 
        accept="image/*"
        onChange={e => setForm({ ...form, img: e.target.files[0] })}
        style={{
            width: "100%",
            padding: "10px",
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text2)",
            cursor: "pointer",
            fontSize: 14
        }}
    />
        {form.img && (
        <div style={{ marginTop: 8, textAlign: "center" }}>
            <img 
                src={URL.createObjectURL(form.img)} 
                alt="aperçu"
                style={{ 
                    width: 100, height: 100, 
                    objectFit: "cover", 
                    borderRadius: 8,
                    border: "1px solid var(--border)"
                }} 
            />
        </div>
          )}
          </div>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
            <button className="btn-submit" onClick={handleAdd}>Ajouter</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function FournisseurPage({ onToast }) {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nom: "", adresse: "", email: "", telephone: "" });

  const authHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchFournisseurs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${DJANGO_URL}/api/fournisseurs/`, { headers: authHeaders() });
      const data = await res.json();
      setFournisseurs(Array.isArray(data) ? data : (data.results || []));
    } catch { setFournisseurs([]); }
    setLoading(false);
  };

  
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchFournisseurs(); }, []);

  const handleAdd = async () => {
    if (!form.nom || !form.email) return;
    try {
      const res = await fetch(`${DJANGO_URL}/api/fournisseurs/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        await fetchFournisseurs();
        setShowModal(false);
        setForm({ nom: "", adresse: "", email: "", telephone: "" });
        onToast("Fournisseur ajouté !");
      }
    } catch { onToast("Erreur lors de l'ajout."); }
  };

  return (
    <div className="page-content">
      <div className="section-header">
        <div className="section-title">
          Fournisseurs
          {!loading && <span style={{ fontSize: 13, color: "var(--text3)", fontFamily: "var(--font-body)", fontWeight: 400, marginLeft: 10 }}>({fournisseurs.length})</span>}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={fetchFournisseurs} style={{ padding: "9px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 40, color: "var(--text2)", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Icon name="refresh" size={15} />
          </button>
          <button className="btn-add" onClick={() => setShowModal(true)}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Ajouter
          </button>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text3)" }}>Chargement…</div>
        ) : (
          <table>
            <thead><tr><th>Fournisseur</th><th>Email</th><th>Téléphone</th><th>Adresse</th></tr></thead>
            <tbody>
              {fournisseurs.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text3)", padding: 40 }}>Aucun fournisseur</td></tr>
              ) : fournisseurs.map((f) => (
                <tr key={f.id}>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div className="avatar-sm">{f.nom[0]}</div><strong>{f.nom}</strong></div></td>
                  <td style={{ color: "var(--text2)" }}>{f.email}</td>
                  <td>{f.telephone}</td>
                  <td style={{ color: "var(--text2)", fontSize: 13 }}>{f.adresse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title="Nouveau Fournisseur" onClose={() => setShowModal(false)}>
          {["nom", "email", "telephone"].map(field => (
            <div className="form-group" key={field}>
              <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input className="form-input" style={{ paddingLeft: 16 }} placeholder={`${field}...`}
                value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Adresse</label>
            <textarea className="form-input" placeholder="Adresse complète…"
              value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />
          </div>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
            <button className="btn-submit" onClick={handleAdd}>Enregistrer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function AdministrationPage() {
  const [stats, setStats] = useState({ nb_produits: 0, nb_fournisseurs: 0, nb_categories: 0, nb_users: 0, produits_par_categorie: [] });
  const [users, setUsers] = useState([]);
  const [commandes, setCommandes] = useState([]);

  

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };
    // Dashboard stats
    fetch(`${DJANGO_URL}/api/dashboard/`, { headers })
      .then(r => r.json()).then(d => setStats(d)).catch(() => {});

    // Utilisateurs Django
    fetch(`${DJANGO_URL}/api/users/`, { headers })
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d) ? d : (d.results || [])))
      .catch(() => {});

    // Commandes Django
    fetch(`${DJANGO_URL}/api/commandes/`, { headers })
      .then(r => r.json())
      .then(d => setCommandes(Array.isArray(d) ? d : (d.results || [])))
      .catch(() => {});
  }, []);

  const statCards = [
    { label: "Produits",     value: stats.nb_produits,    color: "#6c63ff" },
    { label: "Fournisseurs", value: stats.nb_fournisseurs, color: "#ff6584" },
    { label: "Catégories",   value: stats.nb_categories,   color: "#43e97b" },
    { label: "Utilisateurs", value: stats.nb_users,        color: "#f59e0b" },
  ];
  const catStats  = stats.produits_par_categorie?.slice(0, 5) || [];
  const maxCount  = Math.max(...catStats.map(c => c.nb), 1);
  const barColors = ["#6c63ff", "#ff6584", "#43e97b", "#f59e0b", "#06b6d4"];

  return (
    <div className="page-content">
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div className="stat-card" key={s.label} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-icon" style={{ background: `${s.color}22` }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-grid">

        {/* Produits par catégorie */}
        <div className="admin-card">
          <div className="admin-card-title"><Icon name="chart" size={16} /> Produits par catégorie</div>
          {catStats.length > 0 ? catStats.map((c, i) => (
            <div className="bar-row" key={c.nom}>
              <div className="bar-label">{c.nom}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(c.nb / maxCount) * 100}%`, background: barColors[i % barColors.length] }} />
              </div>
              <div className="bar-val">{c.nb}</div>
            </div>
          )) : <div style={{ color: "var(--text3)", fontSize: 13 }}>Chargement…</div>}
        </div>

        {/* Utilisateurs réels depuis Django */}
        <div className="admin-card">
          <div className="admin-card-title"><Icon name="users" size={16} /> Utilisateurs</div>
          {users.length === 0 ? (
            <div style={{ color: "var(--text3)", fontSize: 13 }}>Chargement…</div>
          ) : users.map((u) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div className="avatar-sm" style={{ fontSize: 12 }}>{u.username[0].toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{u.username}</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>{u.email || "—"}</div>
              </div>
              <span className="badge" style={{
                background: u.is_active ? "rgba(67,233,123,0.12)" : "rgba(255,255,255,0.05)",
                color: u.is_active ? "#43e97b" : "var(--text3)"
              }}>
                {u.is_staff ? "Admin" : u.is_active ? "Actif" : "Inactif"}
              </span>
            </div>
          ))}
        </div>

        {/* Commandes réelles depuis Django */}
        <div className="admin-card">
          <div className="admin-card-title"><Icon name="box" size={16} /> Dernières commandes</div>
          {commandes.length === 0 ? (
            <div style={{ color: "var(--text3)", fontSize: 13 }}>Aucune commande</div>
          ) : commandes.slice(0, 5).map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>#{c.id}</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>{c.date_commande}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>{c.totalCde} DT</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [project, setProject] = useState(null);
  const [page, setPage] = useState("catalogue");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [showBloodConnect, setShowBloodConnect] = useState(false);


  

  const handleLogin = (userData) => { setUser(userData); setProject(null); };
  const handleLogout = () => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); setUser(null); setProject(null); };
  const showToast = (msg) => setToast(msg);

  const handleProjectSelect = (choice) => {
  if (choice === "miniprojet") {
    setShowBloodConnect(true);  // ← affiche BloodConnect
  } else {
    setProject("myshop");
    setPage("catalogue");
  }
};

  const navItems = [
    { id: "catalogue", label: "Catalogue", icon: "catalogue" },
    { id: "fournisseur", label: "Fournisseurs", icon: "fournisseur" },
    { id: "administration", label: "Administration", icon: "admin" },
  ];
  const pageTitles = { catalogue: "Catalogue", fournisseur: "Fournisseurs", administration: "Administration" };

  if (showBloodConnect) {
  return <BloodConnectApp onBack={() => setShowBloodConnect(false)} />;
}
  return (

    <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
      
      <style>{globalCSS}</style>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {!user && (
        <div className="auth-page">
          <div className="auth-bg-blob b1" /><div className="auth-bg-blob b2" />
          <div className="auth-card">
            {authMode === "login"
              ? <LoginForm onLogin={handleLogin} onSwitch={() => setAuthMode("register")} />
              : <RegisterForm onSwitch={() => setAuthMode("login")} />}
          </div>
        </div>
      )}

      {user && !project && (
        <ProjectSelector user={user} onSelect={handleProjectSelect} onLogout={handleLogout} />
      )}

      {user && project === "myshop" && (
        <div className="app-layout">
          {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99 }} />}
          <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon"><Icon name="shop" size={20} /></div>
              <div className="sidebar-logo-text">My<span>Shop</span></div>
            </div>
            <nav className="sidebar-nav">
              <button className="btn-back" onClick={() => setProject(null)}>← Changer de projet</button>
              <div className="nav-section-label">Navigation</div>
              {navItems.map(item => (
                <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`}
                  onClick={() => { setPage(item.id); setSidebarOpen(false); }}>
                  <Icon name={item.icon} size={18} />{item.label}
                </button>
              ))}
            </nav>
            <div className="sidebar-user">
              <div className="user-info">
                <div className="user-avatar">{user.username[0].toUpperCase()}</div>
                <div><div className="user-name">{user.username}</div><div className="user-role">{user.role || "Utilisateur"}</div></div>
              </div>
              <button className="btn-logout" onClick={handleLogout}><Icon name="logout" size={14} /> Déconnexion</button>
            </div>
          </aside>
          <main className="main-content">
            <div className="topbar">
              <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}><Icon name="menu" size={22} /></button>
              <div className="topbar-title">{pageTitles[page]}</div>
              <div className="search-box">
                <Icon name="search" size={15} />
                <input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            {page === "catalogue" && <CataloguePage onToast={showToast} search={search} />}
            {page === "fournisseur" && <FournisseurPage onToast={showToast} />}
            {page === "administration" && <AdministrationPage />}
          </main>
        </div>
      )}
    </AuthContext.Provider>
  );
}
