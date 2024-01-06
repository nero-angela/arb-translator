import { Language } from "../language/language";
import { Translation, TranslationType } from "./translation";

export interface TranslationRepository {
  // translate
  translate(
    type: TranslationType,
    apiKey: string,
    queries: string[],
    sourceLang: Language,
    targetLang: Language
  ): Promise<Translation>;
}
