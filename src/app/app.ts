import path from "path";
import * as vscode from "vscode";
import { TargetLanguageCodeSelectionMethod } from "./command/select_target_language_code.cmd";
import { DependencyInjector } from "./dependency_injector";
import { TranslationType } from "./translation/translation";
import { Constant } from "./util/constant";
import { Dialog } from "./util/dialog";
import {
  APIKeyRequiredException,
  ConfigNotFoundException,
  ConfigurationRequiredException,
  MessageException,
} from "./util/exceptions";
import { Logger } from "./util/logger";
import { Toast } from "./util/toast";

export interface App {
  name: string;
  commands: Record<string, () => void>;
  exceptionHandler: (e: any) => void;
}

export class ArbTranslator implements App {
  private di: DependencyInjector;

  constructor() {
    Logger.i(`${this.name} initiated.`);
    this.di = new DependencyInjector();
  }

  public name: string = Constant.appName;

  public commands = {
    translatePaid: () => this.di.translationCmd.run(TranslationType.paid),
    translateFree: () => this.di.translationCmd.run(TranslationType.free),
    createTranslationCache: () => this.di.createTranslationCache.run(),
    overrideSourceArbHistory: () => this.di.overrideSourceArbHistory.run(),
    selectTargetLanguageCode: () =>
      this.di.selectTargetLanguageCode.run(
        TargetLanguageCodeSelectionMethod.quickPick
      ),
    selectTargetLanguageCodeWithArbFiles: () =>
      this.di.selectTargetLanguageCode.run(
        TargetLanguageCodeSelectionMethod.arbFiles
      ),
  };

  public exceptionHandler = (e: any) => {
    Logger.e(e);
    if (e instanceof ConfigNotFoundException) {
      Dialog.showConfigRequiredDialog(async () => {
        await this.di.configService.addRequiredParams();
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
    } else if (e instanceof ConfigurationRequiredException) {
      Dialog.showTargetLanguageCodeListRequiredDialog();
    } else if (e instanceof APIKeyRequiredException) {
      Dialog.showAPIKeyRequiredDialog();
    } else if (e instanceof MessageException) {
      Toast.e(e.message);
    } else {
      Toast.e(e);
    }
  };
}
