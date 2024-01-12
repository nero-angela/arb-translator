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
import { InvalidType, ValidationResult } from "./arb_validation";
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
    const generator = this.validationResultGenerator(
      sourceArb,
      targetLanguages
    );
    const generatedValidationResult = await generator.next();
    const validationResult: ValidationResult | undefined =
      generatedValidationResult.value;
    if (!validationResult) {
      return true;
    }

    const targetFileName = path.basename(validationResult.targetArb.filePath);
    switch (validationResult.invalidType) {
      case InvalidType.keyNotFound:
        // Key does not exist
        const keyNotFoundTitle = `${targetFileName} : "${validationResult.key}" key does not exist`;
        Toast.e(keyNotFoundTitle);
        await this.arbValidationRepository.keyRequired(
          sourceArb,
          validationResult.targetArb,
          validationResult.key
        );
        await this.openTranslationWebsite(
          keyNotFoundTitle,
          sourceArb.language,
          validationResult.targetArb.language,
          sourceArb.data[validationResult.key]
        );
        break;
      case InvalidType.invalidParameters || InvalidType.invalidParentheses:
        const invalidTitle = `${targetFileName} : incorrect number of parameters or parentheses.`;

        Toast.e(invalidTitle);
        await this.arbValidationRepository.invalidNumberOfParamsOrParentheses(
          sourceArb,
          validationResult.targetArb,
          validationResult.key,
          validationResult.sourceValidationData
        );
        await this.openTranslationWebsite(
          invalidTitle,
          sourceArb.language,
          validationResult.targetArb.language,
          validationResult.sourceArb.data[validationResult.key]
        );
        break;
    }
    return false;
  }

  private async *validationResultGenerator(
    sourceArb: Arb,
    targetLanguages: Language[]
  ): AsyncGenerator<ValidationResult, undefined, ValidationResult> {
    // get source ParamsValidation
    const sourceValidation =
      this.arbValidationRepository.getParamsValidation(sourceArb);
    const sourceValidationKeys = Object.keys(sourceValidation);
    if (sourceValidationKeys.length === 0) return;

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
          yield <ValidationResult>{
            sourceValidationData: sourceValidation[key],
            invalidType: InvalidType.keyNotFound,
            sourceArb,
            targetArb,
            key,
          };
          continue;
        }

        const isParamsInvalid =
          sourceTotalParams !== targetValidation[key].nParams;
        const isParenthesesInvalid =
          sourceValidation[key].nParentheses !==
          targetValidation[key].nParentheses;
        if (isParamsInvalid || isParenthesesInvalid) {
          // Incorrect number of parameters or Parentheses
          yield <ValidationResult>{
            sourceValidationData: sourceValidation[key],
            invalidType: isParamsInvalid
              ? InvalidType.invalidParameters
              : InvalidType.invalidParentheses,
            sourceArb,
            targetArb,
            key,
          };
          continue;
        }
      }
    }
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
