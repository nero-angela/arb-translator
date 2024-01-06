import axios from "axios";
import { CacheService } from "../cache/cache.service";
import { Language } from "../language/language";
import {
  APIKeyRequiredException,
  TranslationFailureException,
} from "../util/exceptions";
import { hasHtmlTags } from "../util/html";
import { Logger } from "../util/logger";
import { TranslateResult, Translator } from "./translator";

export class GoogleTranslator implements Translator {
  public name: string = "Google Translator";

  private cacheService: CacheService;

  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
  }

  /**
   *
   * @param apiKey
   * @param queries
   * @param sourceLang
   * @param targetLang
   * @returns Promise<string[] | undefined>
   * @throws TranslationFailureException
   */
  async translate(
    apiKey: string,
    queries: string[],
    sourceLang: Language,
    targetLang: Language
  ): Promise<TranslateResult> {
    if (!apiKey) {
      throw new APIKeyRequiredException();
    }
    let nCache = 0;
    let nRequest = 0;
    // reload cache
    await this.cacheService.reload();
    const results = await Promise.all(
      queries.map(async (query) => {
        const cacheKey = this.getCacheKey(query, sourceLang, targetLang);
        const cacheValue = this.cacheService.get<string>(cacheKey);
        if (cacheValue) {
          // return cache
          nCache += 1;
          return cacheValue;
        } else {
          // request API
          nRequest += 1;
          const translatedText = await this.translateWithGoogle(
            apiKey,
            query,
            sourceLang,
            targetLang
          );

          // update cache
          this.cacheService.upsert(cacheKey, translatedText);
          return translatedText;
        }
      })
    );
    Logger.l(`Total translate request : ${nRequest} (cache : ${nCache})`);
    return {
      data: results,
      nReq: nRequest,
      nCache,
    };
  }

  private getCacheKey(
    query: string,
    sourceLang: Language,
    targetLang: Language
  ) {
    return `${sourceLang.gt}-${targetLang.gt}-${query}`;
  }

  private async translateWithGoogle(
    apiKey: string,
    query: string,
    sourceLang: Language,
    targetLang: Language
  ): Promise<string> {
    try {
      // replace {params}
      let count = 0;
      const keys = [
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
      const dictionary: Record<string, string> = {};
      const q = query.replace(/\{(.+?)\}/g, (_, match) => {
        const replacement = keys[count];
        dictionary[replacement] = `{${match}}`;
        count++;
        return replacement;
      });
      // Logger.l(`${q} -> ${query}`);
      const format = hasHtmlTags(query) ? "html" : "text";
      const response = await axios.get(
        encodeURI(
          `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${q}&target=${targetLang.gt}&source=${sourceLang.gt}&alt=json&format=${format}`
        )
      );
      let translatedText: string =
        response.data.data.translations[0].translatedText;
      let result: string = translatedText;
      // restore {params}
      const dictKeys = Object.keys(dictionary);
      for (const i in dictKeys) {
        const key = dictKeys[i];
        result = result.replace(key, (match) => {
          return dictionary[match] || match;
        });
      }
      // replace &#39; to '
      result.replaceAll("&#39;", "'");

      // Logger.l(`${translatedText} -> ${text}`);
      return result;
    } catch (e: any) {
      throw new TranslationFailureException(
        e.response?.data.error.message ?? e
      );
    }
  }
}
