import { CacheRepository } from "./cache.repository";

export class CacheService {
  private cacheRepository: CacheRepository = new CacheRepository();

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
