// SuiviLivraisonMap.jsx
// Importé dans App.jsx : import { SuiviLivraisonContent } from './SuiviLivraisonMap'
// API utilisée : GET /api/commandes/<id>/suivi/
//               POST /api/commandes/<id>/avancer/       (admin)
//               POST /api/commandes/<id>/position/update/ (livreur)
//               GET  /api/commandes/<id>/position/

import { useState, useEffect, useRef } from "react";

const DJANGO_URL = "http://localhost:8000";
const authH = () => {
  const t = localStorage.getItem("access_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// ── Icônes inline ───────────────────────────────────────────────────────────
const Icon = ({ n, s = 16 }) => {
  const icons = {
    check: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    truck: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    pin: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    refresh: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
      </svg>
    ),
    arrow: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
      </svg>
    ),
  };
  return icons[n] || null;
};

// ── Styles CSS embarqués ────────────────────────────────────────────────────
const CSS = `
  .slv-wrap { font-family: var(--font-body, 'Outfit', sans-serif); color: var(--color-text-primary); }

  /* Timeline */
  .slv-timeline { display: flex; align-items: flex-start; gap: 0; margin: 24px 0; position: relative; }
  .slv-step { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; }
  .slv-step:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 22px;
    left: 50%;
    width: 100%;
    height: 3px;
    background: var(--color-border-tertiary);
    z-index: 0;
    transition: background 0.5s;
  }
  .slv-step.done:not(:last-child)::after { background: #10b981; }
  .slv-step.active:not(:last-child)::after { background: linear-gradient(90deg, #8b5cf6, var(--color-border-tertiary)); }

  .slv-dot {
    width: 44px; height: 44px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; border: 2px solid var(--color-border-tertiary);
    background: var(--color-background-secondary);
    z-index: 1; position: relative;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    color: var(--color-text-secondary);
  }
  .slv-dot.done {
    background: #10b981; border-color: #10b981; color: #fff;
    box-shadow: 0 0 0 6px rgba(16,185,129,0.15);
  }
  .slv-dot.active {
    background: #8b5cf6; border-color: #8b5cf6; color: #fff;
    box-shadow: 0 0 0 6px rgba(139,92,246,0.2);
    animation: slv-pulse 2s infinite;
  }
  @keyframes slv-pulse {
    0%,100% { box-shadow: 0 0 0 6px rgba(139,92,246,0.2); }
    50%      { box-shadow: 0 0 0 12px rgba(139,92,246,0.05); }
  }
  .slv-lbl { font-size: 11px; font-weight: 600; margin-top: 8px; text-align: center; color: var(--color-text-secondary); }
  .slv-lbl.done   { color: #10b981; }
  .slv-lbl.active { color: #8b5cf6; font-weight: 700; }

  /* Info card */
  .slv-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .slv-info-item {
    background: var(--color-background-secondary);
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: 12px; padding: 12px 14px;
  }
  .slv-info-label { font-size: 11px; font-weight: 600; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
  .slv-info-value { font-size: 14px; font-weight: 500; color: var(--color-text-primary); }

  /* Étapes historique */
  .slv-etapes { margin-top: 20px; }
  .slv-etape-item {
    display: flex; gap: 14px; padding: 12px 0;
    border-bottom: 0.5px solid var(--color-border-tertiary);
    animation: slv-fadeIn 0.3s ease backwards;
  }
  .slv-etape-item:last-child { border-bottom: none; }
  @keyframes slv-fadeIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }

  .slv-etape-dot {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(16,185,129,0.15); border: 1.5px solid #10b981;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0; color: #10b981;
  }
  .slv-etape-body { flex: 1; }
  .slv-etape-desc { font-size: 14px; font-weight: 500; margin-bottom: 2px; color: var(--color-text-primary); }
  .slv-etape-meta { font-size: 12px; color: var(--color-text-secondary); display: flex; gap: 12px; }

  /* Carte GPS */
  .slv-map-wrap {
    margin: 20px 0;
    background: var(--color-background-secondary);
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: 16px; overflow: hidden;
  }
  .slv-map-header {
    padding: 12px 16px; display: flex; align-items: center;
    justify-content: space-between; border-bottom: 0.5px solid var(--color-border-tertiary);
  }
  .slv-map-title { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .slv-map-live { display: inline-flex; align-items: center; gap: 5px; font-size: 11px;
    background: rgba(16,185,129,0.1); color: #10b981; padding: 3px 8px;
    border-radius: 20px; border: 1px solid rgba(16,185,129,0.3); font-weight: 600; }
  .slv-map-live::before { content:''; width:6px; height:6px; border-radius:50%; background:#10b981;
    animation: blink 1s infinite; display:block; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

  .slv-map-container { height: 260px; position: relative; overflow: hidden; }

  /* Schéma SVG de route */
  .slv-route-svg { width: 100%; height: 100%; }

  /* Boutons admin */
  .slv-admin-section {
    margin-top: 20px; padding-top: 16px;
    border-top: 0.5px solid var(--color-border-tertiary);
  }
  .slv-admin-title { font-size: 12px; font-weight: 700; color: var(--color-text-secondary);
    text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
  .slv-btn-row { display: flex; gap: 10px; flex-wrap: wrap; }

  .slv-btn {
    padding: 9px 18px; border-radius: 10px; border: 0.5px solid var(--color-border-tertiary);
    background: var(--color-background-primary); color: var(--color-text-primary);
    font-size: 13px; font-weight: 500; cursor: pointer;
    font-family: var(--font-body, sans-serif);
    display: flex; align-items: center; gap: 7px;
    transition: all 0.2s;
  }
  .slv-btn:hover { background: var(--color-background-secondary); }
  .slv-btn.primary {
    background: #8b5cf6; color: #fff; border-color: #8b5cf6;
  }
  .slv-btn.primary:hover { background: #7c3aed; box-shadow: 0 4px 12px rgba(139,92,246,0.4); }
  .slv-btn.success { background: #10b981; color: #fff; border-color: #10b981; }
  .slv-btn.success:hover { background: #059669; }
  .slv-btn.danger  { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.3); }
  .slv-btn.danger:hover { background: rgba(239,68,68,0.2); }
  .slv-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Badge statut */
  .slv-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 20px;
    font-size: 12px; font-weight: 600;
  }
  .slv-badge.confirmee  { background: rgba(59,130,246,0.12); color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); }
  .slv-badge.preparation{ background: rgba(245,158,11,0.12); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
  .slv-badge.expediee   { background: rgba(139,92,246,0.12); color: #8b5cf6; border: 1px solid rgba(139,92,246,0.3); }
  .slv-badge.en_transit { background: rgba(14,165,233,0.12); color: #0ea5e9; border: 1px solid rgba(14,165,233,0.3); }
  .slv-badge.livree     { background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }

  /* GPS input */
  .slv-gps-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; align-items: end; margin-top: 10px; }
  .slv-input {
    padding: 8px 12px; border-radius: 8px;
    border: 0.5px solid var(--color-border-tertiary);
    background: var(--color-background-secondary);
    color: var(--color-text-primary); font-size: 13px;
    font-family: var(--font-body, sans-serif); outline: none; width: 100%;
  }
  .slv-input:focus { border-color: #8b5cf6; }
  .slv-input-label { font-size: 11px; font-weight: 600; color: var(--color-text-secondary);
    text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 4px; }

  /* Skeleton */
  .slv-skel { background: linear-gradient(90deg,
    var(--color-background-secondary) 25%,
    var(--color-background-primary) 50%,
    var(--color-background-secondary) 75%);
    background-size: 400% 100%; animation: skel-shimmer 1.4s infinite;
    border-radius: 8px; }
  @keyframes skel-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  .slv-loading { display: flex; flex-direction: column; gap: 12px; padding: 8px 0; }
  .slv-skel-line { height: 14px; }
  .slv-skel-block { height: 80px; border-radius: 12px; }
`;

// ── Composant carte SVG stylisée (sans Leaflet) ─────────────────────────────
function RouteMap({ hasPosition, livreurPos, statut }) {
  // Représentation schématique animée de la livraison
  const STEPS = [
    { x: 80,  y: 130, label: "Entrepôt",     icon: "🏭" },
    { x: 240, y: 80,  label: "Transit",       icon: "🚚" },
    { x: 400, y: 130, label: "En route",      icon: "📍" },
    { x: 540, y: 80,  label: "Destination",   icon: "🏠" },
  ];
  const STATUS_IDX = { confirmee: 0, preparation: 0, expediee: 1, en_transit: 2, livree: 3 };
  const activeIdx = STATUS_IDX[statut] ?? 0;

  return (
    <svg className="slv-route-svg" viewBox="0 0 640 220" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="slv-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </marker>
      </defs>

      {/* Fond route */}
      <path d="M80 130 Q160 30 240 80 Q320 130 400 130 Q470 130 540 80"
        fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="24" strokeLinecap="round"/>
      {/* Route principale */}
      <path d="M80 130 Q160 30 240 80 Q320 130 400 130 Q470 130 540 80"
        fill="none" stroke="rgba(139,92,246,0.35)" strokeWidth="4"
        strokeDasharray="8 4" strokeLinecap="round"/>
      {/* Portion effectuée */}
      {activeIdx > 0 && (
        <path
          d={
            activeIdx === 1 ? "M80 130 Q160 30 240 80"
            : activeIdx === 2 ? "M80 130 Q160 30 240 80 Q320 130 400 130"
            : "M80 130 Q160 30 240 80 Q320 130 400 130 Q470 130 540 80"
          }
          fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round"
          style={{ transition: "all 0.8s ease" }}
          markerEnd="url(#slv-arrow)"
        />
      )}

      {/* Points de passage */}
      {STEPS.map((s, i) => {
        const done   = i < activeIdx;
        const active = i === activeIdx;
        return (
          <g key={i}>
            <circle cx={s.x} cy={s.y} r={active ? 24 : 18}
              fill={done ? "rgba(16,185,129,0.2)" : active ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.05)"}
              stroke={done ? "#10b981" : active ? "#8b5cf6" : "rgba(255,255,255,0.15)"}
              strokeWidth={active ? 2 : 1}>
              {active && <animate attributeName="r" values="22;26;22" dur="2s" repeatCount="indefinite"/>}
            </circle>
            <text x={s.x} y={s.y + 6} textAnchor="middle" fontSize="16">{s.icon}</text>
            <text x={s.x} y={s.y + (active ? 42 : 36)} textAnchor="middle" fontSize="11"
              fill={done ? "#10b981" : active ? "#8b5cf6" : "rgba(255,255,255,0.5)"}
              fontWeight={active ? "700" : "500"}>
              {s.label}
            </text>
          </g>
        );
      })}

      {/* Livreur animé (si en_transit) */}
      {statut === "en_transit" && (
        <text fontSize="22" y="130">
          <animateMotion dur="4s" repeatCount="indefinite"
            path="M80 130 Q160 30 240 80 Q320 130 400 130"/>
          🚚
        </text>
      )}

      {/* GPS réel */}
      {hasPosition && livreurPos?.latitude && (
        <g>
          <circle cx="400" cy="130" r="10" fill="rgba(14,165,233,0.3)" stroke="#0ea5e9" strokeWidth="1.5">
            <animate attributeName="r" values="8;14;8" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          <text x="400" y="134" textAnchor="middle" fontSize="12">📍</text>
          <text x="400" y="160" textAnchor="middle" fontSize="10" fill="#0ea5e9">
            GPS: {livreurPos.latitude.toFixed(4)}, {livreurPos.longitude.toFixed(4)}
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Composant principal exporté ──────────────────────────────────────────────
export function SuiviLivraisonContent({ commandeId, onToast }) {
  const [suivi, setSuivi]       = useState(null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gpsForm, setGpsForm]   = useState({ latitude: "", longitude: "" });
  const intervalRef = useRef(null);

  // Récupérer le user courant depuis localStorage
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("myshop_user") || "{}"); } catch { return {}; }
  })();
  const isAdmin = currentUser.is_staff === true;

  // ── Chargement du suivi ──────────────────────────────────────────────────
  const loadSuivi = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [rS, rP] = await Promise.all([
        fetch(`${DJANGO_URL}/api/commandes/${commandeId}/suivi/`, { headers: authH() }),
        fetch(`${DJANGO_URL}/api/commandes/${commandeId}/position/`, { headers: authH() }),
      ]);
      if (rS.ok) setSuivi(await rS.json());
      if (rP.ok) setPosition(await rP.json());
    } catch { /* réseau indisponible */ }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadSuivi();
    // Rafraîchissement auto toutes les 30s si la commande n'est pas encore livrée
    intervalRef.current = setInterval(() => {
      if (suivi?.statut_actuel !== "livree") loadSuivi(true);
    }, 30000);
    return () => clearInterval(intervalRef.current);
  }, [commandeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions admin ────────────────────────────────────────────────────────
  const avancerStatut = async () => {
    const res = await fetch(`${DJANGO_URL}/api/commandes/${commandeId}/avancer/`, {
      method: "POST", headers: { ...authH(), "Content-Type": "application/json" },
      body: JSON.stringify({ localisation: "Tunisie" }),
    });
    const d = await res.json();
    if (res.ok) { onToast?.(`✅ Statut → ${d.statut}`); loadSuivi(); }
    else onToast?.(d.error || "Erreur", "error");
  };

  const forcerLivraison = async () => {
    const res = await fetch(`${DJANGO_URL}/api/commandes/${commandeId}/forcer-livraison/`, {
      method: "POST", headers: { ...authH(), "Content-Type": "application/json" },
    });
    const d = await res.json();
    if (res.ok) { onToast?.(d.message); loadSuivi(); }
    else onToast?.(d.error || "Erreur", "error");
  };

  const updateGPS = async () => {
    if (!gpsForm.latitude || !gpsForm.longitude) {
      onToast?.("Latitude et longitude requises", "error"); return;
    }
    const res = await fetch(`${DJANGO_URL}/api/commandes/${commandeId}/position/update/`, {
      method: "POST", headers: { ...authH(), "Content-Type": "application/json" },
      body: JSON.stringify({ latitude: parseFloat(gpsForm.latitude), longitude: parseFloat(gpsForm.longitude) }),
    });
    const d = await res.json();
    if (res.ok) { onToast?.("📍 Position mise à jour !"); loadSuivi(true); }
    else onToast?.(d.error || "Erreur", "error");
  };

  // ── Données de la timeline ────────────────────────────────────────────────
  const TIMELINE = [
    { statut: "confirmee",   label: "Confirmée",   icon: "✅" },
    { statut: "preparation", label: "Préparation", icon: "📦" },
    { statut: "expediee",    label: "Expédiée",    icon: "🚚" },
    { statut: "en_transit",  label: "En transit",  icon: "📍" },
    { statut: "livree",      label: "Livrée",      icon: "🎉" },
  ];

  const ETAPE_ICONS = {
    confirmee: "✅", preparation: "📦", expediee: "🚚", en_transit: "📍", livree: "🎉",
  };

  // ── Rendu skeleton ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="slv-wrap slv-loading">
      <style>{CSS}</style>
      <div className="slv-skel slv-skel-line" style={{ width: "60%" }} />
      <div className="slv-skel slv-skel-block" />
      <div className="slv-skel slv-skel-line" />
      <div className="slv-skel slv-skel-line" style={{ width: "80%" }} />
      <div className="slv-skel slv-skel-block" />
    </div>
  );

  if (!suivi) return (
    <div className="slv-wrap" style={{ padding: "40px 0", textAlign: "center", color: "var(--color-text-secondary)" }}>
      <style>{CSS}</style>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
      <div style={{ fontSize: 15, fontWeight: 500 }}>Aucun suivi disponible pour cette commande</div>
    </div>
  );

  const idx = suivi.idx_actuel ?? 0;

  return (
    <div className="slv-wrap">
      <style>{CSS}</style>

      {/* ── En-tête ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-heading, sans-serif)", fontSize: 16, fontWeight: 700 }}>
            N° {suivi.numero_suivi || `BC-${String(commandeId).padStart(6, "0")}`}
          </span>
          <span className={`slv-badge ${suivi.statut_actuel}`}>
            {ETAPE_ICONS[suivi.statut_actuel]} {TIMELINE.find(t => t.statut === suivi.statut_actuel)?.label || suivi.statut_actuel}
          </span>
        </div>
        <button className="slv-btn" onClick={() => loadSuivi(true)} disabled={refreshing}>
          <Icon n="refresh" s={14} />
          {refreshing ? "…" : "Actualiser"}
        </button>
      </div>

      {/* ── Timeline ─────────────────────────────────────────────────── */}
      <div className="slv-timeline">
        {TIMELINE.map((t, i) => {
          const done   = i < idx;
          const active = i === idx;
          return (
            <div key={t.statut} className={`slv-step ${done ? "done" : active ? "active" : ""}`}>
              <div className={`slv-dot ${done ? "done" : active ? "active" : ""}`}>
                {done ? <Icon n="check" s={16} /> : t.icon}
              </div>
              <div className={`slv-lbl ${done ? "done" : active ? "active" : ""}`}>{t.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Informations commande ─────────────────────────────────────── */}
      <div className="slv-info-grid">
        <div className="slv-info-item">
          <div className="slv-info-label">Adresse livraison</div>
          <div className="slv-info-value">{suivi.adresse || "—"}</div>
        </div>
        <div className="slv-info-item">
          <div className="slv-info-label">Date estimée</div>
          <div className="slv-info-value">
            {suivi.date_estimee
              ? new Date(suivi.date_estimee).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })
              : "—"}
          </div>
        </div>
        {suivi.admin_confirme_par && (
          <div className="slv-info-item">
            <div className="slv-info-label">Confirmé par</div>
            <div className="slv-info-value">👤 {suivi.admin_confirme_par}</div>
          </div>
        )}
        {suivi.date_confirmation_admin && (
          <div className="slv-info-item">
            <div className="slv-info-label">Date confirmation</div>
            <div className="slv-info-value">
              {new Date(suivi.date_confirmation_admin).toLocaleDateString("fr-FR")}
            </div>
          </div>
        )}
      </div>

      {/* ── Carte de suivi ────────────────────────────────────────────── */}
      <div className="slv-map-wrap">
        <div className="slv-map-header">
          <div className="slv-map-title">
            <Icon n="pin" s={15} /> Suivi en temps réel
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {position?.has_position && (
              <span className="slv-map-live">GPS actif</span>
            )}
            {suivi.statut_actuel === "en_transit" && !position?.has_position && (
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                En attente du GPS
              </span>
            )}
          </div>
        </div>
        <div className="slv-map-container">
          <RouteMap
            hasPosition={position?.has_position}
            livreurPos={position?.livreur}
            destinationPos={position?.destination}
            statut={suivi.statut_actuel}
          />
        </div>
        {position?.has_position && position.livreur && (
          <div style={{ padding: "10px 16px", borderTop: "0.5px solid var(--color-border-tertiary)", fontSize: 12, color: "var(--color-text-secondary)", display: "flex", gap: 16 }}>
            <span>🚚 Livreur : {position.livreur.latitude?.toFixed(5)}, {position.livreur.longitude?.toFixed(5)}</span>
            {position.livreur.derniere_maj && (
              <span>Mis à jour : {new Date(position.livreur.derniere_maj).toLocaleTimeString("fr-FR")}</span>
            )}
          </div>
        )}
      </div>

      {/* ── Historique des étapes ─────────────────────────────────────── */}
      {suivi.etapes && suivi.etapes.length > 0 && (
        <div className="slv-etapes">
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
            Historique des étapes
          </div>
          {[...suivi.etapes].reverse().map((e, i) => (
            <div key={i} className="slv-etape-item" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="slv-etape-dot">
                {ETAPE_ICONS[e.statut] || "📌"}
              </div>
              <div className="slv-etape-body">
                <div className="slv-etape-desc">{e.description}</div>
                <div className="slv-etape-meta">
                  <span>🕐 {e.date_etape}</span>
                  {e.localisation && <span>📍 {e.localisation}</span>}
                </div>
                {e.commentaire && (
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4, fontStyle: "italic" }}>
                    {e.commentaire}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Section Admin ─────────────────────────────────────────────── */}
      {isAdmin && (
        <div className="slv-admin-section">
          <div className="slv-admin-title">⚙️ Actions administrateur</div>

          <div className="slv-btn-row" style={{ marginBottom: 16 }}>
            <button
              className="slv-btn primary"
              onClick={avancerStatut}
              disabled={suivi.statut_actuel === "livree"}
            >
              <Icon n="arrow" s={14} />
              Avancer le statut
            </button>
            <button
              className="slv-btn success"
              onClick={forcerLivraison}
              disabled={suivi.statut_actuel === "livree"}
            >
              🎉 Forcer livraison
            </button>
          </div>

          {/* Mise à jour GPS */}
          <div style={{ marginTop: 12 }}>
            <div className="slv-admin-title" style={{ marginBottom: 8 }}>
              📍 Mettre à jour position GPS du livreur
            </div>
            <div className="slv-gps-row">
              <div>
                <div className="slv-input-label">Latitude</div>
                <input
                  className="slv-input"
                  type="number"
                  step="0.0001"
                  placeholder="36.8065"
                  value={gpsForm.latitude}
                  onChange={e => setGpsForm({ ...gpsForm, latitude: e.target.value })}
                />
              </div>
              <div>
                <div className="slv-input-label">Longitude</div>
                <input
                  className="slv-input"
                  type="number"
                  step="0.0001"
                  placeholder="10.1815"
                  value={gpsForm.longitude}
                  onChange={e => setGpsForm({ ...gpsForm, longitude: e.target.value })}
                />
              </div>
              <button className="slv-btn primary" onClick={updateGPS} style={{ marginTop: 18 }}>
                <Icon n="pin" s={14} />
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export par défaut aussi (pour flexibilité)
export default SuiviLivraisonContent;
