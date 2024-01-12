export enum Cmd {
  initialize = "arb-translator.initialize",
  translate = "arb-translator.translate",
  translationPreview = "arb-translator.translationPreview",
  excludeTranslation = "arb-translator.excludeTranslation",
  configureTargetLanguageCode = "arb-translator.configureTargetLanguageCode",
  validateTranslation = "arb-translator.validateTranslation",
}

export const cmdName: Record<Cmd, string> = {
  [Cmd.initialize]: "Arb Translator : Initialize",
  [Cmd.translate]: "Arb Translator : Translate",
  [Cmd.translationPreview]: "Arb Translator : Translation Preview",
  [Cmd.validateTranslation]: "Arb Translator : Validate Translation",
  [Cmd.excludeTranslation]: "Arb Translator : Exclude Translation",
  [Cmd.configureTargetLanguageCode]:
    "Arb Translator : Configure Target Language Code",
};
