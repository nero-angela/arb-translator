import * as fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { Arb } from "../arb/arb";
import { ArbService } from "../arb/arb.service";
import { TranslationCacheKey } from "../cache/translation_cache";
import { TranslationCacheRepository } from "../cache/translation_cache.repository";
import { History } from "../history/history";
import { Language } from "../language/language";
import { LanguageService } from "../language/language.service";
import { APIStatistic, ActionStatistic, ArbStatistic } from "./arb_statistic";

interface InitParams {
  translationCacheRepository: TranslationCacheRepository;
  languageService: LanguageService;
  arbService: ArbService;
}

export class ArbStatisticService {
  private translationCacheRepository: TranslationCacheRepository;
  private languageService: LanguageService;
  private arbService: ArbService;

  constructor({
    translationCacheRepository,
    languageService,
    arbService,
  }: InitParams) {
    this.translationCacheRepository = translationCacheRepository;
    this.languageService = languageService;
    this.arbService = arbService;
  }

  public async showTranslationPreview(
    placeHolder: string,
    sourceArb: Arb,
    targetLanguages: Language[],
    history: History
  ): Promise<Language[]> {
    const arbStatistic: ArbStatistic = await this.getArbStatistic(
      sourceArb,
      targetLanguages,
      history
    );
    const keys = Object.keys(arbStatistic);
    const selectedTargetlanguages = await vscode.window.showQuickPick(
      keys.map((key) => {
        const s = arbStatistic[key];
        const label = path.basename(s.filePath);
        const language = s.language;
        const description = s.isTranslationRequired
          ? Object.entries({
              ...s.action,
              ...s.api,
              retain: 0,
            })
              .filter(([key, value]) => value > 0)
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ")
          : "No changes";
        return {
          label,
          description,
          picked: s.isTranslationRequired,
          language,
        };
      }),
      {
        placeHolder: placeHolder,
        canPickMany: true,
      }
    );
    return selectedTargetlanguages?.map((item) => item.language) ?? [];
  }

  private async getArbStatistic(
    sourceArb: Arb,
    targetLanguages: Language[],
    history: History
  ): Promise<ArbStatistic> {
    const nKeysToBeTranslated: number = sourceArb.keys.filter(
      (key) => !key.includes("@")
    ).length;
    const arbStatistic: ArbStatistic = {};
    for (const targetLanguage of targetLanguages) {
      if (targetLanguage.languageCode === sourceArb.language.languageCode) {
        continue;
      }

      const targetArbFilePath =
        this.languageService.getArbFilePathFromLanguageCode(
          targetLanguage.languageCode
        );
      const isTargetArbFileNotExist = !fs.existsSync(targetArbFilePath);
      const { api, action } = isTargetArbFileNotExist
        ? {
            api: this.getAPIStatistic(sourceArb, targetLanguage),
            action: {
              create: nKeysToBeTranslated,
              update: 0,
              delete: 0,
              retain: 0,
            },
          }
        : this.getStatistic(
            sourceArb,
            await this.arbService.getArb(targetArbFilePath),
            history
          );
      const isTranslationRequired =
        action.create + action.update + action.delete > 0;

      arbStatistic[targetLanguage.languageCode] = {
        filePath: targetArbFilePath,
        language: targetLanguage,
        action,
        api,
        isTranslationRequired,
      };
    }
    return arbStatistic;
  }

  private getStatistic(
    sourceArb: Arb,
    targetArb: Arb,
    history: History
  ): {
    action: ActionStatistic;
    api: APIStatistic;
  } {
    const api: APIStatistic = {
      nAPI: 0,
      nCache: 0,
    };
    const action: ActionStatistic = {
      create: 0,
      update: 0,
      retain: 0,
      delete: targetArb.keys.filter(
        (targetArbKey) => !sourceArb.keys.includes(targetArbKey)
      ).length,
    };
    for (const sourceArbKey of sourceArb.keys) {
      if (sourceArbKey.includes("@")) {
        continue;
      }

      const isKeyInHistory: boolean = history.keys.includes(sourceArbKey);
      const isKeyInTargetArb: boolean = targetArb.keys.includes(sourceArbKey);
      if (isKeyInHistory && isKeyInTargetArb) {
        const sourceArbValue = sourceArb.data[sourceArbKey];
        const historyArbValue = history.data[sourceArbKey];
        if (sourceArbValue === historyArbValue) {
          // retain
          action.retain += 1;
          continue;
        }
      }

      if (isKeyInTargetArb) {
        // update
        action.update += 1;
      } else {
        // create
        action.create += 1;
      }

      const isCache: boolean = this.translationCacheRepository.hasKey(
        new TranslationCacheKey({
          sourceArbValue: sourceArb.data[sourceArbKey],
          sourceLanguage: sourceArb.language,
          targetLanguage: targetArb.language,
        })
      );
      if (isCache) {
        api.nCache += 1;
      } else {
        api.nAPI += 1;
      }
    }
    return { action, api };
  }

  private getAPIStatistic(
    sourceArb: Arb,
    targetLanguage: Language
  ): APIStatistic {
    return sourceArb.keys
      .filter((key) => !key.includes("@"))
      .reduce<APIStatistic>(
        (statistic, sourceArbKey) => {
          const isCache: boolean = this.translationCacheRepository.hasKey(
            new TranslationCacheKey({
              sourceArbValue: sourceArb.data[sourceArbKey],
              sourceLanguage: sourceArb.language,
              targetLanguage,
            })
          );
          return {
            nAPI: statistic.nAPI + (isCache ? 0 : 1),
            nCache: statistic.nCache + (isCache ? 1 : 0),
          };
        },
        {
          nAPI: 0,
          nCache: 0,
        }
      );
  }
}
