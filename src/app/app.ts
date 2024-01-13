import * as vscode from "vscode";
import { Cmd } from "./command/cmd";
import { Registry } from "./registry";
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

export interface App {
  name: string;
  commands: Record<Cmd, (context: vscode.ExtensionContext) => void>;
  init: () => any;
  disposed: () => void;
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
    [Cmd.translate]: () => this.registry.translateCmd.run(),
    [Cmd.excludeTranslation]: () => this.registry.excludeTranslationCmd.run(),
    [Cmd.configureTargetLanguageCode]: () =>
      this.registry.selectTargetLanguageCodeCmd.run(),
    [Cmd.validateTranslation]: () => this.registry.validateTranslationCmd.run(),
  };

  public init = async () => {
    // check workspace
    if (!vscode.workspace.workspaceFolders) {
      throw new WorkspaceNotFoundException();
    }

    // initialize
    await this.registry.init();
  };

  public disposed = () => {
    this.registry.disposed();
  };

  public onException = async (e: any) => {
    if (e instanceof ConfigNotFoundException) {
      await vscode.commands.executeCommand(Cmd.initialize);
    } else if (e instanceof ConfigurationRequiredException) {
      Dialog.showTargetLanguageCodeListRequiredDialog();
    } else if (e instanceof APIKeyRequiredException) {
      Dialog.showAPIKeyRequiredDialog();
    } else {
      Toast.e(e.message);
    }
    Logger.e(e);
  };
}
