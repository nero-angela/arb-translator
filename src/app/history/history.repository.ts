import * as fs from "fs";

import { Constant } from "../util/constant";
import { Workspace } from "../util/workspace";
import { History } from "./history";

export class HistoryRepository {
  historyFilePath: string = Workspace.getArbPath("history.json");

  async get(): Promise<History> {
    if (!fs.existsSync(this.historyFilePath)) {
      Workspace.createPath(this.historyFilePath);
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
      const result = await fs.promises.readFile(this.historyFilePath, "utf8");
      const data = JSON.parse(result.trim() === "" ? "{}" : result);
      return {
        data,
        keys: Object.keys(data),
        values: Object.values(data),
      };
    }
  }

  set(data: Record<string, string>) {
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
  }
}
