import * as vscode from "vscode";
import { showHomepage, showLink } from "./link";

export class Dialog {
  public static showConfigRequiredDialog(onCreatePressed: () => Promise<void>) {
    vscode.window
      .showInformationMessage(
        "The .vscode/settings.json file contains the default settings required for translation. Would you like to add required settings?",
        "Create"
      )
      .then(async (answer) => {
        if (answer === "Create") {
          onCreatePressed();
        }
      });
  }

  public static showConfigDescriptionDialog() {
    vscode.window
      .showInformationMessage(
        "Please refer to the link for detailed explanation of settings.",
        "Show Link"
      )
      .then(async (answer) => {
        if (answer === "Show Link") {
          showHomepage();
        }
      });
  }

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
        "Please add arbTranslator.config.googleAPIKey to the .vscode/settings.json file. Please refer to the link and proceed with the API setting and API Key issuance process.",
        "Link"
      )
      .then(async (answer) => {
        if (answer === "Link") {
          showLink("https://cloud.google.com/translate/docs/setup");
        }
      });
  }
}
