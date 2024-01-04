import axios from "axios";
import { Language } from "../language/language";
import { hasHtmlTags } from "../util/html";
import { Logger } from "../util/logger";
import { Toast } from "../util/toast";
import { Translator } from "./translator";

export class GoogleTranslator implements Translator {
  name: string = "Google Translator";

  async translate(p: {
    apiKey: string;
    text: string[];
    sourceLang: Language;
    targetLang: Language;
  }): Promise<string[] | undefined> {
    if (!p.apiKey) {
      Toast.w("Update API key");
      return;
    }
    Logger.l(`Total translate request : ${p.text.length}`);
    try {
      const result = await Promise.all(
        p.text.map((q) =>
          this._callAPI(p.apiKey, q, p.sourceLang, p.targetLang)
        )
      );
      return result;
    } catch (error: any) {
      Logger.e("Translate error:", error.e);
      Toast.e(`${error.e}\n${error.q}`);
      return [];
    }
  }

  private async _callAPI(
    apiKey: string,
    q: string,
    sourceLang: Language,
    targetLang: Language
  ): Promise<string> {
    return new Promise(async (res, rej) => {
      try {
        // replace {params}
        let count = 0;
        const keys = [
          "0️⃣",
          "1️⃣",
          "2️⃣",
          "3️⃣",
          "4️⃣",
          "5️⃣",
          "6️⃣",
          "7️⃣",
          "8️⃣",
          "9️⃣",
          "🔟",
        ];
        const dictionary: Record<string, string> = {};
        const query = q.replace(/\{(.+?)\}/g, (_, match) => {
          const replacement = keys[count];
          dictionary[replacement] = `{${match}}`;
          count++;
          return replacement;
        });
        // Logger.l(`${q} -> ${query}`);
        const format = hasHtmlTags(query) ? "html" : "text";
        const result = await axios.get(
          encodeURI(
            `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${query}&target=${targetLang.gt}&source=${sourceLang.gt}&alt=json&format=${format}`
          )
        );
        let translatedText: string =
          result.data.data.translations[0].translatedText;
        let text: string = translatedText;
        // restore {params}
        const dictKeys = Object.keys(dictionary);
        for (const i in dictKeys) {
          const key = dictKeys[i];
          text = text.replace(key, (match) => {
            return dictionary[match] || match;
          });
        }
        // replace &#39; to '
        text.replaceAll("&#39;", "'");

        // Logger.l(`${translatedText} -> ${text}`);
        res(text);
      } catch (e: any) {
        rej({ e, q });
      }
    });
  }
}
