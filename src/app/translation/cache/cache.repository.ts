import { CacheDataSource } from "./cache.datasource";

export class CacheRepository {
  private cacheRepository: CacheDataSource = new CacheDataSource();

  public reload(): Promise<void> {
    return this.cacheRepository.reload();
  }

  public hasKey(key: string): boolean {
    return this.cacheRepository.hasKey(key);
  }

  public get<T>(key: string): T | undefined {
    return this.cacheRepository.get(key);
  }

  public upsert(key: string, value: any) {
    return this.cacheRepository.upsert(key, value);
  }
}
