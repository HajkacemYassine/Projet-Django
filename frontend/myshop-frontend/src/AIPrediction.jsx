import { useState, useEffect } from 'react';

const ML_API = "http://localhost:8000/ml-api";

// 🎨 Design moderne et élégant
export function AIPredictionDashboard({ getHeaders, onToast }) {
  const [loading, setLoading] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [charts, setCharts] = useState(null);
  const [ville, setVille] = useState('Tunis');
  const [stats, setStats] = useState(null);

  const VILLES = ['Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Nabeul', 'Gabes', 'Kairouan'];

  useEffect(() => {
    const checkModelStatus = async () => {
      try {
        const res = await fetch(`${ML_API}/statistics/?days=7`, { headers: getHeaders() });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        console.log('Erreur vérification modèle');
      }
    };
    checkModelStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trainModel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ML_API}/train/`, { method: 'POST', headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        setModelTrained(true);
        onToast('✅ Modèle IA entraîné avec succès !');
      } else {
        onToast(data.message || data.error || 'Erreur entraînement', 'error');
      }
    } catch (err) {
      onToast('Erreur réseau: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const predictWithAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ML_API}/predict-with-alerts/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ville, auto_create_demand: true })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setPredictions(data.predictions);
        setAlerts(data.alerts || []);
        onToast(`✅ Prédictions générées ! ${data.alerts?.length || 0} alertes détectées`);
      } else {
        if (data.action_required === 'train_model') {
          onToast('⚠️ ' + (data.error || 'Entraînez d\'abord le modèle'), 'warn');
          setModelTrained(false);
        } else {
          onToast(data.error || 'Erreur prédiction', 'error');
        }
      }
    } catch (err) {
      onToast('Erreur réseau: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const getVisualizations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ML_API}/visualizations/?days=30`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.charts) {
        setCharts(data.charts);
        const hasCharts = Object.values(data.charts).some(c => c !== null);
        if (hasCharts) {
          onToast('✅ Graphiques générés !');
        } else {
          onToast('⚠️ Pas assez de données pour les graphiques', 'warn');
        }
      } else {
        onToast('Pas de données pour les graphiques', 'warn');
      }
    } catch (err) {
      onToast('Erreur visualisations: ' + err.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 🎯 Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '24px',
        padding: '48px',
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🤖</div>
          <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1px' }}>
            Intelligence Artificielle
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '18px', maxWidth: '600px', lineHeight: 1.6 }}>
            Anticipez les besoins en sang grâce au machine learning et optimisez la gestion des stocks
          </p>
        </div>
      </div>

      {/* ⚠️ Warning si modèle non entraîné */}
      {!modelTrained && (
        <div style={{
          background: 'linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%)',
          border: '2px solid #ff9800',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 4px 20px rgba(255, 152, 0, 0.15)'
        }}>
          <div style={{ fontSize: '48px', flexShrink: 0 }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#e65100', marginBottom: '8px' }}>
              Modèle non entraîné
            </div>
            <div style={{ fontSize: '14px', color: '#bf360c', lineHeight: 1.6 }}>
              Cliquez sur "Entraîner le Modèle" pour initialiser l'IA avant de faire des prédictions.
            </div>
          </div>
        </div>
      )}

      {/* 📊 Statistiques */}
      {stats && stats.statistiques && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '32px',
          color: 'white',
          marginBottom: '32px',
          boxShadow: '0 10px 40px rgba(102, 126, 234, 0.25)'
        }}>
          <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '20px', fontWeight: '600' }}>
            📊 Statistiques des {stats.periode_jours} derniers jours
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
            {[
              { label: 'Demandes', value: stats.statistiques.total_demandes || 0, icon: '📋' },
              { label: 'Unités totales', value: stats.statistiques.quantite_totale || 0, icon: '🩸' },
              { label: 'Moyenne', value: Math.round(stats.statistiques.quantite_moyenne || 0), icon: '📈' }
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
                <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '4px' }}>{stat.value}</div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎮 Actions principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <button
          onClick={trainModel}
          disabled={loading}
          style={{
            padding: '20px 28px',
            background: modelTrained ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            borderRadius: '16px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            opacity: loading ? 0.6 : 1,
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-4px)')}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span style={{ fontSize: '24px' }}>{loading ? '⏳' : modelTrained ? '✅' : '🎓'}</span>
          {loading ? 'Chargement...' : modelTrained ? 'Modèle Entraîné' : 'Entraîner le Modèle'}
        </button>

        <button
          onClick={predictWithAlerts}
          disabled={loading}
          style={{
            padding: '20px 28px',
            background: 'linear-gradient(135deg, #f093fb, #f5576c)',
            border: 'none',
            borderRadius: '16px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            boxShadow: '0 8px 24px rgba(245, 87, 108, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-4px)')}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span style={{ fontSize: '24px' }}>🔮</span>
          {loading ? 'Chargement...' : 'Prédire la Demande'}
        </button>

        <button
          onClick={getVisualizations}
          disabled={loading}
          style={{
            padding: '20px 28px',
            background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
            border: 'none',
            borderRadius: '16px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            boxShadow: '0 8px 24px rgba(79, 172, 254, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-4px)')}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span style={{ fontSize: '24px' }}>📊</span>
          {loading ? 'Chargement...' : 'Voir les Graphiques'}
        </button>
      </div>

      {/* 🏙️ Sélection ville */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        border: '1px solid #e8ecef',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
      }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '700',
          color: '#6c757d',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          🏙️ Ville
        </label>
        <select
          value={ville}
          onChange={(e) => setVille(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '14px 16px',
            border: '2px solid #e8ecef',
            borderRadius: '12px',
            fontSize: '16px',
            background: '#f8f9fa',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = '#667eea'}
          onBlur={e => e.target.style.borderColor = '#e8ecef'}
        >
          {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* 🚨 Alertes */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>🚨</span> Alertes Critiques ({alerts.length})
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {alerts.map((alert, i) => (
              <div
                key={i}
                style={{
                  background: alert.niveau === 'critique' ? 'linear-gradient(135deg, #fff5f5, #ffe5e5)' : 'linear-gradient(135deg, #fff8e1, #ffecb3)',
                  border: `2px solid ${alert.niveau === 'critique' ? '#c0392b' : '#e67e22'}`,
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  animation: 'fadeIn 0.4s ease'
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: alert.niveau === 'critique' ? '#c0392b' : '#e67e22',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '800',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  {alert.groupe_sanguin}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '6px', color: '#1a1a2e' }}>
                    {alert.groupe_sanguin} - Niveau {alert.niveau}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6c757d' }}>
                    Quantité prédite: <strong>{alert.quantite_predite} unités</strong> (seuil: {alert.seuil})
                  </div>
                </div>
                <span style={{
                  padding: '8px 16px',
                  borderRadius: '24px',
                  background: 'white',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: alert.niveau === 'critique' ? '#c0392b' : '#e67e22',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {alert.niveau}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📈 Prédictions */}
      {predictions && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>📈</span> Prédictions pour {ville}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '16px'
          }}>
            {Object.entries(predictions).map(([groupe, quantite], i) => (
              <div
                key={groupe}
                style={{
                  background: 'white',
                  border: '2px solid #e8ecef',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  animation: `fadeIn 0.4s ease ${i * 0.05}s backwards`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
                  e.currentTarget.style.borderColor = '#c0392b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = '#e8ecef';
                }}
              >
                <div style={{
                  fontSize: '42px',
                  fontWeight: '800',
                  color: '#c0392b',
                  marginBottom: '8px',
                  fontFamily: 'Outfit, sans-serif'
                }}>
                  {quantite}
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1a1a2e',
                  marginBottom: '4px'
                }}>
                  {groupe}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  unités
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📊 Graphiques */}
      {charts && (
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>📊</span> Visualisations
          </h2>
          <div style={{ display: 'grid', gap: '24px' }}>
            {Object.entries(charts).map(([name, data]) => (
              data && (
                <div
                  key={name}
                  style={{
                    background: 'white',
                    border: '2px solid #e8ecef',
                    borderRadius: '20px',
                    padding: '28px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                  }}
                >
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '20px',
                    textTransform: 'capitalize',
                    color: '#1a1a2e'
                  }}>
                    {name.replace(/_/g, ' ')}
                  </h3>
                  <img
                    src={data}
                    alt={name}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '12px'
                    }}
                  />
                </div>
              )
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export function AIStatsCard({ getHeaders }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${ML_API}/statistics/?days=30`, { headers: getHeaders() })
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      borderRadius: '20px',
      padding: '28px',
      color: 'white',
      boxShadow: '0 10px 40px rgba(102, 126, 234, 0.25)'
    }}>
      <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '16px', fontWeight: '600' }}>
        📊 Statistiques IA (30 jours)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        {[
          { label: 'Demandes', value: stats.statistiques?.total_demandes || 0 },
          { label: 'Unités totales', value: stats.statistiques?.quantite_totale || 0 },
          { label: 'Moyenne', value: Math.round(stats.statistiques?.quantite_moyenne || 0) }
        ].map((stat, i) => (
          <div key={i}>
            <div style={{ fontSize: '32px', fontWeight: '800' }}>{stat.value}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
