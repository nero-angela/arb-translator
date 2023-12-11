const vscode = acquireVsCodeApi();
const arbPrefixId = "arb-prefix";
const apiKeyId = "google-api-key";
const sourceArbFilePathId = "source-arb-file-path";
let state = {};

function onArbFilePrefixInputChanged() {
  state = { ...state, arbPrefix: document.getElementById(arbPrefixId).value };
  init();
}

/**
 * @param {Record<string, string>} languages
 * @param {string[]} selectedLanguages
 */
function createLanguageCheckboxList(prefix, languages, selectedLanguages) {
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
    const span = document.createElement("span");
    span.textContent = language.name;
    span.style.width = "200px";
    span.style.display = "inline-block";
    label.appendChild(span);
    label.appendChild(document.createTextNode(`${prefix + language.arb}`));
    // label.textContent = `${language.name} (${language.arb})`;
    label.htmlFor = `checkbox-${key}`;
    4;
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
  const arbPrefix = document.getElementById(arbPrefixId).value;
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
    arbPrefix: arbPrefix,
  });
}

function updateInput(inputId, value) {
  document.getElementById(inputId).value = value;
}

function init() {
  const languages = state.languages;
  const arbPrefix = state.arbPrefix;
  const selectedLanguages = state.selectedLanguages;
  const googleAPIKey = state.googleAPIKey;
  const sourceArbFilePath = state.sourceArbFilePath;
  createLanguageCheckboxList(arbPrefix, languages, selectedLanguages);
  updateInput(arbPrefixId, arbPrefix);
  updateInput(apiKeyId, googleAPIKey);
  updateInput(sourceArbFilePathId, sourceArbFilePath);
}

// vscode -> html
window.addEventListener("message", (event) => {
  const message = event.data;
  if (message.command === "updateData") {
    state = message.data;
    init();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  vscode.postMessage({
    command: "loaded",
  });
});
