import * as vscode from "vscode";
import { Link } from "./link";

export class Dialog {
  public static showTargetLanguageCodeListRequiredDialog() {
    vscode.window
      .showErrorMessage(
        "Please add arbTranslator.config.targetLanguageCodeList to the .vscode/settings.json file. Please refer to the link for the target LanguageCodeList list.",
        "Link"
      )
      .then(async (answer) => {
        if (answer === "Link") {
          Link.showHomePage();
        }
      });
  }
  public static showAPIKeyRequiredDialog() {
    vscode.window
      .showErrorMessage(
        "Please add arbTranslator.config.googleAPIKey to the .vscode/settings.json file. Please refer to the document and proceed with the API setting and API Key issuance process.",
        "Open document"
      )
      .then(async (answer) => {
        if (answer === "Open document") {
          Link.show("https://cloud.google.com/translate/docs/setup");
        }
      });
  }

  public static async showConfirmDialog({
    title,
    confirmText,
    cancelText,
  }: {
    title: string;
    confirmText?: string;
    cancelText?: string;
  }): Promise<boolean> {
    const select = await vscode.window.showQuickPick(
      [{ label: confirmText ?? "Yes" }, { label: cancelText ?? "No" }],
      {
        title,
      }
    );
    return select?.label === (confirmText ?? "Yes");
  }

  public static async showSectionedPicker<T>({
    sectionLabelList,
    dataList,
    itemBuilder,
    title,
    placeHolder,
    canPickMany,
  }: {
    sectionLabelList: SectionLabel[];
    dataList: T[];
    itemBuilder: (data: T) => SectionedPickerItem;
    title?: string;
    placeHolder?: string;
    canPickMany: boolean;
  }): Promise<T[] | undefined> {
    // create section
    const sectionMap: {
      [key: SectionLabel]: PickItem<T>[];
    } = {};
    for (const sectionLabel of sectionLabelList) {
      sectionMap[sectionLabel] = [
        {
          label: sectionLabel,
          kind: vscode.QuickPickItemKind.Separator,
        },
      ];
    }

    // build items
    for (const data of dataList) {
      const result = itemBuilder(data);
      sectionMap[result.section].push({
        ...result.item,
        data,
      });
    }

    // add total to section label
    for (const sectionLabel of sectionLabelList) {
      const section = sectionMap[sectionLabel][0];
      const total = sectionMap[sectionLabel].length - 1;
      section.label = `${section.label} (${total})`;
    }

    // show quick pick
    const selectedItemOrItems = await vscode.window.showQuickPick<any>(
      Object.values(sectionMap).flat(),
      {
        title,
        placeHolder: placeHolder ?? `Total ${dataList.length}`,
        canPickMany: canPickMany,
      }
    );
    if (!selectedItemOrItems) {
      return selectedItemOrItems;
    } else {
      return (canPickMany ? selectedItemOrItems : [selectedItemOrItems]).map(
        (item: PickItem<T>) => item.data
      );
    }
  }
}

type SectionLabel = string;
type SectionedPickerItem = {
  section: SectionLabel;
  item: vscode.QuickPickItem;
};

interface PickItem<T> extends vscode.QuickPickItem {
  data?: T;
}
