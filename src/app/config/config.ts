export type LanguageCode = string;
export type ArbFileName = string;
export type ArbFilePath = string;

export interface Config {
  arbFilePrefix?: string | undefined;
  customArbFileName?: Record<LanguageCode, ArbFileName> | undefined;
  sourceArbFilePath: ArbFilePath;
  googleAPIKey: string;
  targetLanguageCodeList: LanguageCode[];
}
