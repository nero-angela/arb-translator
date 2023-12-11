import * as fs from "fs";
import * as vscode from "vscode";
import { Translator } from "../translator/translator";
import { Config } from "../util/config";
import {
  APIKeyRequiredException,
  ConfigurationRequiredException,
  InvalidSourceArbException,
  InvalidSourceLangException,
  SourceArbRequiredException,
} from "../util/exceptions";
import { Logger } from "../util/logger";
import { Toast } from "../util/toast";
import { Configuration } from "./configure";
import { Translate } from "./translate";

export class Command {
  config: Config;
  translator: Translator;
  _translate: Translate;
  _configure: Configuration;

  constructor(config: Config, translator: Translator) {
    this.config = config;
    this.translator = translator;
    this._configure = new Configuration(config, translator);
    this._translate = new Translate(config, translator);
  }

  async updateAPIKey(context: vscode.ExtensionContext) {
    const googleAPIKey = await vscode.window.showInputBox({
      value: this.config.data.googleAPIKey,
      prompt: "Enter the Google API key",
      placeHolder: "e.g., 1111111-2222-3333-4444-555555555555:aa",
    });

    if (googleAPIKey) {
      this.config.update(context, {
        ...this.config.data,
        googleAPIKey,
      });
      Toast.i(`Google API key has been set.`);
    }
  }

  async updateSourceArbPath(context: vscode.ExtensionContext) {
    const sourceArbFilePath = await vscode.window.showInputBox({
      value: this.config.data.sourceArbFilePath,
      prompt: "Enter the path to source arb file(en.arb file recommendation)",
      placeHolder: "e.g., /path/to/en.arb (absolute path)",
      validateInput: (input: string | undefined): string | undefined => {
        if (!input || !fs.existsSync(input)) {
          return "File not found. Please enter a valid path to arb file.";
        } else if (!input.endsWith(".arb")) {
          return "Please select a file with the .arb extension.";
        }
        return undefined;
      },
    });

    if (sourceArbFilePath) {
      this.config.update(context, {
        ...this.config.data,
        sourceArbFilePath,
      });
      Toast.i(`en.arb path updated to ${sourceArbFilePath}`);
    }
  }

  configure(context: vscode.ExtensionContext) {
    this._configure.run(context);
  }

  async translate(context: vscode.ExtensionContext) {
    try {
      await this._translate.run(context);
    } catch (e: any) {
      Logger.e(e);
      if (e instanceof ConfigurationRequiredException) {
        Toast.e("Please select the languages you would like to translate.");
        this.configure(context);
        return;
      }

      if (e instanceof SourceArbRequiredException) {
        Toast.e("Please select translation source data.");
        this.updateSourceArbPath(context);
        return;
      }

      if (e instanceof APIKeyRequiredException) {
        Toast.e("A Google Translate API Key is required.");
        this.updateAPIKey(context);
        return;
      }

      if (e instanceof InvalidSourceArbException) {
        Toast.e("Translation source data does not exist.");
        this.updateSourceArbPath(context);
        return;
      }

      if (e instanceof InvalidSourceLangException) {
        Toast.e(
          "Unable to extract language from source ARB file. If you are using a format such as 'intl_en.arb', please add 'intl_' to arbPrefix."
        );
        this.configure(context);
        return;
      }
    }
  }
}
