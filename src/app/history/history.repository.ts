import * as fs from "fs";
import path from "path";
import * as vscode from "vscode";

import { History } from "./history";

export class HistoryRepository {
  historyFilePath: string;

  constructor() {
    const workspacePath = vscode.workspace.workspaceFolders![0].uri.path;
    this.historyFilePath = path.join(
      workspacePath,
      ".vscode",
      "arb_history.json"
    );
  }

  async get(): Promise<History> {
    if (!fs.existsSync(this.historyFilePath)) {
      fs.writeFileSync(
        this.historyFilePath,
        JSON.stringify({}, null, 2),
        "utf-8"
      );
      return {
        data: {},
        keys: [],
        values: [],
      };
    } else {
      const data = JSON.parse(
        await fs.promises.readFile(this.historyFilePath, "utf8")
      );
      return {
        data,
        keys: Object.keys(data),
        values: Object.values(data),
      };
    }
  }

  set(history: History) {
    fs.writeFileSync(
      this.historyFilePath,
      JSON.stringify(history, null, 2),
      "utf8"
    );
  }
}
