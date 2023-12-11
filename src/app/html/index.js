const vscode = acquireVsCodeApi();
const apiKeyId = "google-api-key";
const sourceArbFilePathId = "source-arb-file-path";

/**
 * @param {Record<string, string>} languages
 * @param {string[]} selectedLanguages
 */
function createLanguageCheckboxList(languages, selectedLanguages) {
  const contentDiv = document.querySelector("#language > .content");
  contentDiv.innerHTML = "";

  for (const language of languages) {
    const key = JSON.stringify(language);
    const isChecked =
      selectedLanguages.findIndex((l) => l.arb === language.arb) !== -1;
    const wrapDiv = document.createElement("div");
    wrapDiv.classList.add("wrap");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "language";
    checkbox.value = key;
    checkbox.id = `checkbox-${key}`;
    checkbox.checked = isChecked;
    wrapDiv.appendChild(checkbox);

    const label = document.createElement("label");
    label.textContent = language.name;
    label.htmlFor = `checkbox-${key}`;
    wrapDiv.appendChild(label);

    const lineBreak = document.createElement("br");
    wrapDiv.appendChild(lineBreak);

    contentDiv.appendChild(wrapDiv);
  }
}

function toggleLanguages() {
  const checkboxes = document.querySelectorAll("input[name=language]");
  const anyChecked = Array.from(checkboxes).some(
    (checkbox) => checkbox.checked
  );
  checkboxes.forEach((checkbox) => (checkbox.checked = !anyChecked));
}

function reset() {
  vscode.postMessage({
    command: "reset",
  });
}

function save() {
  const checkedCheckboxes = document.querySelectorAll(
    "input[name=language]:checked"
  );
  const googleAPIKey = document.getElementById(apiKeyId).value;
  const sourceArbFilePath = document.getElementById(sourceArbFilePathId).value;
  const selectedLanguages = Array.from(checkedCheckboxes).map((checkbox) =>
    JSON.parse(checkbox.value)
  );
  // html -> vscode
  vscode.postMessage({
    command: "save",
    languages: selectedLanguages,
    googleAPIKey: googleAPIKey,
    sourceArbFilePath: sourceArbFilePath,
  });
}

function updateInput(inputId, value) {
  document.getElementById(inputId).value = value;
}

// vscode -> html
window.addEventListener("message", (event) => {
  const message = event.data;
  if (message.command === "updateData") {
    const languages = message.data.languages;
    const selectedLanguages = message.data.selectedLanguages;
    const googleAPIKey = message.data.googleAPIKey;
    const sourceArbFilePath = message.data.sourceArbFilePath;
    createLanguageCheckboxList(languages, selectedLanguages);
    updateInput(apiKeyId, googleAPIKey);
    updateInput(sourceArbFilePathId, sourceArbFilePath);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  vscode.postMessage({
    command: "loaded",
  });
});
