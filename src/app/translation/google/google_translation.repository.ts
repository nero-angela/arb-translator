import { Language } from "../../language/language";
import { TranslationFailureException } from "../../util/exceptions";
import { Logger } from "../../util/logger";
import { CacheRepository } from "../cache/cache.repository";
import { Translation, TranslationType } from "../translation";
import { TranslationDataSource } from "../translation.datasource";
import { TranslationRepository } from "../translation.repository";
import { GoogleTranslationFreeDataSource } from "./google_translation.free.datasource";
import { GoogleTranslationChargeDataSource as GoogleTranslationPaidDataSource } from "./google_translation.paid.datasource";

interface EncodeResult {
  dictionary: Record<string, string>;
  encodedText: string;
}

export class GoogleTranslationRepository implements TranslationRepository {
  private cacheRepository = new CacheRepository();
  private paidTranslationDataSource = new GoogleTranslationPaidDataSource();
  private freeTranslationDataSource = new GoogleTranslationFreeDataSource();

  private getCacheKey(
    query: string,
    sourceLang: Language,
    targetLang: Language
  ) {
    return `${sourceLang.gt}-${targetLang.gt}-${query}`;
  }

  public async translate(
    type: TranslationType,
    apiKey: string,
    queries: string[],
    sourceLang: Language,
    targetLang: Language
  ): Promise<Translation> {
    let nCache = 0;
    let nRequest = 0;
    // reload cache
    await this.cacheRepository.reload();
    const results = await Promise.all(
      queries.map(async (query) => {
        const cacheKey = this.getCacheKey(query, sourceLang, targetLang);
        const cacheValue = this.cacheRepository.get<string>(cacheKey);
        if (cacheValue) {
          // return cache
          nCache += 1;
          return cacheValue;
        } else {
          // request API
          nRequest += 1;
          const translatedText = await this.translateWithGoogle(
            type == TranslationType.paid
              ? this.paidTranslationDataSource
              : this.freeTranslationDataSource,
            apiKey,
            query,
            sourceLang,
            targetLang
          );

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

  private paramReplaceKeys: string[] = [
    "0️⃣",
    "1️⃣",
    "2️⃣",
    "3️⃣",
    "4️⃣",
    "5️⃣",
    "6️⃣",
    "7️⃣",
    "8️⃣",
    "9️⃣",
    "🔟",
  ];
  private encodeText(text: string): EncodeResult {
    let count = 0;
    const dictionary: Record<string, string> = {};
    const encodedText: string = text.replace(/\{(.+?)\}/g, (_, match) => {
      if (count >= this.paramReplaceKeys.length) {
        throw new TranslationFailureException(
          `The number of parameters has exceeded the maximum (${this.paramReplaceKeys.length}).`
        );
      }
      const replacement = this.paramReplaceKeys[count];
      dictionary[replacement] = `{${match}}`;
      count++;
      return replacement;
    });
    return {
      dictionary,
      encodedText,
    };
  }

  private decodeText(dictionary: Record<string, string>, text: string): string {
    let decodedText: string = text;
    // restore {params}
    const dictKeys = Object.keys(dictionary);
    for (const i in dictKeys) {
      const key = dictKeys[i];
      decodedText = decodedText.replace(key, (match) => {
        return dictionary[match] || match;
      });
    }
    // replace &#39; to '
    decodedText.replaceAll("&#39;", "'");

    return decodedText;
  }

  private async translateWithGoogle(
    translationDataSource: TranslationDataSource,
    apiKey: string,
    query: string,
    sourceLang: Language,
    targetLang: Language
  ): Promise<string> {
    try {
      // encode
      const { dictionary, encodedText }: EncodeResult = this.encodeText(query);

      // translate
      const translatedText = await translationDataSource.translate(
        apiKey,
        encodedText,
        sourceLang,
        targetLang
      );

      // decode
      const decodedText = this.decodeText(dictionary, translatedText);
      return decodedText;
    } catch (e: any) {
      throw new TranslationFailureException(
        e.response?.data.error.message ?? `Translation failed : ${e.message}`
      );
    }
  }
}