import path from "path";
import * as vscode from "vscode";
import { Arb } from "../arb/arb";
import { ArbService } from "../arb/arb.service";
import { TranslationCacheKey } from "../cache/translation_cache";
import { TranslationCacheRepository } from "../cache/translation_cache.repository";
import { ConfigService } from "../config/config.service";
import { SourceArbFilePathRequiredException } from "../util/exceptions";
import { Toast } from "../util/toast";

interface InitParams {
  arbService: ArbService;
  configService: ConfigService;
  cacheRepository: TranslationCacheRepository;
}

export class CreateTranslationCache {
  private arbService: ArbService;
  private configService: ConfigService;
  private cacheRepository: TranslationCacheRepository;

  constructor({ arbService, configService, cacheRepository }: InitParams) {
    this.arbService = arbService;
    this.configService = configService;
    this.cacheRepository = cacheRepository;
  }

  public async run() {
    // check source.arb file path
    const sourceArbFilePath = this.configService.config.sourceArbFilePath;
    if (!sourceArbFilePath) {
      throw new SourceArbFilePathRequiredException();
    }

    // get arb file list from source arb directory
    const arbFileList = this.getArbFileList(sourceArbFilePath);
    if (arbFileList.length === 0) {
      return Toast.i("There is no arbFile to create a translation cache.");
    }

    // select arb files to create translation cache
    const selectedArbFiles = await this.selectArbFilesToCreateTranslationCache(
      arbFileList
    );
    if (selectedArbFiles.length === 0) {
      return Toast.i(
        "Please select the arbFile where you want to create the translation cache."
      );
    }

    // create translation cache
    const totalCreatedCache = await this.createTranslationCache(
      sourceArbFilePath,
      selectedArbFiles
    );

    Toast.i(
      `${totalCreatedCache} caches created in ${selectedArbFiles.length} files`
    );
  }

  private getArbFileList(sourceArbFilePath: string): string[] {
    const arbFiles = this.arbService.getArbFiles(sourceArbFilePath);

    // return excluding source arb file
    return arbFiles.filter((arbFile) => arbFile !== sourceArbFilePath);
  }

  private async selectArbFilesToCreateTranslationCache(
    arbFileList: string[]
  ): Promise<string[]> {
    if (arbFileList.length == 0) {
      return [];
    }

    const items: vscode.QuickPickItem[] = arbFileList.map((arbFile) => {
      return { label: path.basename(arbFile), description: arbFile };
    });

    const selectedItems = await vscode.window.showQuickPick(items, {
      placeHolder: "Select arb files to create translation cache.",
      canPickMany: true,
    });

    if (!selectedItems) {
      return [];
    } else {
      return selectedItems.map((item) => item.description!);
    }
  }

  private async createTranslationCache(
    sourceArbFilePath: string,
    arbFileList: string[]
  ): Promise<number> {
    // read source arb file
    const sourceArb: Arb = await this.arbService.get(sourceArbFilePath);

    // loop target arb file
    let totalCreatedCache = 0;
    for (const targetArbFile of arbFileList) {
      // read target arb file
      const targetArb: Arb = await this.arbService.get(targetArbFile);

      // loop source arb keys
      for (const sourceArbKey of sourceArb.keys) {
        if (sourceArbKey.includes("@")) {
          continue;
        }

        // skip if there is no key in the target arb file
        if (!targetArb.keys.includes(sourceArbKey)) {
          continue;
        }

        // upsert cache
        const sourceArbValue = sourceArb.data[sourceArbKey];
        const targetArbValue = targetArb.data[sourceArbKey];
        const cacheKey = new TranslationCacheKey(
          sourceArbValue,
          sourceArb.language,
          targetArb.language
        );
        this.cacheRepository.upsert(cacheKey, targetArbValue);
        totalCreatedCache += 1;
      }
    }
    return totalCreatedCache;
  }
}
