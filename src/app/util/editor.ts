import * as vscode from "vscode";

export enum HighlightType {
  red = "Red",
  green = "Green",
}

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

  public static highlight(
    editor: vscode.TextEditor,
    type: HighlightType,
    line: number
  ): {
    range: vscode.Range;
    decorationType: vscode.TextEditorDecorationType;
  } {
    const decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor:
        type === HighlightType.red
          ? "rgba(255, 0, 0, 0.15)"
          : "rgba(0, 255, 0, 0.15)",
      isWholeLine: true,
    });
    const range = editor.document.lineAt(line).range;
    editor.setDecorations(decorationType, [range]);
    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    return { range, decorationType };
  }

  public static clearHighlight(
    editor: vscode.TextEditor,
    decorationType: vscode.TextEditorDecorationType
  ) {
    editor.setDecorations(decorationType, []);
  }
}
