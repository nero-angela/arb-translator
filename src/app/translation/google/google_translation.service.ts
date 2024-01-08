import { TranslationCacheKey } from "../../cache/translation_cache";
import { TranslationCacheRepository } from "../../cache/translation_cache.repository";
import { Language } from "../../language/language";
import { Logger } from "../../util/logger";
import { TranslationResult } from "../translation";
import { TranslationRepository } from "../translation.repository";
import {
  FreeTranslateServiceParams,
  PaidTranslateServiceParams,
  TranslationService,
} from "../translation.service";

interface InitParams {
  cacheRepository: TranslationCacheRepository;
  translationRepository: TranslationRepository;
}
interface TranslateParams {
  queries: string[];
  sourceLang: Language;
  targetLang: Language;
  onTranslate: (query: string) => Promise<string>;
}

export class GoogleTranslationService implements TranslationService {
  private cacheRepository: TranslationCacheRepository;
  private translationRepository: TranslationRepository;

  constructor({ cacheRepository, translationRepository }: InitParams) {
    this.cacheRepository = cacheRepository;
    this.translationRepository = translationRepository;
  }

  /**
   * Translate with payment
   * @param apiKey
   * @param queries
   * @param sourceLang
   * @param targetLang
   * @returns Promise<string[] | undefined>
   * @throws APIKeyRequiredException, TranslationFailureException
   */
  public async paidTranslate({
    apiKey,
    queries,
    sourceLang,
    targetLang,
  }: PaidTranslateServiceParams): Promise<TranslationResult> {
    return this.checkCache({
      queries: queries,
      sourceLang: sourceLang,
      targetLang: targetLang,
      onTranslate: async (query) => {
        return this.translationRepository.paidTranslate({
          apiKey,
          query,
          sourceLang,
          targetLang,
        });
      },
    });
  }

  /**
   * Translate without charge
   * @param queries
   * @param sourceLang
   * @param targetLang
   * @returns Promise<string[] | undefined>
   * @throws TranslationFailureException
   */
  async freeTranslate({
    queries,
    sourceLang,
    targetLang,
  }: FreeTranslateServiceParams): Promise<TranslationResult> {
    return this.checkCache({
      queries: queries,
      sourceLang: sourceLang,
      targetLang: targetLang,
      onTranslate: async (query) => {
        return this.translationRepository.freeTranslate({
          query,
          sourceLang,
          targetLang,
        });
      },
    });
  }

  /**
   * If a translation cache exists, return the cache, otherwise call the onTranslate function
   * @param TranslateParams
   * @returns
   */
  private async checkCache({
    queries,
    sourceLang,
    targetLang,
    onTranslate,
  }: TranslateParams) {
    let nCache = 0;
    let nRequest = 0;
    const results = await Promise.all(
      queries.map(async (query) => {
        const cacheKey = new TranslationCacheKey(query, sourceLang, targetLang);
        const cacheValue = this.cacheRepository.get<string>(cacheKey);
        if (cacheValue) {
          // return cache
          nCache += 1;
          return cacheValue;
        } else {
          // request API
          nRequest += 1;
          const translatedText = await onTranslate(query);

          // update cache
          this.cacheRepository.upsert(cacheKey, translatedText);
          return translatedText;
        }
      })
    );
    Logger.l(`Total translate request : ${nRequest} (cache : ${nCache})`);
    return {
      data: results,
      nAPICall: nRequest,
      nCache,
    };
  }
}
