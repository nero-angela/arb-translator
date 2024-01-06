import { Language } from "../../language/language";
import { Crypto } from "../../util/crypto";

export type Cache = Record<string, any>;

export class TranslationCacheKey {
  public data: string;

  constructor(
    query: string,
    sourceLanguage: Language,
    targetLanguage: Language,
  ) {
    this.data = `${sourceLanguage.languageCode}-${
      targetLanguage.languageCode
    }-${Crypto.generateSHA1(query)}`;
  }
}