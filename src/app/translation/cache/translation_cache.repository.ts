import { TranslationCacheKey } from "./translation_cache";
import { TranslationCacheDataSource } from "./translation_cache.datasource";

export class TranslationCacheRepository {
  private cacheRepository: TranslationCacheDataSource =
    new TranslationCacheDataSource();

  public reload(): Promise<void> {
    return this.cacheRepository.reload();
  }

  public hasKey(cacheKey: TranslationCacheKey): boolean {
    return this.cacheRepository.hasKey(cacheKey);
  }

  public get<T>(cacheKey: TranslationCacheKey): T | undefined {
    return this.cacheRepository.get(cacheKey);
  }

  public upsert(cacheKey: TranslationCacheKey, value: any) {
    return this.cacheRepository.upsert(cacheKey, value);
  }
}
