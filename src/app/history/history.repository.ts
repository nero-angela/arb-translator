import * as fs from "fs";

import { Constant } from "../util/constant";
import { InitRequired } from "../util/init_required";
import { Workspace } from "../util/workspace";
import { History } from "./history";

export class HistoryRepository extends InitRequired {
  protected className: string = "HistoryRepository";

  private defaultHistory: History = {
    data: {},
    keys: [],
    values: [],
  };
  private history: History = this.defaultHistory;

  public async init(): Promise<void> {
    if (!fs.existsSync(this.historyFilePath)) {
      Workspace.createPath(this.historyFilePath);
      fs.writeFileSync(
        this.historyFilePath,
        JSON.stringify({}, null, 2),
        "utf-8"
      );
    } else {
      const jsonString = await fs.promises.readFile(
        this.historyFilePath,
        "utf8"
      );
      const result = JSON.parse(jsonString.trim() === "" ? "{}" : jsonString);
      const data = result.data;
      this.history = {
        data,
        keys: Object.keys(data),
        values: Object.values(data),
      };
    }
    super.initialized();
  }

  private historyFilePath: string = Workspace.getArbPath("history.json");

  public get(): History {
    super.checkInit();
    return this.history;
  }

  public set(data: Record<string, string>) {
    super.checkInit();
    fs.writeFileSync(
      this.historyFilePath,
      JSON.stringify(
        {
          description: `This file is for tracking changes to the source arb file in the ArbTranslator extension. (${Constant.homePage})`,
          data,
        },
        null,
        2
      ),
      "utf8"
    );

    this.history = {
      data,
      keys: Object.keys(data),
      values: Object.values(data),
    };
  }
}
