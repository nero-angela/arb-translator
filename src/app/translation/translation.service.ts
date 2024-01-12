import { Language } from "../language/language";
import { TranslationResult } from "./translation";

export interface PaidTranslateServiceParams {
  apiKey: string;
  queries: string[];
  sourceLang: Language;
  targetLang: Language;
}

export interface FreeTranslateServiceParams {
  queries: string[];
  sourceLang: Language;
  targetLang: Language;
}

export interface TranslationService {
  getTranslateWebsiteUrl(
    sourceLanguage: Language,
    targetLanguage: Language,
    text: string
  ): string;

  paidTranslate({
    apiKey,
    queries,
    sourceLang,
    targetLang,
  }: PaidTranslateServiceParams): Promise<TranslationResult>;

  freeTranslate({
    queries,
    sourceLang,
    targetLang,
  }: FreeTranslateServiceParams): Promise<TranslationResult>;
}
