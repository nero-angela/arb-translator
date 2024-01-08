import * as vscode from "vscode";
import { Cmd } from "./command/cmd";
import { Registry } from "./registry";
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
  private registry: Registry;

  constructor() {
    Logger.i(`${this.name} initiated.`);
    this.registry = new Registry();
  }

  public name: string = Constant.appName;

  public commands = {
    [Cmd.initialize]: () => this.registry.initializeCmd.run(),
    [Cmd.translatePaid]: () =>
      this.registry.translationCmd.run(TranslationType.paid),
    [Cmd.translateFree]: () =>
      this.registry.translationCmd.run(TranslationType.free),
    [Cmd.createTranslationCache]: () =>
      this.registry.createTranslationCache.run(),
    [Cmd.overrideSourceArbHistory]: () =>
      this.registry.overrideSourceArbHistory.run(),
    [Cmd.selectTargetLanguageCode]: () =>
      this.registry.selectTargetLanguageCode.run(),
  };

  public init = async () => {
    // check workspace
    if (!vscode.workspace.workspaceFolders) {
      throw new WorkspaceNotFoundException();
    }

    // initialize
    await this.registry.init();
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
