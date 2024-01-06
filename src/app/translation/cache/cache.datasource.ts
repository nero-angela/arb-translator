import * as fs from "fs";
import { FileNotFoundException } from "../../util/exceptions";
import { Workspace } from "../../util/workspace";

type Cache = Record<string, any>;

export class CacheDataSource {
  private cacheFilePath: string = Workspace.getArbPath("cache.json");
  private cache: Cache = {};

  private get isCacheFileExist() {
    return fs.existsSync(this.cacheFilePath);
  }

  public async reload(): Promise<void> {
    if (!this.isCacheFileExist) return;
    const result = await fs.promises.readFile(this.cacheFilePath, "utf8");
    this.cache = JSON.parse(result.trim() === "" ? "{}" : result);
  }

  public hasKey(key: string): boolean {
    return Object.keys(this.cache).includes(key);
  }

  public get<T>(key: string): T | undefined {
    return this.cache[key];
  }

  public upsert(key: string, value: any) {
    if (!this.isCacheFileExist) {
      if (!Workspace.createPath(this.cacheFilePath)) {
        throw new FileNotFoundException(this.cacheFilePath);
      }
    }

    this.cache[key] = value;
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
