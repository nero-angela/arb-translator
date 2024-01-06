import * as vscode from "vscode";
import { Logger } from "./logger";

export class Toast {
  static i(message: string) {
    Logger.i(message);
    vscode.window.showInformationMessage(message);
  }

  static w(message: string) {
    Logger.w(message);
    vscode.window.showWarningMessage(message);
  }

  static e(message: string, error?: any) {
    Logger.e(message, error);
    vscode.window.showErrorMessage(message);
  }
}
