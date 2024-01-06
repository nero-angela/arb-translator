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
  InvalidLanguageCodeException,
  InvalidTranslateLanguagesException,
  SourceArbFilePathRequiredException,
  ConfigurationRequiredException as TargetLanguageCodeListRequiredException,
  TranslateLanguagesRequiredException,
  WorkspaceNotFoundException,
} from "../util/exceptions";
import { Logger } from "../util/logger";
import { Toast } from "../util/toast";
import { GoogleTranslator } from "./google_translator";
import { Translator } from "./translator";

export class TranslateCmd {
  private historyService: HistoryService;
  private configService: ConfigService;
  private languageService: LanguageService;
  private arbService: ArbService;
  private translator: Translator = new GoogleTranslator();

  constructor(
    configService: ConfigService,
    historyService: HistoryService,
    languageService: LanguageService,
    arbService: ArbService
  ) {
    this.configService = configService;
    this.historyService = historyService;
    this.languageService = languageService;
    this.arbService = arbService;
  }

  async run() {
    try {
      // validation
      this._checkValidation();

      // translate
      await this._translate();
    } catch (e: any) {
      Logger.e(e);
      if (e instanceof WorkspaceNotFoundException) {
        Toast.e("There is no project workspace.");
      } else if (e instanceof ConfigNotFoundException) {
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
      } else if (e instanceof SourceArbFilePathRequiredException) {
        Toast.e(
          "Please add arbTranslator.config.sourceArbFilePath to the .vscode/settings.json file."
        );
      } else if (e instanceof TargetLanguageCodeListRequiredException) {
        Dialog.showTargetLanguageCodeListRequiredDialog();
      } else if (e instanceof APIKeyRequiredException) {
        Dialog.showAPIKeyRequiredDialog();
      } else if (e instanceof FileNotFoundException) {
        Toast.e(e.message);
      } else if (e instanceof InvalidLanguageCodeException) {
        Toast.e(e.message);
      } else if (e instanceof InvalidTranslateLanguagesException) {
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
      throw new FileNotFoundException(`File ${sourceArbPath} not found.`);
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
      throw new TranslateLanguagesRequiredException(
        `Please add translateLanguage to the .vscode/settings.json file.`
      );
    }
  }

  async _translate() {
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
            // not updated
            nextTargetArbData[sourceArbKey] = targetArb.data[sourceArbKey];
            continue;
          }
        }

        // create & update
        // remove deleted items by adding only the key of sourceArbFile
        nextTargetArbData[sourceArbKey] = "will be translated";
        willTranslateData[sourceArbKey] = sourceArb.data[sourceArbKey];
      }
      const willTranslateKeys: string[] = Object.keys(willTranslateData);
      const willTranslateValues: string[] = Object.values(willTranslateData);
      const nTranslateData: number = willTranslateKeys.length;
      // if (nTranslateData > 0) {
      //   const translatedData = await this.translator.translate({
      //     apiKey: this.configService.config.googleAPIKey,
      //     text: willTranslateValues,
      //     sourceLang: sourceArb.language,
      //     targetLang: targetArb.language,
      //   });
      //   if (!translatedData || translatedData.length !== nTranslateData) {
      //     Toast.e("Failed to translate");
      //     return;
      //   }
      //   willTranslateKeys.forEach(
      //     (key, index) => (nextTargetArbData[key] = translatedData[index])
      //   );
      // }

      // upsert target arb file
      this.arbService.upsert(targetArbFilePath, nextTargetArbData);
      const targetArbFileName = targetArb.filePath.split("/").pop();
      Toast.i(`🟢 ${targetArbFileName} translated.`);
    }

    // create arb history

    // const sourceHistory = this.configService.config.sourceHistory;
    // const prevSelectedLanguages = sourceHistory?.selectedLanguages ?? [];
    // const prevSourceData = sourceHistory?.sourceData ?? {};
    // const prevSourceKeys = Object.keys(prevSourceData);
    // const prevSourceLang = sourceHistory?.sourceLang;

    // for (let i = 0; i < selectedLanguages.length; i++) {
    //   const selectedLanguage = selectedLanguages[i];
    //   const targetLang = this.translator.supportLanguages.find(
    //     (l) => l.query === selectedLanguage.query
    //   )!;
    //   const targetData: Record<string, string> = {};
    //   if (targetLang.name === sourceLang.name) {
    //     continue;
    //   }

    //   // check override or not
    //   let isOverride: Boolean = false;
    //   if (prevSourceLang && prevSourceLang.name !== sourceLang.name) {
    //     // check the whether the source language has changed or not
    //     const confirmRes =
    //       (await vscode.window.showInformationMessage(
    //         `The source language has changed from ${prevSourceLang.name} to ${sourceLang.name}. Override the target language files(${selectedLanguages.length}) with new translations?`,
    //         "Override",
    //         "No"
    //       )) ?? "No";
    //     if (confirmRes === "No") {
    //       isOverride = false;
    //       return;
    //     } else {
    //       isOverride = true;
    //     }
    //   } else if (
    //     !prevSelectedLanguages.find((pl) => pl.name === selectedLanguage.name)
    //   ) {
    //     // check the whether the selected language is the previously translated language;
    //     isOverride = true;
    //   }

    //   // check target language arb path
    //   const targetArbPath = `${sourceArbPathSegments.join("/")}/${
    //     arbPrefix + targetLang.arb
    //   }.arb`;

    //   const translateData: Record<string, string> = {};
    //   if (!isOverride && fs.existsSync(targetArbPath)) {
    //     // arb file exists
    //     const prevTargetData: Record<string, string> = JSON.parse(
    //       await fs.promises.readFile(targetArbPath, "utf8")
    //     );
    //     const prevTargetKeys = Object.keys(prevTargetData);
    //     // phrases that need translation
    //     for (const sourceKey in sourceData) {
    //       if (sourceKey === "@@locale") {
    //         targetData[sourceKey] = targetLang.arb;
    //         continue;
    //       } else if (sourceKey.includes("@")) {
    //         targetData[sourceKey] = sourceData[sourceKey];
    //         continue;
    //       }
    //       const prevTargetHasKey = prevTargetKeys.includes(sourceKey);
    //       const prevSourceHasKey = prevSourceKeys.includes(sourceKey);
    //       if (prevTargetHasKey && prevSourceHasKey) {
    //         const isNotChanged =
    //           prevSourceData[sourceKey] === sourceData[sourceKey];
    //         if (isNotChanged) {
    //           // not changed -> caching (not translate)
    //           targetData[sourceKey] = prevTargetData[sourceKey];
    //           continue;
    //         }
    //       }

    //       translateData[sourceKey] = sourceData[sourceKey];
    //       targetData[sourceKey] = "will be translated";
    //     }
    //   } else {
    //     // arb file doesn't exist
    //     for (const sourceKey in sourceData) {
    //       if (sourceKey === "@@locale") {
    //         targetData[sourceKey] = targetLang.arb;
    //         continue;
    //       } else if (sourceKey.includes("@")) {
    //         targetData[sourceKey] = sourceData[sourceKey];
    //         continue;
    //       } else {
    //         targetData[sourceKey] = "will be translated";
    //         translateData[sourceKey] = sourceData[sourceKey];
    //       }
    //     }
    //   }

    //   // translate
    //   const translateKeys = Object.keys(translateData);
    //   if (translateKeys.length > 0) {
    //     const translateValues = await this.translator.translate({
    //       apiKey: this.configService.config.googleAPIKey,
    //       text: Object.values(translateData),
    //       sourceLangQuery: sourceLang.query,
    //       targetLangQuery: targetLang.query,
    //     });
    //     if (
    //       !translateValues ||
    //       translateValues.length !== translateKeys.length
    //     ) {
    //       Toast.e("Failed to translate");
    //       return;
    //     }
    //     translateKeys.forEach(
    //       (key, index) => (targetData[key] = translateValues[index])
    //     );
    //   }

    //   // upsert target arb file
    //   const targetJsonData: string = JSON.stringify(targetData, null, 2);
    //   fs.writeFileSync(targetArbPath, targetJsonData, "utf8");

    //   Toast.i(`🟢 ${targetLang.arb}.arb translated.`);

    //   // update sourceHistory
    //   this.configService.update({
    //     ...this.configService.config,
    //     sourceHistory: {
    //       sourceLang,
    //       sourceData,
    //       selectedLanguages,
    //     },
    //   });
    // }
  }
  // /**
  //  * @throw ConfigurationRequiredException
  //  * @param context
  //  * @returns
  //  */
  // async run(context: vscode.ExtensionContext) {
  //   // check source.arb path
  //   let sourceArbPath = this.configService.config.sourceArbFilePath;
  //   if (!sourceArbPath) {
  //     throw new SourceArbRequiredException();
  //   }

  //   // check selected languages
  //   const selectedLanguages = this.configService.config.selectedLanguages;
  //   if (selectedLanguages.length == 0) {
  //     throw new ConfigurationRequiredException();
  //   }

  //   // check API key
  //   let apiKey = this.configService.config.googleAPIKey;
  //   if (!apiKey) {
  //     throw new APIKeyRequiredException();
  //   }

  //   // read source.arb
  //   if (!fs.existsSync(sourceArbPath)) {
  //     throw new InvalidSourceArbException();
  //   }

  //   const sourceData: Record<string, string> = JSON.parse(
  //     await fs.promises.readFile(sourceArbPath, "utf8")
  //   );
  //   const sourceKeys: string[] = Object.keys(sourceData);
  //   const sourceValues: string[] = Object.values(sourceData);
  //   const sourceLength: number = sourceKeys.length;
  //   if (!sourceData) {
  //     Toast.e(`Failed to json parse`);
  //   } else if (sourceLength == 0) {
  //     Toast.i(`There is no data`);
  //   }

  //   // translate
  //   const sourceArbPathSegments = sourceArbPath.split("/");
  //   const sourceArbFileName = sourceArbPathSegments.pop();
  //   let sourceArb = sourceArbFileName?.split(".arb")[0]!;
  //   const arbPrefix = this.configService.config.arbPrefix;
  //   if (arbPrefix) {
  //     sourceArb = sourceArb.split(arbPrefix)[1]!;
  //   }
  //   const sourceLang = this.translator.languages.find(
  //     (l) => l.arb === sourceArb
  //   )!;
  //   if (!sourceLang) {
  //     throw new InvalidSourceLangException();
  //   }

  //   // get source history
  //   const sourceHistory = this.configService.config.sourceHistory;
  //   const prevSelectedLanguages = sourceHistory?.selectedLanguages ?? [];
  //   const prevSourceData = sourceHistory?.sourceData ?? {};
  //   const prevSourceKeys = Object.keys(prevSourceData);
  //   const prevSourceLang = sourceHistory?.sourceLang;

  //   for (let i = 0; i < selectedLanguages.length; i++) {
  //     const selectedLanguage = selectedLanguages[i];
  //     const targetLang = this.translator.languages.find(
  //       (l) => l.query === selectedLanguage.query
  //     )!;
  //     const targetData: Record<string, string> = {};
  //     if (targetLang.name === sourceLang.name) {
  //       continue;
  //     }

  //     // check override or not
  //     let isOverride: Boolean = false;
  //     if (prevSourceLang && prevSourceLang.name !== sourceLang.name) {
  //       // check the whether the source language has changed or not
  //       const confirmRes =
  //         (await vscode.window.showInformationMessage(
  //           `The source language has changed from ${prevSourceLang.name} to ${sourceLang.name}. Override the target language files(${selectedLanguages.length}) with new translations?`,
  //           "Override",
  //           "No"
  //         )) ?? "No";
  //       if (confirmRes === "No") {
  //         isOverride = false;
  //         return;
  //       } else {
  //         isOverride = true;
  //       }
  //     } else if (
  //       !prevSelectedLanguages.find((pl) => pl.name === selectedLanguage.name)
  //     ) {
  //       // check the whether the selected language is the previously translated language;
  //       isOverride = true;
  //     }

  //     // check target language arb path
  //     const targetArbPath = `${sourceArbPathSegments.join("/")}/${
  //       arbPrefix + targetLang.arb
  //     }.arb`;

  //     const translateData: Record<string, string> = {};
  //     if (!isOverride && fs.existsSync(targetArbPath)) {
  //       // arb file exists
  //       const prevTargetData: Record<string, string> = JSON.parse(
  //         await fs.promises.readFile(targetArbPath, "utf8")
  //       );
  //       const prevTargetKeys = Object.keys(prevTargetData);
  //       // phrases that need translation
  //       for (const sourceKey in sourceData) {
  //         if (sourceKey === "@@locale") {
  //           targetData[sourceKey] = targetLang.arb;
  //           continue;
  //         } else if (sourceKey.includes("@")) {
  //           targetData[sourceKey] = sourceData[sourceKey];
  //           continue;
  //         }
  //         const prevTargetHasKey = prevTargetKeys.includes(sourceKey);
  //         const prevSourceHasKey = prevSourceKeys.includes(sourceKey);
  //         if (prevTargetHasKey && prevSourceHasKey) {
  //           const isNotChanged =
  //             prevSourceData[sourceKey] === sourceData[sourceKey];
  //           if (isNotChanged) {
  //             // not changed -> caching (not translate)
  //             targetData[sourceKey] = prevTargetData[sourceKey];
  //             continue;
  //           }
  //         }

  //         translateData[sourceKey] = sourceData[sourceKey];
  //         targetData[sourceKey] = "will be translated";
  //       }
  //     } else {
  //       // arb file doesn't exist
  //       for (const sourceKey in sourceData) {
  //         if (sourceKey === "@@locale") {
  //           targetData[sourceKey] = targetLang.arb;
  //           continue;
  //         } else if (sourceKey.includes("@")) {
  //           targetData[sourceKey] = sourceData[sourceKey];
  //           continue;
  //         } else {
  //           targetData[sourceKey] = "will be translated";
  //           translateData[sourceKey] = sourceData[sourceKey];
  //         }
  //       }
  //     }

  //     // translate
  //     const translateKeys = Object.keys(translateData);
  //     if (translateKeys.length > 0) {
  //       const translateValues = await this.translator.translate({
  //         apiKey: this.configService.config.googleAPIKey,
  //         text: Object.values(translateData),
  //         sourceLangQuery: sourceLang.query,
  //         targetLangQuery: targetLang.query,
  //       });
  //       if (
  //         !translateValues ||
  //         translateValues.length !== translateKeys.length
  //       ) {
  //         Toast.e("Failed to translate");
  //         return;
  //       }
  //       translateKeys.forEach(
  //         (key, index) => (targetData[key] = translateValues[index])
  //       );
  //     }

  //     // upsert target arb file
  //     const targetJsonData: string = JSON.stringify(targetData, null, 2);
  //     fs.writeFileSync(targetArbPath, targetJsonData, "utf8");

  //     Toast.i(`🟢 ${targetLang.arb}.arb translated.`);

  //     // update sourceHistory
  //     this.configService.update({
  //       ...this.configService.config,
  //       sourceHistory: {
  //         sourceLang,
  //         sourceData,
  //         selectedLanguages,
  //       },
  //     });
  //   }
  // }
}
