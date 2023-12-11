export interface Translator {

  // support languages
  languages: Record<string, string>[];

  // translate
  translate(params: {
    apiKey: string;
    text: string[];
    sourceLangQuery: string;
    targetLangQuery: string;
  }): Promise<string[] | undefined>;
}
