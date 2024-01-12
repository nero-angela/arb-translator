import path from "path";
import * as vscode from "vscode";
import { Arb } from "../arb/arb";
import { ArbService } from "../arb/arb.service";
import { ValidationResult } from "../arb_validation/arb_validation";
import { ArbValidationService } from "../arb_validation/arb_validation.service";
import { ConfigService } from "../config/config.service";
import { Language } from "../language/language";
import { LanguageService } from "../language/language.service";
import { Toast } from "../util/toast";

interface InitParams {
  arbValidationService: ArbValidationService;
  languageService: LanguageService;
  configService: ConfigService;
  arbService: ArbService;
}

export class ValidateTranslationCmd {
  private arbValidationService: ArbValidationService;
  private languageService: LanguageService;
  private configService: ConfigService;
  private arbService: ArbService;
  constructor({
    arbValidationService,
    languageService,
    configService,
    arbService,
  }: InitParams) {
    this.arbValidationService = arbValidationService;
    this.languageService = languageService;
    this.configService = configService;
    this.arbService = arbService;
  }

  public async run() {
    // load source arb
    const sourceArb: Arb = await this.arbService.getArb(
      this.configService.config.sourceArbFilePath
    );

    // list of languages to be translated
    const targetLanguages: Language[] =
      this.configService.config.targetLanguageCodeList.map((languageCode) => {
        return this.languageService.getLanguageByLanguageCode(languageCode);
      });

    const validationResultList =
      await this.arbValidationService.getValidationResultList(
        sourceArb,
        targetLanguages
      );
    if (validationResultList.length === 0) {
      return Toast.i("🟢 The translation has been successfully completed.");
    }

    const validationResult = await this.selectValidationResult(
      validationResultList
    );
    if (!validationResult) return;

    await this.arbValidationService.validate(validationResult);
  }

  private async selectValidationResult(
    validationResultList: ValidationResult[]
  ): Promise<ValidationResult | undefined> {
    const selectItem = await vscode.window.showQuickPick(
      validationResultList.map((validationResult) => {
        const targetFileName = path.basename(
          validationResult.targetArb.filePath
        );
        const label = targetFileName;
        const detail = `${validationResult.invalidType}`;
        const description = validationResult.key;
        return {
          label,
          detail,
          description,
          validationResult,
        };
      }),
      {
        title: "Select the file you want to fix.",
        placeHolder: `Total ${validationResultList.length}`,
      }
    );
    return selectItem?.validationResult ?? undefined;
  }
}
