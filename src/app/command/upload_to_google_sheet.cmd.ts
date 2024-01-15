import path from "path";
import { Arb } from "../arb/arb";
import { ArbService } from "../arb/arb.service";
import {
  InvalidType,
  ValidationResult,
} from "../arb_validation/arb_validation";
import { ArbValidationService } from "../arb_validation/arb_validation.service";
import { ConfigService } from "../config/config.service";
import { Language } from "../language/language";
import { LanguageService } from "../language/language.service";
import { Dialog } from "../util/dialog";
import { Toast } from "../util/toast";


interface InitParams {
  arbValidationService: ArbValidationService;
  languageService: LanguageService;
  configService: ConfigService;
  arbService: ArbService;
}

export class UploadToGoogleSheetCmd {
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

  async run() {
    
  }
}