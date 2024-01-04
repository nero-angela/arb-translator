import * as vscode from "vscode";
import { ConfigService } from "./app/config/config.service";
import { HistoryService } from "./app/history/history.service";
import { LanguageService } from "./app/language/language.service";
import { TranslateCmd } from "./app/translator/translate.cmd";
import { Logger } from "./app/util/logger";
import { ArbService } from "./app/arb/arb.service";

export function activate(context: vscode.ExtensionContext) {
  const name = "arb-translator";
  Logger.i(`Init ${name}.`);
  // service
  const historyService = new HistoryService();
  const configService = new ConfigService();
  const languageService = new LanguageService(configService);
  const arbService = new ArbService(languageService);
  const translateCmd = new TranslateCmd(
    configService,
    historyService,
    languageService,
    arbService,
  );

  const disposable = vscode.commands.registerCommand(`${name}.translate`, () =>
    translateCmd.run()
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
