import { useState, useEffect } from "react";

const DJANGO_URL = "http://localhost:8000";

const Icon = ({ name, size = 20 }) => {
  const icons = {
    check: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>),
    box: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>),
    truck: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>),
    mapPin: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>),
    clock: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
    package: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>),
    close: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  };
  return icons[name] || null;
};

// 🚚 Composant Suivi Livraison
export function SuiviLivraisonPage({ commandeId, onClose, onToast }) {
  const [suivi, setSuivi] = useState(null);
  const [loading, setLoading] = useState(true);

  const authHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchSuivi = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${DJANGO_URL}/api/commandes/${commandeId}/suivi/`, {
        headers: authHeaders()
      });
      const data = await res.json();
      setSuivi(data);
    } catch (err) {
      console.error('Erreur suivi:', err);
      onToast?.("Erreur lors du chargement du suivi");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (commandeId) {
      fetchSuivi();
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(fetchSuivi, 30000);
      return () => clearInterval(interval);
    }
  }, [commandeId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
        <div>Chargement du suivi...</div>
      </div>
    );
  }

  if (!suivi) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Suivi non disponible</div>
        <div style={{ color: 'var(--text3)', fontSize: 14 }}>Aucune information de suivi pour cette commande</div>
      </div>
    );
  }

  const STATUTS_ORDRE = ['confirmee', 'preparation', 'expediee', 'en_transit', 'livree'];
  const idx_actuel = suivi.idx_actuel || 0;

  const STATUT_ICONS = {
    confirmee: '✅',
    preparation: '📦',
    expediee: '🚚',
    en_transit: '📍',
    livree: '🎉'
  };

  const STATUT_COLORS = {
    confirmee: '#10b981',
    preparation: '#f59e0b',
    expediee: '#3b82f6',
    en_transit: '#8b5cf6',
    livree: '#22c55e'
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 4 }}>
            📦 Suivi de livraison
          </div>
          <div style={{ color: 'var(--text3)', fontSize: 14 }}>
            Commande #{suivi.commande_id} • {suivi.numero_suivi}
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8,
            padding: '8px 16px', cursor: 'pointer', color: 'var(--text)', display: 'flex',
            alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 14
          }}>
            <Icon name="close" size={16} /> Fermer
          </button>
        )}
      </div>

      {/* Statut actuel - Card principale */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent), #9b59ff)',
        borderRadius: 'var(--radius)', padding: 32, marginBottom: 32, color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 48 }}>{STATUT_ICONS[suivi.statut_actuel] || '📦'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 4 }}>
              {suivi.timeline?.[idx_actuel]?.label || 'En cours'}
            </div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>
              {suivi.etapes?.[suivi.etapes.length - 1]?.description || 'Votre commande est en cours de traitement'}
            </div>
          </div>
        </div>

        {suivi.date_estimee && (
          <div style={{
            background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 16,
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <Icon name="clock" size={20} />
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 2 }}>Livraison estimée</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{suivi.date_estimee}</div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline horizontale */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        padding: 32, marginBottom: 32
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, fontFamily: 'var(--font-display)' }}>
          Progression de la livraison
        </div>

        <div style={{ position: 'relative' }}>
          {/* Ligne de progression */}
          <div style={{
            position: 'absolute', top: 24, left: 24, right: 24, height: 4,
            background: 'var(--surface2)', borderRadius: 2, zIndex: 0
          }}>
            <div style={{
              height: '100%', background: 'linear-gradient(90deg, var(--accent), #9b59ff)',
              borderRadius: 2, width: `${(idx_actuel / (STATUTS_ORDRE.length - 1)) * 100}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>

          {/* Étapes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            {suivi.timeline?.map((etape, i) => {
              const isCompleted = i <= idx_actuel;
              const isCurrent = i === idx_actuel;

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Cercle */}
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: isCompleted ? 'linear-gradient(135deg, var(--accent), #9b59ff)' : 'var(--surface2)',
                    border: isCurrent ? '3px solid var(--accent)' : '2px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, marginBottom: 12,
                    transition: 'all 0.3s ease',
                    boxShadow: isCurrent ? '0 0 20px rgba(108,99,255,0.4)' : 'none'
                  }}>
                    {etape.icon}
                  </div>

                  {/* Label */}
                  <div style={{
                    fontSize: 12, fontWeight: isCompleted ? 600 : 400,
                    color: isCompleted ? 'var(--text)' : 'var(--text3)',
                    textAlign: 'center', maxWidth: 100
                  }}>
                    {etape.label}
                  </div>

                  {/* Badge "Actuel" */}
                  {isCurrent && (
                    <div style={{
                      marginTop: 8, padding: '4px 12px', borderRadius: 20,
                      background: 'rgba(108,99,255,0.15)', color: 'var(--accent)',
                      fontSize: 11, fontWeight: 600
                    }}>
                      En cours
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Historique des étapes */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        padding: 32
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, fontFamily: 'var(--font-display)' }}>
          📋 Historique détaillé
        </div>

        {suivi.etapes && suivi.etapes.length > 0 ? (
          <div style={{ position: 'relative' }}>
            {/* Ligne verticale */}
            <div style={{
              position: 'absolute', left: 19, top: 0, bottom: 0, width: 2,
              background: 'var(--border)'
            }} />

            {suivi.etapes.map((etape, i) => (
              <div key={i} style={{
                position: 'relative', paddingLeft: 48, paddingBottom: 24,
                animation: `fadeIn 0.4s ease ${i * 0.1}s backwards`
              }}>
                {/* Point */}
                <div style={{
                  position: 'absolute', left: 12, top: 4, width: 16, height: 16,
                  borderRadius: '50%', background: STATUT_COLORS[etape.statut] || 'var(--accent)',
                  border: '3px solid var(--surface)', zIndex: 1
                }} />

                {/* Contenu */}
                <div style={{
                  background: 'var(--surface2)', borderRadius: 12, padding: 16,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{etape.description}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap', marginLeft: 16 }}>
                      {etape.date}
                    </div>
                  </div>

                  {etape.localisation && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)', fontSize: 13 }}>
                      <Icon name="mapPin" size={14} />
                      {etape.localisation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
            Aucun historique disponible
          </div>
        )}
      </div>

      {/* Adresse de livraison */}
      {suivi.adresse && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          padding: 24, marginTop: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Icon name="mapPin" size={20} />
            <div style={{ fontSize: 16, fontWeight: 600 }}>Adresse de livraison</div>
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, paddingLeft: 32 }}>
            {suivi.adresse}
          </div>
        </div>
      )}
    </div>
  );
}

// 📦 Modal Suivi (pour utiliser dans CommandesPage)
export function ModalSuiviLivraison({ commandeId, onClose, onToast }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 900, maxHeight: '90vh', overflow: 'auto' }}>
        <SuiviLivraisonPage commandeId={commandeId} onClose={onClose} onToast={onToast} />
      </div>
    </div>
  );
}

export default SuiviLivraisonPage;
