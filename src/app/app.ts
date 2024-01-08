import * as vscode from "vscode";
import { Cmd } from "./command/cmd";
import { DependencyInjector } from "./dependency_injector";
import { TranslationType } from "./translation/translation";
import { Constant } from "./util/constant";
import { Dialog } from "./util/dialog";
import {
  APIKeyRequiredException,
  ConfigNotFoundException,
  ConfigurationRequiredException,
  WorkspaceNotFoundException,
} from "./util/exceptions";
import { Logger } from "./util/logger";
import { Toast } from "./util/toast";
import { Workspace } from "./util/workspace";

export interface App {
  name: string;
  commands: Record<Cmd, () => void>;
  init: () => any;
  onException: (e: any) => void;
}

export class ArbTranslator implements App {
  private di: DependencyInjector;

  constructor() {
    Logger.i(`${this.name} initiated.`);
    this.di = new DependencyInjector();
  }

  public name: string = Constant.appName;

  public commands = {
    [Cmd.initialize]: () => this.di.initializeCmd.run(),
    [Cmd.translatePaid]: () => this.di.translationCmd.run(TranslationType.paid),
    [Cmd.translateFree]: () => this.di.translationCmd.run(TranslationType.free),
    [Cmd.createTranslationCache]: () => this.di.createTranslationCache.run(),
    [Cmd.overrideSourceArbHistory]: () =>
      this.di.overrideSourceArbHistory.run(),
    [Cmd.selectTargetLanguageCode]: () =>
      this.di.selectTargetLanguageCode.run(),
  };

  public init = async () => {
    // check workspace
    if (!vscode.workspace.workspaceFolders) {
      throw new WorkspaceNotFoundException();
    }

    // initialize
    await this.di.init();
  };

  public onException = (e: any) => {
    Logger.e(e);
    if (e instanceof ConfigNotFoundException) {
      Dialog.showConfigRequiredDialog(async () => {
        Workspace.open();
        Dialog.showConfigDescriptionDialog();
      });
    } else if (e instanceof ConfigurationRequiredException) {
      Dialog.showTargetLanguageCodeListRequiredDialog();
    } else if (e instanceof APIKeyRequiredException) {
      Dialog.showAPIKeyRequiredDialog();
    } else {
      Toast.e(e.message);
    }
  };
}
