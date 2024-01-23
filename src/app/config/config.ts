export type LanguageCode = string;
export type ArbFileName = string;
export type ArbFilePath = string;
export type CacheFilePath = string | undefined;
export type GoogleSheetConfig = {
  id: string;
  name: string;
  credentialFilePath: string;
  uploadLanguageCodeList: LanguageCode[];
};

export interface Config {
  sourceArbFilePath: ArbFilePath;
  targetLanguageCodeList: LanguageCode[];
  googleAPIKey: string;
  arbFilePrefix?: string;
  customArbFileName?: Record<LanguageCode, ArbFileName>;
  googleSheet?: GoogleSheetConfig;
  validateLanguageCodeList?: LanguageCode[];
}

export interface ConfigParams {
  arbFilePrefix?: string;
  customArbFileName?: Record<LanguageCode, ArbFileName>;
  sourceArbFilePath?: ArbFilePath;
  googleAPIKey?: string;
  targetLanguageCodeList?: LanguageCode[];
  googleSheet?: GoogleSheetConfig;
  validateLanguageCodeList?: LanguageCode[];
}
