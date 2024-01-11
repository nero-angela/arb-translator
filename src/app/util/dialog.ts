import * as vscode from "vscode";
import { Link } from "./link";

export class Dialog {
  public static showTargetLanguageCodeListRequiredDialog() {
    vscode.window
      .showErrorMessage(
        "Please add arbTranslator.config.targetLanguageCodeList to the .vscode/settings.json file. Please refer to the link for the target LanguageCodeList list.",
        "Link"
      )
      .then(async (answer) => {
        if (answer === "Link") {
          Link.showHomePage();
        }
      });
  }
  public static showAPIKeyRequiredDialog() {
    vscode.window
      .showErrorMessage(
        "Please add arbTranslator.config.googleAPIKey to the .vscode/settings.json file. Please refer to the document and proceed with the API setting and API Key issuance process.",
        "Open document"
      )
      .then(async (answer) => {
        if (answer === "Open document") {
          Link.show("https://cloud.google.com/translate/docs/setup");
        }
      });
  }

  public static async showConfirmDialog({
    title,
    confirmText,
    cancelText,
  }: {
    title: string;
    confirmText?: string;
    cancelText?: string;
  }): Promise<boolean> {
    const select = await vscode.window.showQuickPick(
      [{ label: confirmText ?? "Yes" }, { label: cancelText ?? "No" }],
      {
        placeHolder: title,
      }
    );
    return select?.label === (confirmText ?? "Yes");
  }
}
