import { Arb } from "../arb/arb";
import { ArbService } from "../arb/arb.service";
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

    const isValid = await this.arbValidationService.validate(
      sourceArb,
      targetLanguages
    );
    if (isValid) {
      Toast.i("🟢 The translation has been successfully completed.");
    }
  }
}
