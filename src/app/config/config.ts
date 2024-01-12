export type LanguageCode = string;
export type ArbFileName = string;
export type ArbFilePath = string;
export type CacheFilePath = string | undefined;

export interface Config {
  arbFilePrefix?: string | undefined;
  customArbFileName?: Record<LanguageCode, ArbFileName> | undefined;
  sourceArbFilePath: ArbFilePath;
  googleAPIKey: string;
  targetLanguageCodeList: LanguageCode[];
}
export interface ConfigParams {
  arbFilePrefix?: string;
  customArbFileName?: Record<LanguageCode, ArbFileName>;
  sourceArbFilePath?: ArbFilePath;
  googleAPIKey?: string;
  targetLanguageCodeList?: LanguageCode[];
}
