import * as vscode from "vscode";

interface ConfigData {
  arbPrefix: string;
  sourceArbFilePath: string;
  googleAPIKey: string;
  selectedLanguages: Record<string, string>[];
  sourceHistory: {
    sourceLang?: Record<string, string>;
    sourceData?: Record<string, string>;
    selectedLanguages?: Record<string, string>[];
  };
}

export class Config {
  private _initData: ConfigData = {
    arbPrefix: "",
    sourceArbFilePath: "",
    googleAPIKey: "",
    selectedLanguages: [],
    sourceHistory: {},
  };

  private _data: ConfigData;

  get data(): ConfigData {
    return this._data;
  }

  private _key: string;

  constructor(name: string, context: vscode.ExtensionContext) {
    this._key = `${name}.config`;
    this._data = context.workspaceState.get(this._key) ?? this._initData;
  }

  update(context: vscode.ExtensionContext, data: ConfigData) {
    context.workspaceState.update(this._key, data);
    this._data = {
      ...data,
    };
  }

  async reset(context: vscode.ExtensionContext) {
    this.update(context, this._initData);
  }
}
