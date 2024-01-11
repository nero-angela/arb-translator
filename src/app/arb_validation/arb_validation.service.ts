import * as fs from "fs";
import path from "path";
import { Arb } from "../arb/arb";
import { ArbService } from "../arb/arb.service";
import { Language } from "../language/language";
import { LanguageService } from "../language/language.service";
import { TranslationService } from "../translation/translation.service";
import { Dialog } from "../util/dialog";
import { Link } from "../util/link";
import { Toast } from "../util/toast";
import { ArbValidationRepository } from "./arb_validation.repository";

interface InitParams {
  arbValidationRepository: ArbValidationRepository;
  translationService: TranslationService;
  languageService: LanguageService;
  arbService: ArbService;
}

export class ArbValidationService {
  private arbService: ArbService;
  private languageService: LanguageService;
  private translationService: TranslationService;
  private arbValidationRepository: ArbValidationRepository;
  constructor({
    arbService,
    languageService,
    translationService,
    arbValidationRepository,
  }: InitParams) {
    this.arbService = arbService;
    this.languageService = languageService;
    this.translationService = translationService;
    this.arbValidationRepository = arbValidationRepository;
  }

  public async validate(
    sourceArb: Arb,
    targetLanguages: Language[]
  ): Promise<boolean> {
    // get source ParamsValidation
    const sourceValidation =
      this.arbValidationRepository.getParamsValidation(sourceArb);
    const sourceValidationKeys = Object.keys(sourceValidation);
    if (sourceValidationKeys.length === 0) return true;

    for (const targetLanguage of targetLanguages) {
      if (targetLanguage.languageCode === sourceArb.language.languageCode)
        continue;

      const targetArbFilePath =
        this.languageService.getArbFilePathFromLanguageCode(
          targetLanguage.languageCode
        );
      if (!fs.existsSync(targetArbFilePath)) continue;

      // get targetArb
      const targetArb: Arb = await this.arbService.getArb(targetArbFilePath);
      const targetValidation =
        this.arbValidationRepository.getParamsValidation(targetArb);
      const targetValidationKeys = Object.keys(targetValidation);
      const targetFileName = path.basename(targetArbFilePath);

      for (const key of sourceValidationKeys) {
        const sourceTotalParams = sourceValidation[key].nParams;

        if (!targetValidationKeys.includes(key)) {
          // Key does not exist
          const title = `${targetFileName} : "${key}" key does not exist`;
          Toast.e(title);
          await this.arbValidationRepository.keyRequired(
            sourceArb,
            targetArb,
            key
          );
          await this.openTranslationWebsite(
            title,
            sourceArb.language,
            targetArb.language,
            sourceArb.data[key]
          );
          return false;
        }

        const isParamsInvalid =
          sourceTotalParams !== targetValidation[key].nParams;
        const isBracketsInvalid =
          sourceValidation[key].nBrackets !== targetValidation[key].nBrackets;
        if (isParamsInvalid || isBracketsInvalid) {
          // Incorrect number of parameters or brackets
          const title = `${targetFileName} : incorrect number of parameters or brackets.`;

          Toast.e(title);
          await this.arbValidationRepository.invalidNumberOfParamsOrBrackets(
            sourceArb,
            targetArb,
            key,
            sourceValidation[key]
          );
          await this.openTranslationWebsite(
            title,
            sourceArb.language,
            targetArb.language,
            sourceArb.data[key]
          );
          return false;
        }
      }
    }

    return true;
  }

  private async openTranslationWebsite(
    title: string,
    sourceLanguage: Language,
    targetLanguage: Language,
    text: string
  ) {
    const isShow = await Dialog.showConfirmDialog({
      title: title,
      confirmText: "Open the Google Translate website",
      cancelText: "Cancel",
    });
    if (!isShow) return;

    const url = this.translationService.getTranslateWebsiteUrl(
      sourceLanguage,
      targetLanguage,
      text
    );
    Link.show(url);
  }
}
