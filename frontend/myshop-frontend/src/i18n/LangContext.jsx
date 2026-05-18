import { createContext, useState, useCallback } from "react";
import { LANGS } from "./langs";

export const LangContext = createContext(null);

export function LanguageProvider({ children }) {
  const saved = localStorage.getItem("bc_lang") || "fr";
  const [langCode, setLangCode] = useState(saved);

  const setLang = useCallback((code) => {
    if (!LANGS[code]) return; 
    setLangCode(code);
    localStorage.setItem("bc_lang", code);
    document.documentElement.setAttribute("dir", LANGS[code].dir);
    document.documentElement.setAttribute("lang", code);
  }, []);

  const t = useCallback(
    (key) => LANGS[langCode]?.[key] ?? LANGS["fr"]?.[key] ?? key,
    [langCode]
  );

  return (
    <LangContext.Provider value={{ lang: langCode, langs: LANGS, t, setLang, isRTL: LANGS[langCode]?.dir === "rtl", currentLang: LANGS[langCode] }}>
      {children}
    </LangContext.Provider>
  );
}

export default LanguageProvider;