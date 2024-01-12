import * as vscode from "vscode";
import { Constant } from "./constant";

export class Link {
  static show(url: string) {
    vscode.env.openExternal(vscode.Uri.parse(url));
  }

  static showHomePage() {
    vscode.env.openExternal(vscode.Uri.parse(Constant.homePage));
  }
}

