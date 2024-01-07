import { Language } from "../../language/language";
import { APIKeyRequiredException } from "../../util/exceptions";
import { Translation, TranslationType } from "../translation";
import { TranslationRepository } from "../translation.repository";
import { TranslationService } from "../translation.service";

interface InitParams {
  translationRepository: TranslationRepository;
}

export class GoogleTranslationService implements TranslationService {
  private translationRepository: TranslationRepository;

  constructor({ translationRepository }: InitParams) {
    this.translationRepository = translationRepository;
  }

  /**
   *
   * @param apiKey
   * @param queries
   * @param sourceLang
   * @param targetLang
   * @returns Promise<string[] | undefined>
   * @throws TranslationFailureException
   */
  async translate(
    type: TranslationType,
    apiKey: string,
    queries: string[],
    sourceLang: Language,
    targetLang: Language
  ): Promise<Translation> {
    if (!apiKey) {
      throw new APIKeyRequiredException();
    }

    return await this.translationRepository.translate(
      type,
      apiKey,
      queries,
      sourceLang,
      targetLang
    );
  }
}
