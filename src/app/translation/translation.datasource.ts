import { Language } from "../language/language";

export interface TranslationDataSource {
  // translate
  translate(
    apiKey: string,
    query: string,
    sourceLang: Language,
    targetLang: Language
  ): Promise<string>;
}
