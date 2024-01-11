import * as vscode from "vscode";
import { Arb } from "../arb/arb";
import { BaseDisposable } from "../util/base/base_disposable";
import { Editor, HighlightType } from "../util/editor";
import { ArbValidation, ArbValidationData } from "./arb_validation";

export class ArbValidationRepository extends BaseDisposable {
  /**
   * There is no corresponding key in targetArb file
   * @param sourceArb
   * @param targetArb
   * @param key
   * @param isHighlight
   */
  public async keyRequired(sourceArb: Arb, targetArb: Arb, key: string) {
    try {
      // source
      const { editor: sourceEditor, document: sourceDocument } =
        await Editor.open(sourceArb.filePath, vscode.ViewColumn.One);
      const sourceKeyPosition = Editor.search(sourceEditor, key);
      const {
        range: sourceHighlightedRange,
        decorationType: sourceDecorationType,
      } = Editor.highlight(
        sourceEditor,
        HighlightType.green,
        sourceKeyPosition!.line
      );

      // target
      const { editor: targetEditor, document: targetDocument } =
        await Editor.open(targetArb.filePath, vscode.ViewColumn.Two);
      targetEditor.revealRange(
        sourceHighlightedRange,
        vscode.TextEditorRevealType.InCenter
      );

      const removeHighlight = () => {
        Editor.clearHighlight(sourceEditor, sourceDecorationType);
        this.disposed();
      };

      this.pushDisposable(
        vscode.workspace.onDidChangeTextDocument((event) => {
          if (event.document === sourceDocument) {
            removeHighlight();
          } else if (event.document === targetDocument) {
            const isTargetHasKey = Object.keys(
              JSON.parse(event.document.getText())
            ).includes(key);
            if (isTargetHasKey) {
              removeHighlight();
            }
          }
        })
      );
    } catch (e) {
      throw e;
    }
  }

  /**
   * Incorrect number of parameters or brackets
   * @param sourceArb
   * @param targetArb
   * @param key
   * @param sourceArbValidationData
   */
  public async invalidNumberOfParamsOrBrackets(
    sourceArb: Arb,
    targetArb: Arb,
    key: string,
    sourceArbValidationData: ArbValidationData
  ) {
    try {
      // source
      const { editor: sourceEditor, document: sourceDocument } =
        await Editor.open(sourceArb.filePath, vscode.ViewColumn.One);
      const sourceKeyPosition = Editor.search(sourceEditor, key);
      const {
        range: sourceHighlightedRange,
        decorationType: sourceDecorationType,
      } = Editor.highlight(
        sourceEditor,
        HighlightType.green,
        sourceKeyPosition!.line
      );

      // target
      const { editor: targetEditor, document: targetDocument } =
        await Editor.open(targetArb.filePath, vscode.ViewColumn.Two);
      const targetKeyPosition = Editor.search(targetEditor, key);
      if (!targetKeyPosition) {
        return;
      }
      const { decorationType: targetDecorationType } = Editor.highlight(
        targetEditor,
        HighlightType.red,
        targetKeyPosition.line
      );

      // select target value
      const targetValue = targetArb.data[key];
      const targetValueStartIdx = targetDocument.getText().indexOf(targetValue);
      targetEditor.selection = new vscode.Selection(
        targetDocument.positionAt(targetValueStartIdx),
        targetDocument.positionAt(targetValueStartIdx + targetValue.length)
      );

      const removeHighlight = () => {
        Editor.clearHighlight(sourceEditor, sourceDecorationType);
        Editor.clearHighlight(targetEditor, targetDecorationType);
        this.disposed();
      };

      let prevTargetJson: string = "";
      this.pushDisposable(
        vscode.workspace.onDidChangeTextDocument((event) => {
          if (event.document === sourceDocument) {
            removeHighlight();
          } else if (event.document === targetDocument) {
            const targetJson = event.document.getText();
            if (prevTargetJson === targetJson) {
              return;
            }
            prevTargetJson = targetJson;
            const updatedTargetData = JSON.parse(targetJson);
            const isTargetHasKey = Object.keys(updatedTargetData).includes(key);
            if (!isTargetHasKey) {
              removeHighlight();
              return;
            }
            const isParamsValid =
              this.getTotalParams(updatedTargetData[key]) ===
              sourceArbValidationData.nParams;
            const isBracketsValid =
              this.getTotalBrackets(updatedTargetData[key]) ===
              sourceArbValidationData.nBrackets;
            if (isParamsValid && isBracketsValid) {
              removeHighlight();
            }
          }
        })
      );
    } catch (e) {
      throw e;
    }
  }

  private getTotalParams(value: string): number {
    return (value.match(/\{.*?\}/g) || []).length;
  }

  private getTotalBrackets(value: string): number {
    return (value.match(/[(){}[\]]/g) || []).length;
  }

  public getParamsValidation(arb: Arb): ArbValidation {
    const parmsValidation: ArbValidation = {};
    for (const [key, value] of Object.entries(arb.data)) {
      if (key.includes("@")) {
        continue;
      }

      parmsValidation[key] = {
        value,
        nParams: this.getTotalParams(value),
        nBrackets: this.getTotalBrackets(value),
      };
    }
    return parmsValidation;
  }
}
