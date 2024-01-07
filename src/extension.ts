import * as vscode from "vscode";
import { App, ArbTranslator } from "./app/app";

export function activate(context: vscode.ExtensionContext) {
  const app: App = new ArbTranslator();

  // register command
  for (const command of Object.keys(app.commands)) {
    const disposable = vscode.commands.registerCommand(
      `${app.name}.${command}`,
      app.commands[command]
    );
    context.subscriptions.push(disposable);
  }
}

export function deactivate() {}
