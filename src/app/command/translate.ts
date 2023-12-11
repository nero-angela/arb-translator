import * as fs from "fs";
import * as vscode from "vscode";
import { Translator } from "../translator/translator";
import { Config } from "../util/config";
import {
  APIKeyRequiredException,
  ConfigurationRequiredException,
  InvalidSourceArbException,
  SourceArbRequiredException,
} from "../util/exceptions";
import { Toast } from "../util/toast";

export class Translate {
  config: Config;
  translator: Translator;

  constructor(config: Config, translator: Translator) {
    this.config = config;
    this.translator = translator;
  }

  /**
   * @throw ConfigurationRequiredException
   * @param context
   * @returns
   */
  async run(context: vscode.ExtensionContext) {
    // check source.arb path
    let sourceArbPath = this.config.data.sourceArbFilePath;
    if (!sourceArbPath) {
      throw new SourceArbRequiredException();
    }

    // check selected languages
    const selectedLanguages = this.config.data.selectedLanguages;
    if (selectedLanguages.length == 0) {
      throw new ConfigurationRequiredException();
    }

    // check API key
    let apiKey = this.config.data.googleAPIKey;
    if (!apiKey) {
      throw new APIKeyRequiredException();
    }

    // read source.arb
    if (!fs.existsSync(sourceArbPath)) {
      throw new InvalidSourceArbException();
    }

    const sourceData: Record<string, string> = JSON.parse(
      await fs.promises.readFile(sourceArbPath, "utf8")
    );
    const sourceKeys: string[] = Object.keys(sourceData);
    const sourceValues: string[] = Object.values(sourceData);
    const sourceLength: number = sourceKeys.length;
    if (!sourceData) {
      Toast.e(`Failed to json parse`);
    } else if (sourceLength == 0) {
      Toast.i(`There is no data`);
    }

    // translate
    const sourceArbPathSegments = sourceArbPath.split("/");
    const sourceArbFileName = sourceArbPathSegments.pop();
    const sourceArb = sourceArbFileName?.split(".arb")[0]!;
    const sourceLang = this.translator.languages.find(
      (l) => l.arb === sourceArb
    )!;

    // get source history
    const sourceHistory = this.config.data.sourceHistory;
    const prevSelectedLanguages = sourceHistory?.selectedLanguages ?? [];
    const prevSourceData = sourceHistory?.sourceData ?? {};
    const prevSourceKeys = Object.keys(prevSourceData);
    const prevSourceLang = sourceHistory?.sourceLang;

    for (let i = 0; i < selectedLanguages.length; i++) {
      const selectedLanguage = selectedLanguages[i];
      const targetLang = this.translator.languages.find(
        (l) => l.query === selectedLanguage.query
      )!;
      const targetData: Record<string, string> = {};
      if (targetLang.name === sourceLang.name) {
        continue;
      }

      // check override or not
      let isOverride: Boolean = false;
      if (prevSourceLang && prevSourceLang.name !== sourceLang.name) {
        // check the whether the source language has changed or not
        const confirmRes =
          (await vscode.window.showInformationMessage(
            `The source language has changed from ${prevSourceLang.name} to ${sourceLang.name}. Override the target language files(${selectedLanguages.length}) with new translations?`,
            "Override",
            "No"
          )) ?? "No";
        if (confirmRes === "No") {
          isOverride = false;
          return;
        } else {
          isOverride = true;
        }
      } else if (
        !prevSelectedLanguages.find((pl) => pl.name === selectedLanguage.name)
      ) {
        // check the whether the selected language is the previously translated language;
        isOverride = true;
      }

      // check target language arb path
      const targetArbPath = `${sourceArbPathSegments.join("/")}/${
        targetLang.arb
      }.arb`;
      if (!isOverride && fs.existsSync(targetArbPath)) {
        // arb file exists
        const prevTargetData: Record<string, string> = JSON.parse(
          await fs.promises.readFile(targetArbPath, "utf8")
        );
        const prevTargetKeys = Object.keys(prevTargetData);
        // phrases that need translation
        const translateData: Record<string, string> = {};
        for (const sourceKey in sourceData) {
          if (sourceKey === "@@locale") {
            targetData[sourceKey] = targetLang.arb;
            continue;
          } else if (sourceKey.includes("@")) {
            continue;
          }
          const prevTargetHasKey = prevTargetKeys.includes(sourceKey);
          const prevSourceHasKey = prevSourceKeys.includes(sourceKey);
          if (prevTargetHasKey && prevSourceHasKey) {
            const isNotChanged =
              prevSourceData[sourceKey] === sourceData[sourceKey];
            if (isNotChanged) {
              // not changed -> caching (not translate)
              targetData[sourceKey] = prevTargetData[sourceKey];
              continue;
            }
          }

          translateData[sourceKey] = sourceData[sourceKey];
          targetData[sourceKey] = "will be translated";
        }

        const translateKeys = Object.keys(translateData);
        if (translateKeys.length > 0) {
          // translate
          const translateValues = await this.translator.translate({
            apiKey: this.config.data.googleAPIKey,
            text: Object.values(translateData),
            sourceLangQuery: sourceLang.query,
            targetLangQuery: targetLang.query,
          });
          if (
            !translateValues ||
            translateValues.length !== translateKeys.length
          ) {
            Toast.e("Failed to translate");
            return;
          }
          translateKeys.forEach(
            (key, index) => (targetData[key] = translateValues[index])
          );
        }
      } else {
        // arb file doesn't exist
        const targetValues = await this.translator.translate({
          apiKey: this.config.data.googleAPIKey,
          text: sourceValues,
          sourceLangQuery: sourceLang.query,
          targetLangQuery: targetLang.query,
        });

        if (!targetValues || targetValues.length !== sourceLength) {
          Toast.e("Failed to translate");
          return;
        }

        sourceKeys.forEach((key, index) => {
          if (key === "@@locale") {
            targetData[key] = targetLang.arb;
          } else if (!key.includes("@")) {
            targetData[key] = targetValues[index];
          }
        });
      }

      // upsert target arb file
      const targetJsonData: string = JSON.stringify(targetData, null, 2);
      fs.writeFileSync(targetArbPath, targetJsonData, "utf8");

      Toast.i(`🟢 ${targetLang.arb}.arb translated.`);

      // update sourceHistory
      this.config.update(context, {
        ...this.config.data,
        sourceHistory: {
          sourceLang,
          sourceData,
          selectedLanguages,
        },
      });
    }
  }
}
