import axios from "axios";
import { Language } from "../../language/language";
import { hasHtmlTags } from "../../util/html";
import { TranslationDataSource } from "../translation.datasource";

export class GoogleTranslationChargeDataSource
  implements TranslationDataSource
{
  /**
   * Google Translator v2 (Google API Key required)
   * please refer to the [link](https://cloud.google.com/translate/docs/setup) and proceed with the API setting and API Key issuance process.
   * @param apiKey
   * @param query
   * @param sourceLang
   * @param targetLang
   * @returns
   */
  public async translate(
    apiKey: string,
    query: string,
    sourceLang: Language,
    targetLang: Language
  ): Promise<string> {
    const format = hasHtmlTags(query) ? "html" : "text";
    const response = await axios.get(
      encodeURI(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${query}&target=${targetLang.gt}&source=${sourceLang.gt}&alt=json&format=${format}`
      )
    );
    return response.data.data.translations[0].translatedText;
  }
}
