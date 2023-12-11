import axios from "axios";
import { Toast } from "../util/toast";
import { Translator } from "./translator";

export class GoogleTranslator implements Translator {
  // google supported languages
  languages: Record<string, string>[] = [
    { query: "af", name: "Afrikaans", arb: "af" },
    { query: "sq", name: "Albanian", arb: "sq" },
    { query: "am", name: "Amharic", arb: "am" },
    { query: "ar", name: "Arabic", arb: "ar" },
    { query: "hy", name: "Armenian", arb: "hy" },
    { query: "as", name: "Assamese", arb: "as" },
    { query: "ay", name: "Aymara", arb: "ay" },
    { query: "az", name: "Azerbaijani", arb: "az" },
    { query: "bm", name: "Bambara", arb: "bm" },
    { query: "eu", name: "Basque", arb: "eu" },
    { query: "be", name: "Belarusian", arb: "be" },
    { query: "bn", name: "Bengali", arb: "bn" },
    { query: "bho", name: "Bhojpuri", arb: "bho" },
    { query: "bs", name: "Bosnian", arb: "bs" },
    { query: "bg", name: "Bulgarian", arb: "bg" },
    { query: "ca", name: "Catalan", arb: "ca" },
    { query: "ceb", name: "Cebuano", arb: "ceb" },
    { query: "zh-CN", name: "Chinese (Simplified)", arb: "zh_CN" },
    { query: "zh-TW", name: "Chinese (Traditional)", arb: "zh_TW" },
    { query: "co", name: "Corsican", arb: "co" },
    { query: "hr", name: "Croatian", arb: "hr" },
    { query: "cs", name: "Czech", arb: "cs" },
    { query: "da", name: "Danish", arb: "da" },
    { query: "dv", name: "Dhivehi", arb: "dv" },
    { query: "doi", name: "Dogri", arb: "doi" },
    { query: "nl", name: "Dutch", arb: "nl" },
    { query: "en", name: "English", arb: "en" },
    { query: "eo", name: "Esperanto", arb: "eo" },
    { query: "et", name: "Estonian", arb: "et" },
    { query: "ee", name: "Ewe", arb: "ee" },
    { query: "fil", name: "Filipino (Tagalog)", arb: "fil" },
    { query: "fi", name: "Finnish", arb: "fi" },
    { query: "fr", name: "French", arb: "fr" },
    { query: "fy", name: "Frisian", arb: "fy" },
    { query: "gl", name: "Galician", arb: "gl" },
    { query: "ka", name: "Georgian", arb: "ka" },
    { query: "de", name: "German", arb: "de" },
    { query: "el", name: "Greek", arb: "el" },
    { query: "gn", name: "Guarani", arb: "gn" },
    { query: "gu", name: "Gujarati", arb: "gu" },
    { query: "ht", name: "Haitian Creole", arb: "ht" },
    { query: "ha", name: "Hausa", arb: "ha" },
    { query: "haw", name: "Hawaiian", arb: "haw" },
    { query: "iw", name: "Hebrew", arb: "iw" },
    { query: "hi", name: "Hindi", arb: "hi" },
    { query: "hmn", name: "Hmong", arb: "hmn" },
    { query: "hu", name: "Hungarian", arb: "hu" },
    { query: "is", name: "Icelandic", arb: "is" },
    { query: "ig", name: "Igbo", arb: "ig" },
    { query: "ilo", name: "Ilocano", arb: "ilo" },
    { query: "id", name: "Indonesian", arb: "id" },
    { query: "ga", name: "Irish", arb: "ga" },
    { query: "it", name: "Italian", arb: "it" },
    { query: "ja", name: "Japanese", arb: "ja" },
    { query: "jw", name: "Javanese", arb: "jw" },
    { query: "kn", name: "Kannada", arb: "kn" },
    { query: "kk", name: "Kazakh", arb: "kk" },
    { query: "km", name: "Khmer", arb: "km" },
    { query: "rw", name: "Kinyarwanda", arb: "rw" },
    { query: "gom", name: "Konkani", arb: "gom" },
    { query: "ko", name: "Korean", arb: "ko" },
    { query: "kri", name: "Krio", arb: "kri" },
    { query: "ku", name: "Kurdish", arb: "ku" },
    { query: "ckb", name: "Kurdish (Sorani)", arb: "ckb" },
    { query: "ky", name: "Kyrgyz", arb: "ky" },
    { query: "lo", name: "Lao", arb: "lo" },
    { query: "la", name: "Latin", arb: "la" },
    { query: "lv", name: "Latvian", arb: "lv" },
    { query: "ln", name: "Lingala", arb: "ln" },
    { query: "lt", name: "Lithuanian", arb: "lt" },
    { query: "lg", name: "Luganda", arb: "lg" },
    { query: "lb", name: "Luxembourgish", arb: "lb" },
    { query: "mk", name: "Macedonian", arb: "mk" },
    { query: "mai", name: "Maithili", arb: "mai" },
    { query: "mg", name: "Malagasy", arb: "mg" },
    { query: "ms", name: "Malay", arb: "ms" },
    { query: "ml", name: "Malayalam", arb: "ml" },
    { query: "mt", name: "Maltese", arb: "mt" },
    { query: "mi", name: "Maori", arb: "mi" },
    { query: "mr", name: "Marathi", arb: "mr" },
    { query: "mni-Mtei", name: "Meiteilon (Manipuri)", arb: "mni_Mtei" },
    { query: "lus", name: "Mizo", arb: "lus" },
    { query: "mn", name: "Mongolian", arb: "mn" },
    { query: "my", name: "Myanmar (Burmese)", arb: "my" },
    { query: "ne", name: "Nepali", arb: "ne" },
    { query: "no", name: "Norwegian", arb: "no" },
    { query: "ny", name: "Nyanja (Chichewa)", arb: "ny" },
    { query: "or", name: "Odia (Oriya)", arb: "or" },
    { query: "om", name: "Oromo", arb: "om" },
    { query: "ps", name: "Pashto", arb: "ps" },
    { query: "fa", name: "Persian", arb: "fa" },
    { query: "pl", name: "Polish", arb: "pl" },
    { query: "pt", name: "Portuguese (Portugal, Brazil)", arb: "pt" },
    { query: "pa", name: "Punjabi", arb: "pa" },
    { query: "qu", name: "Quechua", arb: "qu" },
    { query: "ro", name: "Romanian", arb: "ro" },
    { query: "ru", name: "Russian", arb: "ru" },
    { query: "sm", name: "Samoan", arb: "sm" },
    { query: "sa", name: "Sanskrit", arb: "sa" },
    { query: "gd", name: "Scots Gaelic", arb: "gd" },
    { query: "nso", name: "Sepedi", arb: "nso" },
    { query: "sr", name: "Serbian", arb: "sr" },
    { query: "st", name: "Sesotho", arb: "st" },
    { query: "sn", name: "Shona", arb: "sn" },
    { query: "sd", name: "Sindhi", arb: "sd" },
    { query: "si", name: "Sinhala (Sinhalese)", arb: "si" },
    { query: "sk", name: "Slovak", arb: "sk" },
    { query: "sl", name: "Slovenian", arb: "sl" },
    { query: "so", name: "Somali", arb: "so" },
    { query: "es", name: "Spanish", arb: "es" },
    { query: "su", name: "Sundanese", arb: "su" },
    { query: "sw", name: "Swahili", arb: "sw" },
    { query: "sv", name: "Swedish", arb: "sv" },
    { query: "tl", name: "Tagalog (Filipino)", arb: "tl" },
    { query: "tg", name: "Tajik", arb: "tg" },
    { query: "ta", name: "Tamil", arb: "ta" },
    { query: "tt", name: "Tatar", arb: "tt" },
    { query: "te", name: "Telugu", arb: "te" },
    { query: "th", name: "Thai", arb: "th" },
    { query: "ti", name: "Tigrinya", arb: "ti" },
    { query: "ts", name: "Tsonga", arb: "ts" },
    { query: "tr", name: "Turkish", arb: "tr" },
    { query: "tk", name: "Turkmen", arb: "tk" },
    { query: "ak", name: "Twi (Akan)", arb: "ak" },
    { query: "uk", name: "Ukrainian", arb: "uk" },
    { query: "ur", name: "Urdu", arb: "ur" },
    { query: "ug", name: "Uyghur", arb: "ug" },
    { query: "uz", name: "Uzbek", arb: "uz" },
    { query: "vi", name: "Vietnamese", arb: "vi" },
    { query: "cy", name: "Welsh", arb: "cy" },
    { query: "xh", name: "Xhosa", arb: "xh" },
    { query: "yi", name: "Yiddish", arb: "yi" },
    { query: "yo", name: "Yoruba", arb: "yo" },
    { query: "zu", name: "Zulu", arb: "zu" },
  ];

  async translate(p: {
    apiKey: string;
    text: string[];
    sourceLangQuery: string;
    targetLangQuery: string;
  }): Promise<string[] | undefined> {
    if (!p.apiKey) {
      Toast.w("Update API key");
      return;
    }
    console.log(`Total translate request : ${p.text.length}`);
    const result = await Promise.all(
      p.text.map((q) =>
        this._callAPI(p.apiKey, q, p.sourceLangQuery, p.targetLangQuery)
      )
    );
    if (!result) {
      return [];
    } else {
      return result;
    }
  }

  private async _callAPI(
    apiKey: string,
    q: string,
    source: string,
    target: string
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
        // console.log(`${q} -> ${query}`);
        const result = await axios.get(
          `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${query}&target=${target}&source=${source}&alt=json`
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
        // console.log(`${translatedText} -> ${text}`);
        res(text);
      } catch (e: any) {
        console.error("Translate error:", e);
        Toast.e(e.response.data.error.errors[0].message);
        rej(e);
      }
    });
  }
}
