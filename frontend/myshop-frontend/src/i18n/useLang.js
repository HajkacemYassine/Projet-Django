import { useContext } from "react";
import { LangContext } from "./LangContext.jsx";


export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LanguageProvider>");
  return ctx;
}