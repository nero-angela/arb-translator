import path from "path";
import * as vscode from "vscode";

export class Workspace {
  public static getPath(...paths: string[]) {
    const workspacePath = vscode.workspace.workspaceFolders![0].uri.path;
    return path.join(workspacePath, ".vscode", ...paths);
  }
  
  public static getArbPath(...paths: string[]) {
    const workspacePath = vscode.workspace.workspaceFolders![0].uri.path;
    return path.join(workspacePath, ".vscode", "arb", ...paths);
  }
}
