import * as vscode from "vscode";

export function showLink(url: string) {
  vscode.env.openExternal(vscode.Uri.parse(url));
}

export function showHomepage() {
  vscode.env.openExternal(
    vscode.Uri.parse(
      "https://marketplace.visualstudio.com/items?itemName=DevStory.arb-translator"
    )
  );
}
