import * as vscode from "vscode";
import { ArbService } from "./app/arb/arb.service";
import { ConfigService } from "./app/config/config.service";
import { HistoryService } from "./app/history/history.service";
import { LanguageService } from "./app/language/language.service";
import { TranslationType } from "./app/translation/translation";
import { TranslationCmd } from "./app/translation/translation.cmd";
import { Logger } from "./app/util/logger";

export function activate(context: vscode.ExtensionContext) {
  const name: string = "arb-translator";
  Logger.i(`Init ${name}.`);
  const historyService = new HistoryService();
  const configService = new ConfigService();
  const languageService = new LanguageService(configService);
  const arbService = new ArbService(languageService);
  const translationCmd = new TranslationCmd(
    arbService,
    configService,
    historyService,
    languageService
  );

  [
    vscode.commands.registerCommand(`${name}.translatePaid`, () =>
      translationCmd.run(TranslationType.paid)
    ),
    vscode.commands.registerCommand(`${name}.translateFree`, () =>
      translationCmd.run(TranslationType.free)
    ),
    vscode.commands.registerCommand(`${name}.createCache`, () =>
      translationCmd.run(TranslationType.free)
    ),
  ].map((disposable) => context.subscriptions.push(disposable));
}

export function deactivate() {}
