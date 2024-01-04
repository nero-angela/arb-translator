import * as vscode from "vscode";
import { Config } from "./config";

export class ConfigRepository {
  // Create new every time because of cache
  private get _workspace() {
    return vscode.workspace.getConfiguration("arbTranslator");
  }
  private _key: string = "config";
  emptyConfig: Config = {
    arbFilePrefix: "",
    sourceArbFilePath: "",
    googleAPIKey: "",
    targetLanguageCodeList: [],
  };

  get(): Config | undefined {
    return this._workspace.get(this._key);
  }

  set(value: Config): Thenable<void> {
    return this._workspace.update(this._key, value);
  }
}
