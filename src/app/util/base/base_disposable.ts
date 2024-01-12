import * as vscode from "vscode";

export abstract class BaseDisposable {
  private disposableList: vscode.Disposable[] = [];

  protected pushDisposable(disposable: vscode.Disposable) {
    this.disposableList.push(disposable);
  }

  public disposed() {
    for (const disposable of this.disposableList) {
      disposable.dispose();
    }
  }
}
