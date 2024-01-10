import * as vscode from "vscode";
import { showHomepage, showLink } from "./link";

export class Dialog {
  public static showTargetLanguageCodeListRequiredDialog() {
    vscode.window
      .showErrorMessage(
        "Please add arbTranslator.config.targetLanguageCodeList to the .vscode/settings.json file. Please refer to the link for the target LanguageCodeList list.",
        "Link"
      )
      .then(async (answer) => {
        if (answer === "Link") {
          showHomepage();
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
          showLink("https://cloud.google.com/translate/docs/setup");
        }
      });
  }
}
