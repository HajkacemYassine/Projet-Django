import { useState, useEffect } from 'react';

const ML_API = "http://localhost:8000/ml-api";

// Composant principal de prédiction IA
export function AIPredictionDashboard({ getHeaders, onToast }) {
  const [loading, setLoading] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [charts, setCharts] = useState(null);
  const [ville, setVille] = useState('Tunis');
  const [stats, setStats] = useState(null);

  const VILLES = ['Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Nabeul', 'Gabes', 'Kairouan'];

  // Vérifier si le modèle existe au chargement
  useEffect(() => {
    checkModelStatus();
  }, []);

  const checkModelStatus = async () => {
    try {
      const res = await fetch(`${ML_API}/statistics/?days=7`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        // Si on a des stats, le modèle peut potentiellement être entraîné
      }
    } catch (err) {
      console.log('Erreur vérification modèle');
    }
  };

  // Entraîner le modèle
  const trainModel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ML_API}/train/`, {
        method: 'POST',
        headers: getHeaders()
      });
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

  // Prédire avec alertes
  const predictWithAlerts = async () => {
    setLoading(true);
    try {
      const headers = getHeaders();
      console.log('Headers:', headers);
      console.log('Ville:', ville);
      
      const res = await fetch(`${ML_API}/predict-with-alerts/`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ ville, auto_create_demand: true })
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (res.ok) {
        setPredictions(data.predictions);
        setAlerts(data.alerts || []);
        onToast(`✅ Prédictions générées ! ${data.alerts?.length || 0} alertes détectées`);
      } else {
        // Vérifier si c'est une erreur de modèle non entraîné
        if (data.action_required === 'train_model') {
          onToast('⚠️ ' + (data.error || 'Entraînez d\'abord le modèle'), 'warn');
          setModelTrained(false);
        } else {
          onToast(data.error || 'Erreur prédiction', 'error');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      onToast('Erreur réseau: ' + err.message, 'error');
    }
    setLoading(false);
  };

  // Obtenir les visualisations
  const getVisualizations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ML_API}/visualizations/?days=30`, {
        headers: getHeaders()
      });
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
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          🤖 Prédiction IA de Demande en Sang
        </h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
          Anticipez les besoins en sang grâce à l'intelligence artificielle
        </p>
      </div>

      {/* Info box */}
      {!modelTrained && (
        <div style={{
          background: '#fdebd0',
          border: '2px solid #e67e22',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          fontSize: '14px',
          color: '#d35400',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            <strong>Modèle non entraîné</strong>
            <div style={{ marginTop: '4px', fontSize: '13px' }}>
              Cliquez sur "Entraîner le Modèle" avant de faire des prédictions.
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: '#d6eaf8',
        border: '2px solid #2980b9',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        fontSize: '14px',
        color: '#1a5276'
      }}>
        <strong>ℹ️ Instructions :</strong>
        <ol style={{ margin: '8px 0 0 20px', padding: 0 }}>
          <li>Cliquez sur "Entraîner le Modèle" (première utilisation)</li>
          <li>Sélectionnez une ville</li>
          <li>Cliquez sur "Prédire la Demande"</li>
          <li>Consultez les résultats et alertes</li>
        </ol>
      </div>

      {/* Actions principales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <button
          onClick={trainModel}
          disabled={loading}
          style={{
            padding: '14px 20px',
            background: modelTrained ? '#27ae60' : 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Chargement...' : modelTrained ? '✅ Modèle Entraîné' : '🎓 Entraîner le Modèle'}
        </button>

        <button
          onClick={predictWithAlerts}
          disabled={loading}
          style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #f093fb, #f5576c)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Chargement...' : '🔮 Prédire la Demande'}
        </button>

        <button
          onClick={getVisualizations}
          disabled={loading}
          style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Chargement...' : '📊 Voir les Graphiques'}
        </button>
      </div>

      {/* Sélection ville */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '12px', 
          fontWeight: '600', 
          color: '#6c757d',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Ville
        </label>
        <select
          value={ville}
          onChange={(e) => setVille(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '300px',
            padding: '12px',
            border: '2px solid #e8ecef',
            borderRadius: '10px',
            fontSize: '14px',
            background: '#f8f9fa',
            cursor: 'pointer'
          }}
        >
          {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* Statistiques */}
      {stats && stats.statistiques && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '16px',
          padding: '20px',
          color: 'white',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '12px' }}>
            📊 Statistiques ({stats.periode_jours} jours)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800' }}>
                {stats.statistiques.total_demandes || 0}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>Demandes</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800' }}>
                {stats.statistiques.quantite_totale || 0}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>Unités totales</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800' }}>
                {Math.round(stats.statistiques.quantite_moyenne || 0)}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>Moyenne</div>
            </div>
          </div>
        </div>
      )}

      {/* Alertes */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
            🚨 Alertes Critiques ({alerts.length})
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {alerts.map((alert, i) => (
              <div
                key={i}
                style={{
                  background: alert.niveau === 'critique' ? '#fadbd8' : '#fdebd0',
                  border: `2px solid ${alert.niveau === 'critique' ? '#c0392b' : '#e67e22'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: alert.niveau === 'critique' ? '#c0392b' : '#e67e22',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '800'
                }}>
                  {alert.groupe_sanguin}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                    {alert.groupe_sanguin} - Niveau {alert.niveau}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6c757d' }}>
                    Quantité prédite: {alert.quantite_predite} unités (seuil: {alert.seuil})
                  </div>
                </div>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: 'white',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: alert.niveau === 'critique' ? '#c0392b' : '#e67e22'
                }}>
                  {alert.niveau.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prédictions */}
      {predictions && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
            📈 Prédictions pour {ville}
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
            gap: '12px' 
          }}>
            {Object.entries(predictions).map(([groupe, quantite]) => (
              <div
                key={groupe}
                style={{
                  background: 'white',
                  border: '2px solid #e8ecef',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#c0392b',
                  marginBottom: '4px'
                }}>
                  {quantite}
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1a1a2e',
                  marginBottom: '4px'
                }}>
                  {groupe}
                </div>
                <div style={{ fontSize: '11px', color: '#6c757d' }}>
                  unités
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graphiques */}
      {charts && (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
            📊 Visualisations
          </h3>
          <div style={{ display: 'grid', gap: '20px' }}>
            {Object.entries(charts).map(([name, data]) => (
              data && (
                <div
                  key={name}
                  style={{
                    background: 'white',
                    border: '2px solid #e8ecef',
                    borderRadius: '16px',
                    padding: '20px',
                    overflow: 'hidden'
                  }}
                >
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    marginBottom: '16px',
                    textTransform: 'capitalize'
                  }}>
                    {name.replace(/_/g, ' ')}
                  </h4>
                  <img
                    src={data}
                    alt={name}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour afficher les statistiques IA
export function AIStatsCard({ getHeaders }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${ML_API}/statistics/?days=30`, {
      headers: getHeaders()
    })
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      borderRadius: '16px',
      padding: '20px',
      color: 'white'
    }}>
      <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
        📊 Statistiques IA (30 jours)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '800' }}>
            {stats.statistiques?.total_demandes || 0}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>Demandes</div>
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '800' }}>
            {stats.statistiques?.quantite_totale || 0}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>Unités totales</div>
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '800' }}>
            {Math.round(stats.statistiques?.quantite_moyenne || 0)}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>Moyenne</div>
        </div>
      </div>
    </div>
  );
}
