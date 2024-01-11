import * as fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { Arb } from "../arb/arb";
import { ArbService } from "../arb/arb.service";
import { ArbStatistic } from "../arb_statistic/arb_statistic";
import { ArbStatisticService } from "../arb_statistic/arb_statistic.service";
import { ConfigService } from "../config/config.service";
import { History } from "../history/history";
import { HistoryService } from "../history/history.service";
import { Language } from "../language/language";
import { LanguageService } from "../language/language.service";
import { TranslationType } from "../translation/translation";
import { TranslationService } from "../translation/translation.service";
import { TranslationStatistic } from "../translation/translation.statistic";
import {
  APIKeyRequiredException,
  ConfigNotFoundException,
  ConfigurationRequiredException,
  FileNotFoundException,
  SourceArbFilePathRequiredException,
  TranslateLanguagesRequiredException,
} from "../util/exceptions";
import { Toast } from "../util/toast";
import { Cmd } from "./cmd";

interface InitParams {
  arbService: ArbService;
  configService: ConfigService;
  historyService: HistoryService;
  languageService: LanguageService;
  translationService: TranslationService;
  arbStatisticService: ArbStatisticService;
}

export class TranslateCmd {
  private arbService: ArbService;
  private configService: ConfigService;
  private historyService: HistoryService;
  private languageService: LanguageService;
  private translationService: TranslationService;
  private arbStatisticService: ArbStatisticService;

  constructor({
    arbService,
    configService,
    historyService,
    languageService,
    translationService,
    arbStatisticService,
  }: InitParams) {
    this.arbService = arbService;
    this.configService = configService;
    this.historyService = historyService;
    this.languageService = languageService;
    this.translationService = translationService;
    this.arbStatisticService = arbStatisticService;
  }

  async run() {
    // validation
    this.checkValidation();

    // load source arb
    const sourceArb: Arb = await this.arbService.getArb(
      this.configService.config.sourceArbFilePath
    );

    // no data in source arb file
    if (sourceArb.keys.length === 0) {
      Toast.i(`There is no data to translate : ${sourceArb.filePath}`);
      return;
    }

    // get history
    const history: History = this.historyService.get();

    // list of languages to be translated
    const targetLanguages: Language[] =
      this.configService.config.targetLanguageCodeList.map((languageCode) => {
        return this.languageService.getLanguageByLanguageCode(languageCode);
      });

    // get statistic
    const arbStatistic = await this.arbStatisticService.getArbStatistic(
      sourceArb,
      targetLanguages,
      history
    );
    const selectedTargetLanguages = await this.selectTargetLanguages(
      arbStatistic
    );
    if (selectedTargetLanguages.length === 0) {
      return;
    }

    // select translation type
    const translationType = await this.selectTranslationType();
    if (!translationType) {
      return;
    }

    // translate
    await this.translate({
      translationType,
      sourceArb,
      history,
      targetLanguages: selectedTargetLanguages,
    });

    // validate translation
    await vscode.commands.executeCommand(Cmd.validateTranslation);
  }

  private async selectTargetLanguages(
    arbStatistic: ArbStatistic
  ): Promise<Language[]> {
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
        placeHolder: "Please select the file you want to translate.",
        canPickMany: true,
      }
    );
    return selectedTargetlanguages?.map((item) => item.language) ?? [];
  }

  /**
   * Select translation type
   * @throws APIKeyRequiredException
   */
  private async selectTranslationType(): Promise<TranslationType | undefined> {
    // select translation type
    const items: vscode.QuickPickItem[] = [
      {
        label: TranslationType.free,
        description: "Limit to approximately 100 requests per hour",
      },
      { label: TranslationType.paid, description: "Google API key required" },
    ];
    const selectedItem = await vscode.window.showQuickPick(items, {
      placeHolder: "Select changes to exclude from translation",
      canPickMany: false,
    });
    if (!selectedItem) {
      return undefined;
    }

    const type = <TranslationType>selectedItem.label;

    // check google API key if type is paid
    if (
      type === TranslationType.paid &&
      !this.configService.config.googleAPIKey
    ) {
      throw new APIKeyRequiredException();
    }
    return type;
  }

  private checkValidation(): void {
    // check config
    const config = this.configService.config;
    if (!config.sourceArbFilePath || !config.targetLanguageCodeList) {
      throw new ConfigNotFoundException();
    }

    // check source.arb file path
    const sourceArbFilePath = this.configService.config.sourceArbFilePath;
    if (!sourceArbFilePath) {
      throw new SourceArbFilePathRequiredException();
    }

    // check the existence of a source arb file
    if (!fs.existsSync(sourceArbFilePath)) {
      throw new FileNotFoundException(sourceArbFilePath);
    }

    // check selected languages
    const selectedLanguages = this.configService.config.targetLanguageCodeList;
    if (selectedLanguages.length == 0) {
      throw new ConfigurationRequiredException();
    }

    // check config translate languages
    if (!this.configService.config.targetLanguageCodeList) {
      throw new TranslateLanguagesRequiredException();
    }
  }

  async translate({
    translationType,
    sourceArb,
    history,
    targetLanguages,
  }: {
    translationType: TranslationType;
    sourceArb: Arb;
    history: History;
    targetLanguages: Language[];
  }) {
    const translateStatisticList: TranslationStatistic[] = [];
    for (const targetLanguage of targetLanguages) {
      if (targetLanguage.languageCode === sourceArb.language.languageCode) {
        // skip source arb file
        continue;
      }

      const targetArbFilePath =
        this.languageService.getArbFilePathFromLanguageCode(
          targetLanguage.languageCode
        );
      // create target arb file if does not exist
      this.arbService.createIfNotExist(targetArbFilePath, targetLanguage);

      // get targetArb file
      const targetArb: Arb = await this.arbService.getArb(targetArbFilePath);

      // translation target classification
      const nextTargetArbData: Record<string, string> = {};
      const willTranslateData: Record<string, string> = {};

      // statistic
      const translateStatistic = new TranslationStatistic();
      for (const sourceArbKey of sourceArb.keys) {
        if (sourceArbKey === "@@locale") {
          nextTargetArbData[sourceArbKey] = targetArb.language.languageCode;
          continue;
        } else if (sourceArbKey.indexOf("@") !== -1) {
          continue;
        }

        const isKeyInHistory: boolean = history.keys.includes(sourceArbKey);
        const isKeyInTargetArb: boolean = targetArb.keys.includes(sourceArbKey);
        if (isKeyInHistory && isKeyInTargetArb) {
          const sourceArbValue = sourceArb.data[sourceArbKey];
          const historyArbValue = history.data[sourceArbKey];
          if (sourceArbValue === historyArbValue) {
            // skip
            nextTargetArbData[sourceArbKey] = targetArb.data[sourceArbKey];
            translateStatistic.data.nSkip += 1;
            continue;
          }
        }

        // create & update
        // remove deleted items by adding only the key of sourceArbFile
        if (isKeyInTargetArb) translateStatistic.data.nUpdate += 1;
        else translateStatistic.data.nCreate += 1;
        nextTargetArbData[sourceArbKey] = "will be translated";
        willTranslateData[sourceArbKey] = sourceArb.data[sourceArbKey];
      }

      const willTranslateKeys: string[] = Object.keys(willTranslateData);
      const willTranslateValues: string[] = Object.values(willTranslateData);
      const nWillTranslate: number = willTranslateKeys.length;
      if (nWillTranslate > 0) {
        // translate
        const translateResult =
          translationType === TranslationType.paid
            ? await this.translationService.paidTranslate({
                apiKey: this.configService.config.googleAPIKey,
                queries: willTranslateValues,
                sourceLang: sourceArb.language,
                targetLang: targetArb.language,
              })
            : await this.translationService.freeTranslate({
                queries: willTranslateValues,
                sourceLang: sourceArb.language,
                targetLang: targetArb.language,
              });
        willTranslateKeys.forEach(
          (key, index) => (nextTargetArbData[key] = translateResult.data[index])
        );
        translateStatistic.data.nAPICall = translateResult.nAPICall;
        translateStatistic.data.nCache = translateResult.nCache;
      }

      // upsert target arb file
      this.arbService.upsert(targetArbFilePath, nextTargetArbData);
      const targetArbFileName = targetArb.filePath.split("/").pop();
      translateStatisticList.push(translateStatistic);
      Toast.i(
        `🟢 ${targetArbFileName} translated. (${translationType.toString()} ${
          translateStatistic.log
        })`
      );
    }

    // create arb history
    this.historyService.update(sourceArb.data);
    const totalTranslateStatistic = translateStatisticList.reduce(
      (prev, curr) => {
        return prev.sum(curr);
      },
      new TranslationStatistic()
    );
    Toast.i(
      `Total ${
        targetLanguages.length
      } languages translated. (${translationType.toString()} ${
        totalTranslateStatistic.log
      })`
    );
  }
}
