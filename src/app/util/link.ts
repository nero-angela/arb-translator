import * as vscode from "vscode";
import { Constant } from "./constant";

export function showLink(url: string) {
  vscode.env.openExternal(vscode.Uri.parse(url));
}

export function showHomepage() {
  vscode.env.openExternal(vscode.Uri.parse(Constant.homePage));
}
