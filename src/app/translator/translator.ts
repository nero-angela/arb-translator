import { Language } from "../language/language";

export interface TranslateResult {
  data: string[];
  nReq: number;
  nCache: number;
}

export interface Translator {
  // translator name
  name: string;

  // translate
  translate(
    apiKey: string,
    queries: string[],
    sourceLang: Language,
    targetLang: Language
  ): Promise<TranslateResult>;
}
