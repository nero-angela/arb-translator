import * as vscode from "vscode";
import { Arb } from "../arb/arb";
import { ArbService } from "../arb/arb.service";
import { ConfigService } from "../config/config.service";
import { HistoryChange } from "../history/history";
import { HistoryService } from "../history/history.service";
import { SourceArbFilePathRequiredException } from "../util/exceptions";
import { Toast } from "../util/toast";

interface InitParams {
  arbService: ArbService;
  configService: ConfigService;
  historyService: HistoryService;
}

export class ExcludeTranslation {
  private arbService: ArbService;
  private configService: ConfigService;
  private historyService: HistoryService;

  constructor({ arbService, configService, historyService }: InitParams) {
    this.arbService = arbService;
    this.configService = configService;
    this.historyService = historyService;
  }

  public async run() {
    // check source.arb file path
    const sourceArbFilePath = this.configService.config.sourceArbFilePath;
    if (!sourceArbFilePath) {
      throw new SourceArbFilePathRequiredException();
    }

    // get source arb
    const sourceArb: Arb = await this.arbService.get(sourceArbFilePath);

    // get changed items in source arb file
    const changes: HistoryChange[] = this.historyService.compare(sourceArb);
    if (changes.length === 0) {
      Toast.i("There are no changes");
      return;
    }

    // select changes to exclude from translation
    const items: vscode.QuickPickItem[] = changes.map((change) => {
      return {
        label: change.key,
        description: change.sourceValue.toString(),
        picked: true,
      };
    });
    const selectedItems =
      (await vscode.window.showQuickPick(items, {
        placeHolder: "Select changes to exclude from translation",
        canPickMany: true,
      })) ?? [];
    if (selectedItems.length === 0) {
      return;
    }

    // update history
    const historyData = { ...sourceArb.data };
    for (const selectedItem of selectedItems) {
      const key: string = selectedItem.label;
      const value: string = selectedItem.description!;
      historyData[key] = value;
    }

    this.historyService.update(historyData);
    Toast.i(
      `${selectedItems.length} items excluded from translation completed.`
    );
  }
}
