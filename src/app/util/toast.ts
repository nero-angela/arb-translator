import * as vscode from "vscode";

export class Toast {
  static name: string = "arb-translator";

  static i(message: string) {
    console.info(message);
    vscode.window.showInformationMessage(`${this.name} : ${message}`);
  }

  static w(message: string) {
    console.warn(message);
    vscode.window.showWarningMessage(`${this.name} : ${message}`);
  }

  static e(message: string, error?: any) {
    console.error(message, error);
    vscode.window.showErrorMessage(`${this.name} : ${message}`);
  }
}
