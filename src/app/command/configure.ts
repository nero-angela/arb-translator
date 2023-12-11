import * as fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { Translator } from "../translator/translator";
import { Config } from "../util/config";
import { Toast } from "../util/toast";

export class Configuration {
  config: Config;
  translator: Translator;

  constructor(config: Config, translator: Translator) {
    this.config = config;
    this.translator = translator;
  }

  run(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
      "languageSelection",
      "Language Selection",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );
    const htmlPath = vscode.Uri.file(
      path.join(context.extensionPath, "html", "index.html")
    ).fsPath;
    const cssPath = panel.webview
      .asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, "html", "style.css"))
      )
      .toString();
    const jsPath = panel.webview
      .asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, "html", "index.js"))
      )
      .toString();
    panel.webview.html = fs
      .readFileSync(htmlPath, "utf8")
      .replace("{{style.css}}", cssPath)
      .replace("{{index.js}}", jsPath);

    // vscode -> html
    const sendData = () => {
      panel.webview.postMessage({
        command: "updateData",
        data: {
          arbPrefix: this.config.data.arbPrefix ?? "",
          sourceArbFilePath: this.config.data.sourceArbFilePath ?? "",
          googleAPIKey: this.config.data.googleAPIKey ?? "",
          languages: this.translator.languages ?? [],
          selectedLanguages: this.config.data.selectedLanguages ?? [],
        },
      });
    };

    // html -> vscode
    panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "reset":
            vscode.window
              .showInformationMessage(
                "Do you want to initialize all values?",
                "Reset",
                "No"
              )
              .then(async (res) => {
                if (res === "Reset") {
                  await this.config.reset(context);
                  sendData();
                  Toast.i("It has been initialized.");
                }
              });
            break;
          case "loaded":
            sendData();
            break;
          case "save":
            this.config.update(context, {
              ...this.config.data,
              arbPrefix: message.arbPrefix,
              googleAPIKey: message.googleAPIKey,
              selectedLanguages: message.languages,
              sourceArbFilePath: message.sourceArbFilePath,
            });
            Toast.i("Saved");
            break;
        }
      },
      undefined,
      context.subscriptions
    );
  }
}
