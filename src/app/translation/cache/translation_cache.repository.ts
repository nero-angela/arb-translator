import { TranslationCacheKey } from "./translation_cache";
import { TranslationCacheDataSource } from "./translation_cache.datasource";

export class TranslationCacheRepository {
  private cacheRepository: TranslationCacheDataSource =
    new TranslationCacheDataSource();

  public reload(): Promise<void> {
    return this.cacheRepository.reload();
  }

  public hasKey(key: TranslationCacheKey): boolean {
    return this.cacheRepository.hasKey(key);
  }

  public get<T>(key: TranslationCacheKey): T | undefined {
    return this.cacheRepository.get(key);
  }

  public upsert(key: TranslationCacheKey, value: any) {
    return this.cacheRepository.upsert(key, value);
  }
}
