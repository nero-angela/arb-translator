import path from "path";
import * as vscode from "vscode";
import { ArbService } from "../arb/arb.service";
import { LanguageCode } from "../config/config";
import { ConfigService } from "../config/config.service";
import { LanguageService } from "../language/language.service";
import { SourceArbFilePathRequiredException } from "../util/exceptions";
import { Toast } from "../util/toast";

export enum TargetLanguageCodeSelectionMethod {
  quickPick = "quickPick",
  arbFiles = "arbFiles",
}

interface InitParams {
  arbService: ArbService;
  configService: ConfigService;
  languageService: LanguageService;
}

export class SelectTargetLanguageCode {
  private arbService: ArbService;
  private configService: ConfigService;
  private languageService: LanguageService;

  constructor({ arbService, configService, languageService }: InitParams) {
    (this.arbService = arbService), (this.configService = configService);
    this.languageService = languageService;
  }

  public async run(method: TargetLanguageCodeSelectionMethod) {
    const config = this.configService.config;

    let selectedTargetLanguageCodeList: LanguageCode[];
    switch (method) {
      case TargetLanguageCodeSelectionMethod.quickPick:
        selectedTargetLanguageCodeList =
          await this.selectTargetLanguageCodeWithQuickPick(
            config.targetLanguageCodeList
          );
        break;
      case TargetLanguageCodeSelectionMethod.arbFiles:
        selectedTargetLanguageCodeList =
          this.selectTargetLanguageCodeWithArbFiles(config.sourceArbFilePath);
        if (selectedTargetLanguageCodeList.length === 0) {
          const sourceArbName = path.basename(config.sourceArbFilePath);
          const arbPath = path.dirname(config.sourceArbFilePath);
          return Toast.i(
            `There are no arb files in path "${arbPath}". (Excluding ${sourceArbName}, which is the source arb file)`
          );
        }
        break;
    }

    // update config
    this.configService.update({
      ...config,
      targetLanguageCodeList: selectedTargetLanguageCodeList,
    });

    Toast.i(
      `targetLanguageCodeList updated (${selectedTargetLanguageCodeList.length} selected)`
    );
  }

  /**
   * Select target language code by quick pick
   * @param selectedTargetLanguageCodeList
   * @returns Promise<LanguageCode>[]
   */
  private async selectTargetLanguageCodeWithQuickPick(
    selectedTargetLanguageCodeList: LanguageCode[]
  ): Promise<LanguageCode[]> {
    // get support languages
    const languages = this.languageService.supportLanguages;

    // select language code to translate
    const selectItems: vscode.QuickPickItem[] = languages.map((language) => {
      const picked = selectedTargetLanguageCodeList.includes(
        language.languageCode
      );
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

    return selectedItems?.map((item) => item.description!) ?? [];
  }

  /**
   * Select target language code with arb files
   * @param sourceArbFilePath
   * @returns LanguageCode[]
   */
  private selectTargetLanguageCodeWithArbFiles(
    sourceArbFilePath: string
  ): LanguageCode[] {
    if (!sourceArbFilePath) {
      throw new SourceArbFilePathRequiredException();
    }

    const arbFiles = this.arbService.getArbFiles(sourceArbFilePath);
    return arbFiles
      .filter((arbFile) => arbFile !== sourceArbFilePath)
      .map((arbFile) => {
        return this.languageService.getLanguageCodeFromArbFilePath(arbFile);
      });
  }
}
