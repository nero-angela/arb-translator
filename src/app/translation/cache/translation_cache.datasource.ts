import * as fs from "fs";
import { Language } from "../../language/language";
import { Crypto } from "../../util/crypto";
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

  public hasKey(key: TranslationCacheKey): boolean {
    return Object.keys(this.cache).includes(key.data);
  }

  public get<T>(key: TranslationCacheKey): T | undefined {
    return this.cache[key.data];
  }

  public upsert(key: TranslationCacheKey, value: any) {
    if (!this.isCacheFileExist) {
      if (!Workspace.createPath(this.cacheFilePath)) {
        throw new FileNotFoundException(this.cacheFilePath);
      }
    }

    this.cache[key.data] = value;
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
