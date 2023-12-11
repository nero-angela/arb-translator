import * as vscode from "vscode";
import { Command } from "./app/command/command";
import { GoogleTranslator } from "./app/translator/google_translator";
import { Config } from "./app/util/config";
import { Logger } from "./app/util/logger";

export function activate(context: vscode.ExtensionContext) {
  const name = "arb-translator";
  Logger.i(`Init ${name}.`);
  const config = new Config(name, context);
  const translator = new GoogleTranslator();
  const command = new Command(config, translator);

  [
    vscode.commands.registerCommand(`${name}.translate`, () =>
      command.translate(context)
    ),
    vscode.commands.registerCommand(`${name}.updateSourceArbPath`, () =>
      command.updateSourceArbPath(context)
    ),
    vscode.commands.registerCommand(`${name}.updateAPIKey`, () =>
      command.updateAPIKey(context)
    ),
    vscode.commands.registerCommand(`${name}.configure`, () =>
      command.configure(context)
    ),
  ].map((disposable) => context.subscriptions.push(disposable));
}

export function deactivate() {}
