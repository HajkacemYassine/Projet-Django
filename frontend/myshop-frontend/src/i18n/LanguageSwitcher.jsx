import { useLang} from "./useLang";
import { LANGS } from "./langs";

 
export default function LanguageSwitcher({ style = {} }) {
  const { lang, setLang } = useLang();
 
  return (
    <div style={{
      display: "flex",
      gap: 6,
      alignItems: "center",
      ...style,
    }}>
      {Object.values(LANGS).map((l) => {
        const active = lang === l.code;
        return (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            title={l.label}
            style={{
              background: active
                ? "linear-gradient(135deg, #f87171, #fb923c)"
                : "rgba(255,255,255,0.06)",
              border: active
                ? "1px solid transparent"
                : "1px solid rgba(255,255,255,0.12)",
              color: active ? "#fff" : "#9ca3af",
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: active ? 700 : 400,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span>{l.flag}</span>
            <span style={{ display: window.innerWidth > 500 ? "inline" : "none" }}>
              {l.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}