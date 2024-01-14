export enum Cmd {
  initialize = "arb-translator.initialize",
  translate = "arb-translator.translate",
  excludeTranslation = "arb-translator.excludeTranslation",
  configureTargetLanguageCode = "arb-translator.configureTargetLanguageCode",
  validateTranslation = "arb-translator.validateTranslation",
  decodeAllHtmlEntities = "arb-translator.decodeAllHtmlEntities",
}

export const cmdName: Record<Cmd, string> = {
  [Cmd.initialize]: "Arb Translator : Initialize",
  [Cmd.translate]: "Arb Translator : Translate",
  [Cmd.validateTranslation]: "Arb Translator : Validate Translation",
  [Cmd.excludeTranslation]: "Arb Translator : Exclude Translation",
  [Cmd.configureTargetLanguageCode]:
    "Arb Translator : Configure Target Language Code",
  [Cmd.decodeAllHtmlEntities]: "Arb Translator : Decode All HTML Entities",
};
