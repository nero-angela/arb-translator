import * as vscode from "vscode";
import { Logger } from "./logger";

export class Toast {
  static name: string = "arb-translator";

  static i(message: string) {
    Logger.i(message);
    vscode.window.showInformationMessage(`${this.name} : ${message}`);
  }

  static w(message: string) {
    Logger.w(message);
    vscode.window.showWarningMessage(`${this.name} : ${message}`);
  }

  static e(message: string, error?: any) {
    Logger.e(message, error);
    vscode.window.showErrorMessage(`${this.name} : ${message}`);
  }
}
