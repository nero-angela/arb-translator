import * as vscode from "vscode";
import { ConfigService } from "../config/config.service";
import { LanguageService } from "../language/language.service";
import { Toast } from "../util/toast";

interface InitParams {
  configService: ConfigService;
  languageService: LanguageService;
}

export class SelectTargetLanguageCode {
  private configService: ConfigService;
  private languageService: LanguageService;

  constructor({ languageService, configService }: InitParams) {
    this.configService = configService;
    this.languageService = languageService;
  }

  public async run() {
    // get target language code list
    const config = this.configService.config;
    const targetLanguageCodeList = config.targetLanguageCodeList;

    // get support languages
    const languages = this.languageService.supportLanguages;

    // select language code to translate
    const selectItems: vscode.QuickPickItem[] = languages.map((language) => {
      const picked = targetLanguageCodeList.includes(language.languageCode);
      return {
        label: language.name,
        description: language.languageCode,
        picked,
      };
    });

    const selectedItems = await vscode.window.showQuickPick(selectItems, {
      placeHolder: `Please select the language code of the language you wish to translate`,
      canPickMany: true,
    });

    if (!selectedItems) {
      return;
    }

    // update config
    this.configService.update({
      ...config,
      targetLanguageCodeList: selectedItems.map((item) => item.description!),
    });

    Toast.i(
      `targetLanguageCodeList updated (${selectedItems.length} selected)`
    );
  }
}
