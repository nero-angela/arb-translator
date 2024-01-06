import * as vscode from "vscode";
import { ArbService } from "./app/arb/arb.service";
import { CacheService } from "./app/cache/cache.service";
import { ConfigService } from "./app/config/config.service";
import { HistoryService } from "./app/history/history.service";
import { LanguageService } from "./app/language/language.service";
import { TranslateCmd } from "./app/translator/translate.cmd";
import { Logger } from "./app/util/logger";

export function activate(context: vscode.ExtensionContext) {
  const name = "arb-translator";
  Logger.i(`Init ${name}.`);
  const cacheService = new CacheService();
  const historyService = new HistoryService();
  const configService = new ConfigService();
  const languageService = new LanguageService(configService);
  const arbService = new ArbService(languageService);
  const translateCmd = new TranslateCmd(
    arbService,
    cacheService,
    configService,
    historyService,
    languageService
  );

  const disposable = vscode.commands.registerCommand(`${name}.translate`, () =>
    translateCmd.run()
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
