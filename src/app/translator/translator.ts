import { Language } from "../language/language";

export interface Translator {
  // translator name
  name: string;

  // translate
  translate(params: {
    apiKey: string;
    text: string[];
    sourceLang: Language;
    targetLang: Language;
  }): Promise<string[] | undefined>;
}
