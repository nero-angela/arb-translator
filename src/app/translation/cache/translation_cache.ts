import { Language } from "../../language/language";
import { Crypto } from "../../util/crypto";

export type Cache = {
  [sourceLanguageCode: string]: {
    [targetLanguageCode: string]: {
      [querySHA1: string]: any;
    };
  };
};

export class TranslationCacheKey {
  private query: string;
  private sourceLanguage: Language;
  private targetLanguage: Language;
  public querySHA1: string;

  get sourceLanguageCode(): string {
    return this.sourceLanguage.languageCode;
  }
  get targetLanguageCode(): string {
    return this.targetLanguage.languageCode;
  }

  constructor(
    query: string,
    sourceLanguage: Language,
    targetLanguage: Language
  ) {
    this.query = query;
    this.sourceLanguage = sourceLanguage;
    this.targetLanguage = targetLanguage;
    this.querySHA1 = Crypto.generateSHA1(query);
  }
}
