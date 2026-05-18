import { useState } from 'react';

const ML_API = "http://localhost:8000/ml-api";

export function AdvancedAIFeatures({ getHeaders, onToast }) {
  const [loading, setLoading] = useState(false);
  const [weekPredictions, setWeekPredictions] = useState(null);
  const [stockOptimization, setStockOptimization] = useState(null);
  const [donorAvailability, setDonorAvailability] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [trends, setTrends] = useState(null);
  const [modelPerformance, setModelPerformance] = useState(null);
  const [ville, setVille] = useState('Tunis');
  const [activeTab, setActiveTab] = useState('week');

  const VILLES = ['Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Nabeul', 'Gabes', 'Kairouan'];

  const predictNextWeek = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ML_API}/predict-week/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ville })
      });
      const data = await res.json();
      if (res.ok) {
        setWeekPredictions(data);
        onToast('✅ Prédictions hebdomadaires générées !');
      } else {
        onToast(data.error || 'Erreur', 'error');
      }
    } catch (err) {
      onToast('Erreur réseau: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const optimizeStock = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ML_API}/optimize-stock/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ville })
      });
      const data = await res.json();
      if (res.ok) {
        setStockOptimization(data);
        onToast('✅ Optimisation des stocks calculée !');
      } else {
        onToast(data.error || 'Erreur', 'error');
      }
    } catch (err) {
      onToast('Erreur réseau: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const getDonorAvailability = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ML_API}/donor-availability/?ville=${ville}`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setDonorAvailability(data);
        onToast('✅ Disponibilité des donneurs chargée !');
      } else {
        onToast('Erreur', 'error');
      }
    } catch (err) {
      onToast('Erreur réseau: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ML_API}/predict-recommendations/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ville })
      });
      const data = await res.json();
      if (res.ok) {
        setRecommendations(data);
        onToast('✅ Recommandations générées !');
      } else {
        onToast(data.error || 'Erreur', 'error');
      }
    } catch (err) {
      onToast('Erreur réseau: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const getTrends = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ML_API}/demand-trends/?ville=${ville}`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setTrends(data);
        onToast('✅ Tendances chargées !');
      } else {
        onToast('Erreur', 'error');
      }
    } catch (err) {
      onToast('Erreur réseau: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const getModelPerformance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ML_API}/model-performance/`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setModelPerformance(data);
        onToast('✅ Performance du modèle chargée !');
      } else {
        onToast(data.error || 'Erreur', 'error');
      }
    } catch (err) {
      onToast('Erreur réseau: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'week', label: '📅 Prédictions 7 jours', action: predictNextWeek },
    { id: 'stock', label: '📦 Optimisation Stock', action: optimizeStock },
    { id: 'donors', label: '👥 Disponibilité Donneurs', action: getDonorAvailability },
    { id: 'recommendations', label: '💡 Recommandations', action: getRecommendations },
    { id: 'trends', label: '📈 Tendances', action: getTrends },
    { id: 'performance', label: '🎯 Performance Modèle', action: getModelPerformance }
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '24px',
        padding: '40px',
        color: 'white',
        marginBottom: '32px',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚀</div>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
          Fonctionnalités IA Avancées
        </h1>
        <p style={{ margin: 0, opacity: 0.95, fontSize: '16px' }}>
          Analyse prédictive, optimisation et recommandations intelligentes
        </p>
      </div>

      {/* Sélection ville */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid #e8ecef',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
      }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '700',
          color: '#6c757d',
          marginBottom: '10px',
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
            maxWidth: '300px',
            padding: '12px 16px',
            border: '2px solid #e8ecef',
            borderRadius: '12px',
            fontSize: '15px',
            background: '#f8f9fa',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        flexWrap: 'wrap',
        background: 'white',
        padding: '12px',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              tab.action();
            }}
            disabled={loading}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderRadius: '12px',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6c757d',
              fontSize: '14px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              opacity: loading ? 0.6 : 1
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div>
        {/* Prédictions hebdomadaires */}
        {activeTab === 'week' && weekPredictions && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>
              📅 Prédictions pour les 7 prochains jours - {weekPredictions.ville}
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {weekPredictions.predictions_semaine.map((day, i) => (
                <div key={i} style={{
                  background: 'white',
                  border: '2px solid #e8ecef',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e' }}>{day.jour}</div>
                      <div style={{ fontSize: '13px', color: '#6c757d' }}>{day.date}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                    {Object.entries(day.predictions).map(([groupe, quantite]) => (
                      <div key={groupe} style={{
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        padding: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#c0392b' }}>{quantite}</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a2e' }}>{groupe}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimisation stock */}
        {activeTab === 'stock' && stockOptimization && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>
              📦 Allocation Optimale des Stocks - {stockOptimization.ville}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {Object.entries(stockOptimization.allocation_optimale).map(([groupe, data]) => (
                <div key={groupe} style={{
                  background: 'white',
                  border: '2px solid #e8ecef',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#c0392b' }}>{groupe}</div>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: data.priorite === 'Haute' ? '#fee2e2' : data.priorite === 'Moyenne' ? '#fef3c7' : '#e0f2fe',
                      color: data.priorite === 'Haute' ? '#dc2626' : data.priorite === 'Moyenne' ? '#d97706' : '#0284c7'
                    }}>
                      {data.priorite}
                    </span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#1a1a2e' }}>{data.quantite_predite}</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>unités prédites</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>{data.pourcentage}%</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>du stock total</div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e8ecef' }}>
                    <strong>Compatible avec:</strong> {data.groupes_compatibles.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disponibilité donneurs */}
        {activeTab === 'donors' && donorAvailability && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>
              👥 Disponibilité des Donneurs - {donorAvailability.ville}
            </h2>
            <div style={{
              background: 'white',
              border: '2px solid #e8ecef',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '48px', fontWeight: '800', color: '#667eea', marginBottom: '8px' }}>
                {donorAvailability.total_donneurs_actifs}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>Donneurs actifs au total</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {donorAvailability.disponibilite_par_groupe.map((item) => (
                <div key={item.groupe_sanguin} style={{
                  background: 'white',
                  border: '2px solid #e8ecef',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#c0392b', marginBottom: '12px' }}>
                    {item.groupe_sanguin}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a2e' }}>{item.eligibles}</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>éligibles / {item.total} total</div>
                  </div>
                  <div style={{
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#667eea' }}>
                      {item.taux_disponibilite}%
                    </div>
                    <div style={{ fontSize: '11px', color: '#6c757d' }}>disponibilité</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommandations */}
        {activeTab === 'recommendations' && recommendations && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>
              💡 Recommandations Intelligentes - {recommendations.ville}
            </h2>
            {recommendations.recommendations.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
                {recommendations.recommendations.map((rec, i) => (
                  <div key={i} style={{
                    background: rec.priorite === 'Critique' ? 'linear-gradient(135deg, #fff5f5, #ffe5e5)' : 'linear-gradient(135deg, #fff8e1, #ffecb3)',
                    border: `2px solid ${rec.priorite === 'Critique' ? '#c0392b' : '#e67e22'}`,
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: rec.priorite === 'Critique' ? '#c0392b' : '#e67e22',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: '800',
                        flexShrink: 0
                      }}>
                        {rec.groupe}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '6px', color: '#1a1a2e' }}>
                          {rec.action}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>
                          {rec.message}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          Quantité prédite: <strong>{rec.quantite_predite} unités</strong>
                        </div>
                      </div>
                      <span style={{
                        padding: '8px 16px',
                        borderRadius: '24px',
                        background: 'white',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: rec.priorite === 'Critique' ? '#c0392b' : '#e67e22'
                      }}>
                        {rec.priorite}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                background: 'white',
                border: '2px solid #e8ecef',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                color: '#6c757d'
              }}>
                ✅ Aucune action urgente requise pour le moment
              </div>
            )}
            
            {/* Prédictions */}
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', marginTop: '32px' }}>
              📊 Prédictions détaillées
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
              {Object.entries(recommendations.predictions).map(([groupe, quantite]) => (
                <div key={groupe} style={{
                  background: 'white',
                  border: '2px solid #e8ecef',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#c0392b' }}>{quantite}</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>{groupe}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tendances */}
        {activeTab === 'trends' && trends && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>
              📈 Analyse des Tendances - {trends.ville}
            </h2>
            <div style={{ display: 'grid', gap: '20px' }}>
              {Object.entries(trends.tendances).map(([period, data]) => (
                <div key={period} style={{
                  background: 'white',
                  border: '2px solid #e8ecef',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#667eea' }}>
                    {period.replace('_', ' ')}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '32px', fontWeight: '800', color: '#1a1a2e' }}>{data.total_demandes}</div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>Total demandes</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '32px', fontWeight: '800', color: '#c0392b' }}>{data.quantite_totale}</div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>Unités totales</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '32px', fontWeight: '800', color: '#e67e22' }}>{data.demandes_urgentes}</div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>Demandes urgentes</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '32px', fontWeight: '800', color: '#667eea' }}>{data.moyenne_par_jour}</div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>Moyenne/jour</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance modèle */}
        {activeTab === 'performance' && modelPerformance && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>
              🎯 Performance du Modèle IA
            </h2>
            <div style={{ display: 'grid', gap: '20px', marginBottom: '32px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '16px',
                padding: '32px',
                color: 'white',
                boxShadow: '0 10px 40px rgba(102, 126, 234, 0.25)'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '16px', fontWeight: '600' }}>
                  📊 Métriques de Performance
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '36px', fontWeight: '800' }}>{modelPerformance.metrics.mae?.toFixed(2)}</div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Erreur Moyenne Absolue (MAE)</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '36px', fontWeight: '800' }}>{(modelPerformance.metrics.r2_score * 100)?.toFixed(1)}%</div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Score R² (Précision)</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '36px', fontWeight: '800' }}>{modelPerformance.metrics.n_samples}</div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Échantillons d'entraînement</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>{modelPerformance.metrics.model_type}</div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Type de modèle</div>
                  </div>
                </div>
              </div>
            </div>

            {modelPerformance.feature_importance && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
                  🔍 Importance des Caractéristiques
                </h3>
                <div style={{
                  background: 'white',
                  border: '2px solid #e8ecef',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}>
                  {Object.entries(modelPerformance.feature_importance).map(([feature, importance]) => (
                    <div key={feature} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>{feature}</span>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#667eea' }}>
                          {(importance * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div style={{
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        height: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: 'linear-gradient(90deg, #667eea, #764ba2)',
                          height: '100%',
                          width: `${importance * 100}%`,
                          transition: 'width 1s ease',
                          borderRadius: '8px'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
