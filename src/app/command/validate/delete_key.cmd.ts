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

export class DeleteKeyCmd {
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

    // select a key to delete
    const selection = await vscode.window.showQuickPick(
      sourceArb.keys.map(
        (key) =>
          <vscode.QuickPickItem>{
            label: key,
          }
      ),
      {
        title: "Please select the key to delete.",
        placeHolder: "Please select the key to delete.",
      }
    );
    if (!selection) {
      return;
    }
    const deleteKey = selection.label;

    // get entire arb file
    const arbFilePathList = this.arbService.getArbFiles(sourceArbFilePath);
    for (const arbFilePath of arbFilePathList) {
      const arbFile = await this.arbService.getArb(arbFilePath);
      const keyIndex = arbFile.keys.indexOf(deleteKey);
      if (keyIndex === -1) {
        continue;
      }

      // delete key
      delete arbFile.data[deleteKey];
      this.arbService.upsert(arbFilePath, arbFile.data);
    }

    // delete history key
    const history = this.historyService.get();
    const historyKeyIndex = history.keys.indexOf(deleteKey);
    if (historyKeyIndex !== -1) {
      delete history.data[deleteKey];
      this.historyService.update(history.data);
    }

    Toast.i(`${deleteKey} key deleted.`);
  }
}
