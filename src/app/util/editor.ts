import * as vscode from "vscode";

export class Editor {
  public static async open(
    filePath: string,
    column?: vscode.ViewColumn,
    preserveFocus?: boolean
  ): Promise<{ editor: vscode.TextEditor; document: vscode.TextDocument }> {
    const document = await vscode.workspace.openTextDocument(filePath);
    const editor = await vscode.window.showTextDocument(
      document,
      column,
      preserveFocus
    );
    return {
      editor,
      document,
    };
  }

  public static search(
    editor: vscode.TextEditor,
    searchText: string
  ): vscode.Position | undefined {
    const startPos = editor.document.getText().indexOf(searchText);
    if (startPos !== -1) {
      return editor.document.positionAt(startPos);
    } else {
      return undefined;
    }
  }
}
