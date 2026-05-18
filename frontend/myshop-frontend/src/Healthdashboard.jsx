import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Area, AreaChart
} from "recharts";
 
// ─── API helper ───────────────────────────────────────────────────────────────
const API = "http://localhost:8000/blood-api";
 
function authHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
 
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers || {}) },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}
 
// ─── Translations ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  fr: {
    title: "Tableau de Bord Santé",
    subtitle: "Suivez vos indicateurs de santé et restez éligible au don",
    newEntry: "Nouvelle mesure",
    history: "Historique",
    stats: "Statistiques",
    hemoglobin: "Hémoglobine (g/dL)",
    bloodPressure: "Tension artérielle",
    heartRate: "Fréquence cardiaque (bpm)",
    weight: "Poids (kg)",
    notes: "Notes",
    save: "Enregistrer",
    cancel: "Annuler",
    recommendations: "Recommandations",
    canDonate: "Éligible au don ✅",
    cannotDonate: "Non éligible ❌",
    latestReading: "Dernière mesure",
    noData: "Aucune donnée de santé. Ajoutez votre première mesure !",
    loading: "Chargement...",
    delete: "Supprimer",
    min: "Min",
    max: "Max",
    avg: "Moy",
    total: "Entrées",
    evolution: "Évolution de l'hémoglobine",
    normalRange: "Zone normale",
    date: "Date",
    lang: "Langue",
    placeholder_bp: "ex: 120/80",
    success: "Mesure enregistrée avec succès !",
    error: "Une erreur est survenue.",
  },
  en: {
    title: "Health Dashboard",
    subtitle: "Track your health indicators and stay eligible to donate",
    newEntry: "New Reading",
    history: "History",
    stats: "Statistics",
    hemoglobin: "Hemoglobin (g/dL)",
    bloodPressure: "Blood Pressure",
    heartRate: "Heart Rate (bpm)",
    weight: "Weight (kg)",
    notes: "Notes",
    save: "Save",
    cancel: "Cancel",
    recommendations: "Recommendations",
    canDonate: "Eligible to Donate ✅",
    cannotDonate: "Not Eligible ❌",
    latestReading: "Latest Reading",
    noData: "No health data yet. Add your first reading!",
    loading: "Loading...",
    delete: "Delete",
    min: "Min",
    max: "Max",
    avg: "Avg",
    total: "Entries",
    evolution: "Hemoglobin Over Time",
    normalRange: "Normal Range",
    date: "Date",
    lang: "Language",
    placeholder_bp: "e.g. 120/80",
    success: "Reading saved successfully!",
    error: "An error occurred.",
  },
  ar: {
    title: "لوحة الصحة",
    subtitle: "تتبع مؤشراتك الصحية وابقَ مؤهلاً للتبرع",
    newEntry: "قياس جديد",
    history: "السجل",
    stats: "الإحصاءات",
    hemoglobin: "الهيموغلوبين (غ/ديسيلتر)",
    bloodPressure: "ضغط الدم",
    heartRate: "معدل ضربات القلب (نبضة/د)",
    weight: "الوزن (كغ)",
    notes: "ملاحظات",
    save: "حفظ",
    cancel: "إلغاء",
    recommendations: "التوصيات",
    canDonate: "مؤهل للتبرع ✅",
    cannotDonate: "غير مؤهل ❌",
    latestReading: "آخر قياس",
    noData: "لا توجد بيانات صحية. أضف قياسك الأول!",
    loading: "جارٍ التحميل...",
    delete: "حذف",
    min: "أدنى",
    max: "أعلى",
    avg: "متوسط",
    total: "إدخالات",
    evolution: "تطور الهيموغلوبين",
    normalRange: "النطاق الطبيعي",
    date: "التاريخ",
    lang: "اللغة",
    placeholder_bp: "مثال: 120/80",
    success: "تم حفظ القياس بنجاح!",
    error: "حدث خطأ.",
  },
};
 
const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "ar", label: "العربية",  flag: "🇹🇳" },
];
 
// ─── Sub-components ───────────────────────────────────────────────────────────
 
function StatCard({ label, value, unit, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.06)",
      border: `1px solid ${color}44`,
      borderRadius: 16,
      padding: "18px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}>
      <span style={{ color: "#aaa", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
      <span style={{ color, fontSize: 28, fontWeight: 700 }}>
        {value} <span style={{ fontSize: 14, fontWeight: 400, color: "#888" }}>{unit}</span>
      </span>
    </div>
  );
}
 
function RecommendationBadge({ text }) {
  const isGood   = text.startsWith("✅");
  const isWarn   = text.startsWith("⚠️");
  const isInfo   = text.startsWith("ℹ️");
  const color    = isGood ? "#22c55e" : isWarn ? "#f59e0b" : "#60a5fa";
  const bg       = isGood ? "#22c55e18" : isWarn ? "#f59e0b18" : "#60a5fa18";
  return (
    <div style={{
      background: bg, border: `1px solid ${color}44`,
      borderRadius: 10, padding: "10px 14px",
      color: "#e5e7eb", fontSize: 14, lineHeight: 1.5,
    }}>
      {text}
    </div>
  );
}
 
// ─── Main Component ───────────────────────────────────────────────────────────
export default function HealthDashboard() {
  const [lang, setLang]         = useState("fr");
  const [tab, setTab]           = useState("dashboard"); // dashboard | history | add
  const [entries, setEntries]   = useState([]);
  const [stats, setStats]       = useState(null);
  const [latest, setLatest]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState(null);
  const [form, setForm]         = useState({
    hemoglobine: "", tension_arterielle: "",
    frequence_cardiaque: "", poids: "", notes: "",
  });
 
  const t = TRANSLATIONS[lang];
  const isRTL = lang === "ar";
 
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
 
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [list, statsData, latestData] = await Promise.allSettled([
        apiFetch("/health/"),
        apiFetch("/health/stats/"),
        apiFetch("/health/latest/"),
      ]);
      if (list.status === "fulfilled")    setEntries(list.value);
      if (statsData.status === "fulfilled") setStats(statsData.value);
      if (latestData.status === "fulfilled") setLatest(latestData.value);
    } catch (_) {}
    setLoading(false);
  }, []);
 
  useEffect(() => { loadData(); }, [loadData]);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/health/", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          hemoglobine: parseFloat(form.hemoglobine),
          frequence_cardiaque: form.frequence_cardiaque ? parseInt(form.frequence_cardiaque) : null,
          poids: form.poids ? parseFloat(form.poids) : null,
        }),
      });
      showToast(t.success);
      setForm({ hemoglobine: "", tension_arterielle: "", frequence_cardiaque: "", poids: "", notes: "" });
      setTab("dashboard");
      loadData();
    } catch {
      showToast(t.error, "error");
    }
  };
 
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette entrée ?")) return;
    try {
      await apiFetch(`/health/${id}/`, { method: "DELETE" });
      loadData();
    } catch { showToast(t.error, "error"); }
  };
 
  // ── Styles ──────────────────────────────────────────────────────────────────
  const S = {
    wrap: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      color: "#f3f4f6",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      direction: isRTL ? "rtl" : "ltr",
      padding: "0 0 60px",
    },
    header: {
      background: "rgba(255,255,255,0.04)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "20px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
    },
    title: {
      fontSize: 26, fontWeight: 800,
      background: "linear-gradient(90deg, #f87171, #fb923c)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      margin: 0,
    },
    langBtn: (active) => ({
      background: active ? "rgba(248,113,113,0.2)" : "transparent",
      border: active ? "1px solid #f87171" : "1px solid rgba(255,255,255,0.1)",
      color: active ? "#f87171" : "#aaa",
      borderRadius: 8, padding: "6px 12px",
      cursor: "pointer", fontSize: 13, transition: "all 0.2s",
    }),
    content: { maxWidth: 960, margin: "0 auto", padding: "32px 20px" },
    tabs: {
      display: "flex", gap: 8, marginBottom: 28,
      background: "rgba(255,255,255,0.04)",
      borderRadius: 12, padding: 6,
    },
    tab: (active) => ({
      flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
      background: active ? "linear-gradient(135deg, #f87171, #fb923c)" : "transparent",
      color: active ? "#fff" : "#aaa",
      fontWeight: active ? 700 : 400, cursor: "pointer",
      fontSize: 14, transition: "all 0.2s",
    }),
    card: {
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20, padding: 24, marginBottom: 20,
    },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 },
    label: { display: "block", color: "#9ca3af", fontSize: 12, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 },
    input: {
      width: "100%", background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
      color: "#f3f4f6", padding: "10px 14px", fontSize: 15,
      outline: "none", boxSizing: "border-box",
    },
    textarea: {
      width: "100%", background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
      color: "#f3f4f6", padding: "10px 14px", fontSize: 15,
      outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: 80,
    },
    btnPrimary: {
      background: "linear-gradient(135deg, #f87171, #fb923c)",
      color: "#fff", border: "none", borderRadius: 10,
      padding: "12px 28px", fontWeight: 700, fontSize: 15,
      cursor: "pointer",
    },
    btnSecondary: {
      background: "rgba(255,255,255,0.06)",
      color: "#aaa", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10, padding: "12px 20px", fontSize: 15, cursor: "pointer",
    },
    btnDanger: {
      background: "rgba(239,68,68,0.12)", color: "#ef4444",
      border: "1px solid rgba(239,68,68,0.3)",
      borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer",
    },
    toast: (type) => ({
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: type === "success" ? "#22c55e" : "#ef4444",
      color: "#fff", padding: "12px 20px", borderRadius: 12,
      fontWeight: 600, fontSize: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }),
  };
 
  // ── Render tabs ──────────────────────────────────────────────────────────────
  const chartData = stats?.historique || [];
 
  return (
    <div style={S.wrap}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>🩸 {t.title}</h1>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: "4px 0 0" }}>{t.subtitle}</p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} style={S.langBtn(lang === l.code)}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      </div>
 
      <div style={S.content}>
        {/* Tabs */}
        <div style={S.tabs}>
          {[
            { key: "dashboard", label: `📊 ${t.latestReading}` },
            { key: "history",   label: `📋 ${t.history}` },
            { key: "add",       label: `➕ ${t.newEntry}` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={S.tab(tab === key)}>
              {label}
            </button>
          ))}
        </div>
 
        {loading ? (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: 60 }}>{t.loading}</p>
        ) : (
          <>
            {/* ── DASHBOARD TAB ── */}
            {tab === "dashboard" && (
              <>
                {!latest ? (
                  <div style={{ ...S.card, textAlign: "center", padding: 48 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>💉</div>
                    <p style={{ color: "#9ca3af" }}>{t.noData}</p>
                    <button style={{ ...S.btnPrimary, marginTop: 16 }} onClick={() => setTab("add")}>
                      {t.newEntry}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Eligibility banner */}
                    <div style={{
                      ...S.card,
                      background: latest.peut_donner
                        ? "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))"
                        : "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
                      border: `1px solid ${latest.peut_donner ? "#22c55e" : "#ef4444"}44`,
                      textAlign: "center", padding: 32,
                    }}>
                      <div style={{ fontSize: 40, marginBottom: 8 }}>
                        {latest.peut_donner ? "✅" : "❌"}
                      </div>
                      <div style={{
                        fontSize: 22, fontWeight: 700,
                        color: latest.peut_donner ? "#22c55e" : "#ef4444",
                      }}>
                        {latest.peut_donner ? t.canDonate : t.cannotDonate}
                      </div>
                      <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>{latest.date_mesure}</div>
                    </div>
 
                    {/* Stats grid */}
                    {stats && (
                      <div style={{ ...S.grid4, marginBottom: 20 }}>
                        <StatCard label={t.min}   value={stats.stats.min}   unit="g/dL" color="#60a5fa" />
                        <StatCard label={t.max}   value={stats.stats.max}   unit="g/dL" color="#f87171" />
                        <StatCard label={t.avg}   value={stats.stats.moy}   unit="g/dL" color="#fb923c" />
                        <StatCard label={t.total} value={stats.stats.total_entrees} unit="" color="#a78bfa" />
                      </div>
                    )}
 
                    {/* Chart */}
                    {chartData.length > 1 && (
                      <div style={S.card}>
                        <h3 style={{ color: "#e5e7eb", marginBottom: 20, fontSize: 16 }}>{t.evolution}</h3>
                        <ResponsiveContainer width="100%" height={220}>
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="hgbGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#f87171" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="date" stroke="#555" tick={{ fill: "#888", fontSize: 11 }} />
                            <YAxis domain={[8, 20]} stroke="#555" tick={{ fill: "#888", fontSize: 11 }} />
                            <Tooltip
                              contentStyle={{ background: "#1f1f3a", border: "1px solid #333", borderRadius: 8 }}
                              labelStyle={{ color: "#aaa" }}
                              itemStyle={{ color: "#f87171" }}
                            />
                            <ReferenceLine y={12} stroke="#22c55e" strokeDasharray="4 4" label={{ value: "Min ♀", fill: "#22c55e", fontSize: 10 }} />
                            <ReferenceLine y={13} stroke="#60a5fa" strokeDasharray="4 4" label={{ value: "Min ♂", fill: "#60a5fa", fontSize: 10 }} />
                            <Area type="monotone" dataKey="hemoglobine" stroke="#f87171" fill="url(#hgbGrad)" strokeWidth={2} dot={{ r: 4, fill: "#f87171" }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
 
                    {/* Recommendations */}
                    {latest.recommandations?.length > 0 && (
                      <div style={S.card}>
                        <h3 style={{ color: "#e5e7eb", marginBottom: 16, fontSize: 16 }}>💡 {t.recommendations}</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {latest.recommandations.map((r, i) => (
                            <RecommendationBadge key={i} text={r} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
 
            {/* ── HISTORY TAB ── */}
            {tab === "history" && (
              <div style={S.card}>
                {entries.length === 0 ? (
                  <p style={{ color: "#9ca3af", textAlign: "center", padding: 40 }}>{t.noData}</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {entries.map((e) => (
                      <div key={e.id} style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12, padding: "16px 20px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        flexWrap: "wrap", gap: 12,
                      }}>
                        <div>
                          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 6 }}>
                            <span style={{ color: "#f87171", fontWeight: 700 }}>{e.hemoglobine} g/dL</span>
                            <span style={{ color: "#60a5fa" }}>💓 {e.tension_arterielle}</span>
                            {e.frequence_cardiaque && <span style={{ color: "#a78bfa" }}>❤️ {e.frequence_cardiaque} bpm</span>}
                            {e.poids && <span style={{ color: "#fb923c" }}>⚖️ {e.poids} kg</span>}
                          </div>
                          <div style={{ color: "#6b7280", fontSize: 12 }}>{e.date_mesure}</div>
                          {e.notes && <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>{e.notes}</div>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{
                            background: e.peut_donner ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                            color: e.peut_donner ? "#22c55e" : "#ef4444",
                            border: `1px solid ${e.peut_donner ? "#22c55e" : "#ef4444"}44`,
                            borderRadius: 8, padding: "4px 10px", fontSize: 12,
                          }}>
                            {e.peut_donner ? "✅" : "❌"}
                          </span>
                          <button style={S.btnDanger} onClick={() => handleDelete(e.id)}>{t.delete}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
 
            {/* ── ADD TAB ── */}
            {tab === "add" && (
              <div style={S.card}>
                <h3 style={{ color: "#e5e7eb", marginBottom: 24, fontSize: 18 }}>➕ {t.newEntry}</h3>
                <form onSubmit={handleSubmit}>
                  <div style={{ ...S.grid2, marginBottom: 16 }}>
                    <div>
                      <label style={S.label}>{t.hemoglobin} *</label>
                      <input style={S.input} type="number" step="0.1" min="5" max="25" required
                        value={form.hemoglobine}
                        onChange={e => setForm(f => ({ ...f, hemoglobine: e.target.value }))}
                        placeholder="ex: 14.5"
                      />
                    </div>
                    <div>
                      <label style={S.label}>{t.bloodPressure} *</label>
                      <input style={S.input} type="text" required
                        value={form.tension_arterielle}
                        onChange={e => setForm(f => ({ ...f, tension_arterielle: e.target.value }))}
                        placeholder={t.placeholder_bp}
                      />
                    </div>
                    <div>
                      <label style={S.label}>{t.heartRate}</label>
                      <input style={S.input} type="number" min="30" max="200"
                        value={form.frequence_cardiaque}
                        onChange={e => setForm(f => ({ ...f, frequence_cardiaque: e.target.value }))}
                        placeholder="ex: 72"
                      />
                    </div>
                    <div>
                      <label style={S.label}>{t.weight}</label>
                      <input style={S.input} type="number" step="0.1" min="30" max="300"
                        value={form.poids}
                        onChange={e => setForm(f => ({ ...f, poids: e.target.value }))}
                        placeholder="ex: 70"
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={S.label}>{t.notes}</label>
                    <textarea style={S.textarea}
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="..."
                    />
                  </div>
                  <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                    <button type="button" style={S.btnSecondary} onClick={() => setTab("dashboard")}>{t.cancel}</button>
                    <button type="submit" style={S.btnPrimary}>{t.save}</button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
 
      {/* Toast */}
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
    </div>
  );
}