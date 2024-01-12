import * as vscode from "vscode";

export enum HighlightType {
  red = "Red",
  green = "Green",
}

export class Highlight {
  private static decorationList: vscode.TextEditorDecorationType[] = [];

  public static add(
    editor: vscode.TextEditor,
    type: HighlightType,
    line: number
  ): vscode.Range {
    const decoration = vscode.window.createTextEditorDecorationType({
      backgroundColor:
        type === HighlightType.red
          ? "rgba(255, 0, 0, 0.15)"
          : "rgba(0, 255, 0, 0.15)",
      isWholeLine: true,
    });
    this.decorationList.push(decoration);
    const range = editor.document.lineAt(line).range;
    editor.setDecorations(decoration, [range]);
    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    return range;
  }

  public static clear() {
    for (const decoration of this.decorationList) {
      decoration.dispose();
    }
  }
}
