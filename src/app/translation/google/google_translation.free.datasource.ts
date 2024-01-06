import axios from "axios";
import { Language } from "../../language/language";
import { TranslationFailureException } from "../../util/exceptions";
import { TranslationDataSource } from "../translation.datasource";

export class GoogleTranslationFreeDataSource implements TranslationDataSource {
  /**
   * Free Google Translator (about 100 per hour)
   * Translation results may be worse than Paid API.
   * @param apiKey
   * @param query
   * @param sourceLang
   * @param targetLang
   * @returns
   * @throws TranslationFailureException
   */
  public async translate(
    apiKey: string,
    query: string,
    sourceLang: Language,
    targetLang: Language
  ): Promise<string> {
    const response = await axios.get(
      encodeURI(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang.gt}&tl=${targetLang.gt}&dt=t&dt=bd&dj=1&source=icon&hl=${targetLang.gt}&q=${query}`
      )
    );
    if (response.status === 429) {
      throw new TranslationFailureException(
        "You have used up all of your free translation usage. (approximately 100 per hour)"
      );
    }
    if ("sentences" in response.data) {
      let result: string = "";
      for (const sentence of response.data.sentences) {
        result += sentence.trans;
      }
      return result;
    } else {
      return response.data.dict[0].terms[0];
    }
  }
}
