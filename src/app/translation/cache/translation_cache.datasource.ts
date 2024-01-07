import * as fs from "fs";
import { FileNotFoundException } from "../../util/exceptions";
import { Workspace } from "../../util/workspace";
import { Cache, TranslationCacheKey } from "./translation_cache";

export class TranslationCacheDataSource {
  private cacheFilePath: string = Workspace.getArbPath("cache.json");
  private cache: Cache = {};

  private get isCacheFileExist() {
    return fs.existsSync(this.cacheFilePath);
  }

  public async reload(): Promise<void> {
    if (!this.isCacheFileExist) {
      this.cache = {};
      return;
    }
    const jsonString = await fs.promises.readFile(this.cacheFilePath, "utf8");
    this.cache = JSON.parse(jsonString.trim() === "" ? "{}" : jsonString);
  }

  public hasKey(cacheKey: TranslationCacheKey): boolean {
    const { sourceLanguageCode, targetLanguageCode, querySHA1 } = cacheKey;
    return (
      this.cache[sourceLanguageCode] &&
      this.cache[sourceLanguageCode][targetLanguageCode] &&
      this.cache[sourceLanguageCode][targetLanguageCode][querySHA1]
    );
  }

  public get<T>(cacheKey: TranslationCacheKey): T | undefined {
    const { sourceLanguageCode, targetLanguageCode, querySHA1 } = cacheKey;
    if (this.hasKey(cacheKey)) {
      return this.cache[sourceLanguageCode][targetLanguageCode][querySHA1];
    }
    return undefined;
  }

  public upsert(cacheKey: TranslationCacheKey, value: any) {
    // create cache file
    if (!this.isCacheFileExist) {
      if (!Workspace.createPath(this.cacheFilePath)) {
        throw new FileNotFoundException(this.cacheFilePath);
      }
    }

    const { sourceLanguageCode, targetLanguageCode, querySHA1 } = cacheKey;

    if (!this.cache[sourceLanguageCode]) {
      this.cache[sourceLanguageCode] = {};
    }

    if (!this.cache[sourceLanguageCode][targetLanguageCode]) {
      this.cache[sourceLanguageCode][targetLanguageCode] = {};
    }

    this.cache[sourceLanguageCode][targetLanguageCode][querySHA1] = value;

    fs.writeFileSync(
      this.cacheFilePath,
      JSON.stringify(
        {
          description: `This file is a Google API cache file.`,
          ...this.cache,
        },
        null,
        2
      ),
      "utf-8"
    );
  }
}
