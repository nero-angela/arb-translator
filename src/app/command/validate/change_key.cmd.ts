import * as vscode from "vscode";
import { Arb } from "../../arb/arb";
import { ArbService } from "../../arb/arb.service";
import { ConfigService } from "../../config/config.service";
import { HistoryService } from "../../history/history.service";
import { Toast } from "../../util/toast";

interface InitParams {
  configService: ConfigService;
  arbService: ArbService;
  historyService: HistoryService;
}

export class ChangeKeyCmd {
  private historyService: HistoryService;
  private configService: ConfigService;
  private arbService: ArbService;
  constructor({ configService, arbService, historyService }: InitParams) {
    this.historyService = historyService;
    this.configService = configService;
    this.arbService = arbService;
  }

  async run() {
    // load source arb
    const { sourceArbFilePath } = this.configService.config;
    const sourceArb: Arb = await this.arbService.getArb(sourceArbFilePath);

    // select a key to change
    const selection = await vscode.window.showQuickPick(
      sourceArb.keys.map(
        (key) =>
          <vscode.QuickPickItem>{
            label: key,
          }
      ),
      {
        title: "Please select the key to change.",
        placeHolder: "Please select the key to change.",
      }
    );
    if (!selection) {
      return;
    }
    const oldKey = selection.label;

    // enter the key to change
    const newKey = await vscode.window.showInputBox({
      prompt: "Please enter the key to change.",
    });
    if (!newKey) {
      return;
    }

    // check validation
    if (/^[\d\s]|[^a-zA-Z0-9]/.test(newKey)) {
      Toast.e("The key is invalid.");
      return;
    }

    // check duplication
    if (sourceArb.keys.includes(newKey)) {
      Toast.e(`"${newKey}" already exists.`);
      return;
    }

    // get entire arb file
    const arbFilePathList = this.arbService.getArbFiles(sourceArbFilePath);
    for (const arbFilePath of arbFilePathList) {
      const arbFile = await this.arbService.getArb(arbFilePath);
      const keyIndex = arbFile.keys.indexOf(oldKey);
      if (keyIndex === -1) {
        continue;
      }

      // replace key
      arbFile.keys[keyIndex] = newKey;
      const data = arbFile.keys.reduce<Record<string, string>>(
        (prev, key, index) => {
          prev[key] = arbFile.values[index];
          return prev;
        },
        {}
      );
      this.arbService.upsert(arbFilePath, data);
    }

    // update history key
    const history = this.historyService.get();
    const historyKeyIndex = history.keys.indexOf(oldKey);
    if (historyKeyIndex !== -1) {
      history.keys[historyKeyIndex] = newKey;
      const historyData = history.keys.reduce<Record<string, string>>(
        (prev, key, index) => {
          prev[key] = history.values[index];
          return prev;
        },
        {}
      );
      this.historyService.update(historyData);
    }

    Toast.i(`Changed ${oldKey} to ${newKey} completed.`);
  }
}
