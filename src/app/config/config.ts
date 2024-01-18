export type LanguageCode = string;
export type ArbFileName = string;
export type ArbFilePath = string;
export type CacheFilePath = string | undefined;
export type GoogleSheetConfig = {
  id: string;
  name: string;
  credentialFilePath: string;
};

export interface Config {
  sourceArbFilePath: ArbFilePath;
  targetLanguageCodeList: LanguageCode[];
  googleAPIKey: string;
  arbFilePrefix?: string;
  customArbFileName?: Record<LanguageCode, ArbFileName>;
  googleSheet?: GoogleSheetConfig;
}

export interface ConfigParams {
  arbFilePrefix?: string;
  customArbFileName?: Record<LanguageCode, ArbFileName>;
  sourceArbFilePath?: ArbFilePath;
  googleAPIKey?: string;
  targetLanguageCodeList?: LanguageCode[];
  googleSheet?: GoogleSheetConfig;
}
