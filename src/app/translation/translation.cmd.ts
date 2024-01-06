import * as fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { Arb } from "../arb/arb";
import { ArbService } from "../arb/arb.service";
import { ConfigService } from "../config/config.service";
import { History } from "../history/history";
import { HistoryService } from "../history/history.service";
import { Language } from "../language/language";
import { LanguageService } from "../language/language.service";
import { Dialog } from "../util/dialog";
import {
  APIKeyRequiredException,
  ConfigNotFoundException,
  FileNotFoundException,
  MessageException,
  SourceArbFilePathRequiredException,
  ConfigurationRequiredException as TargetLanguageCodeListRequiredException,
  TranslateLanguagesRequiredException,
  WorkspaceNotFoundException,
} from "../util/exceptions";
import { Logger } from "../util/logger";
import { Toast } from "../util/toast";
import { GoogleTranslationService } from "./google/google_translation.service";
import { TranslationType } from "./translation";
import { TranslationService } from "./translation.service";
import { TranslationStatistic } from "./translation.statistic";

export class TranslationCmd {
  private arbService: ArbService;
  private configService: ConfigService;
  private historyService: HistoryService;
  private languageService: LanguageService;
  private translationService: TranslationService;

  constructor(
    arbService: ArbService,
    configService: ConfigService,
    historyService: HistoryService,
    languageService: LanguageService
  ) {
    this.arbService = arbService;
    this.configService = configService;
    this.historyService = historyService;
    this.languageService = languageService;
    this.translationService = new GoogleTranslationService();
  }

  async run(type: TranslationType) {
    try {
      // validation
      this._checkValidation();

      // translate
      await this._translate(type);
    } catch (e: any) {
      Logger.e(e);
      if (e instanceof ConfigNotFoundException) {
        Dialog.showConfigRequiredDialog(async () => {
          await this.configService.addRequiredParams();
          const workspacePath = vscode.workspace.workspaceFolders![0].uri.path;
          const workspaceSettingsPath = path.join(
            workspacePath,
            ".vscode",
            "settings.json"
          );
          // open .vscode/settings.json
          vscode.workspace
            .openTextDocument(workspaceSettingsPath)
            .then((document) => {
              vscode.window.showTextDocument(document);
            });
          // description
          Dialog.showConfigDescriptionDialog();
        });
      } else if (e instanceof TargetLanguageCodeListRequiredException) {
        Dialog.showTargetLanguageCodeListRequiredDialog();
      } else if (e instanceof APIKeyRequiredException) {
        Dialog.showAPIKeyRequiredDialog();
      } else if (e instanceof MessageException) {
        Toast.e(e.message);
      } else {
        Toast.e(e);
      }
    }
  }

  private _checkValidation() {
    // check workspace
    if (!vscode.workspace.workspaceFolders) {
      throw new WorkspaceNotFoundException();
    }

    // check config
    const config = this.configService.config;
    if (
      config.sourceArbFilePath === undefined ||
      config.targetLanguageCodeList === undefined ||
      config.googleAPIKey === undefined
    ) {
      throw new ConfigNotFoundException();
    }

    // check source.arb path
    const sourceArbPath = this.configService.config.sourceArbFilePath;
    if (!sourceArbPath) {
      throw new SourceArbFilePathRequiredException();
    }

    // check the existence of a source arb file
    if (!fs.existsSync(sourceArbPath)) {
      throw new FileNotFoundException(sourceArbPath);
    }

    // check selected languages
    const selectedLanguages = this.configService.config.targetLanguageCodeList;
    if (selectedLanguages.length == 0) {
      throw new TargetLanguageCodeListRequiredException();
    }

    // check API key
    let apiKey = this.configService.config.googleAPIKey;
    if (!apiKey) {
      throw new APIKeyRequiredException();
    }

    // check config translate languages
    if (!this.configService.config.targetLanguageCodeList) {
      throw new TranslateLanguagesRequiredException();
    }
  }

  async _translate(type: TranslationType) {
    const sourceArbFilePath = this.configService.config.sourceArbFilePath;
    const sourceArb: Arb = await this.arbService.get(sourceArbFilePath);

    if (sourceArb.keys.length === 0) {
      // no data in source arb file
      Toast.i(`There is no data to translate : ${sourceArb.filePath}`);
      return;
    }

    // list of languages to be translated
    const targetLanguages: Language[] =
      this.configService.config.targetLanguageCodeList.map((languageCode) => {
        return this.languageService.getLanguageByLanguageCode(languageCode);
      });

    // get history
    const history: History = await this.historyService.get();
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
      const targetArb: Arb = await this.arbService.get(targetArbFilePath);

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
        const translateResult = await this.translationService.translate(
          type,
          this.configService.config.googleAPIKey,
          willTranslateValues,
          sourceArb.language,
          targetArb.language
        );
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
        `🟢 ${targetArbFileName} translated. (${type.toString()} ${
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
      } languages translated. (${type.toString()} ${
        totalTranslateStatistic.log
      })`
    );
  }
}
