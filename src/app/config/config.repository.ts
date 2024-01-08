import * as vscode from "vscode";
import { InitRequired } from "../util/init_required";
import { Config } from "./config";
import { Logger } from "../util/logger";

export class ConfigRepository extends InitRequired {
  public className: string = "ConfigRepository";

  // Create new every time because of cache
  private get _workspace() {
    return vscode.workspace.getConfiguration("arbTranslator");
  }

  private _key: string = "config";

  private defaultConfig: Config = {
    sourceArbFilePath: "",
    googleAPIKey: "",
    targetLanguageCodeList: [],
  };
  private config: Config = this.defaultConfig;

  public init(): void {
    this.config = this._workspace.get<Config>(this._key) ?? this.defaultConfig;
    super.initialized();
  }

  public get(): Config {
    super.checkInit();
    return this.config;
  }

  public set(value: Config): Thenable<void> {
    super.checkInit();
    this.config = { ...value };
    return this._workspace.update(this._key, this.config);
  }
}
