import path from "path";
import * as vscode from "vscode";
import { ArbService } from "../arb/arb.service";
import { LanguageCode } from "../config/config";
import { ConfigService } from "../config/config.service";
import { Language } from "../language/language";
import { LanguageService } from "../language/language.service";
import { Toast } from "../util/toast";

enum Action {
  select = "Select",
  load = "Load",
}

interface InitParams {
  arbService: ArbService;
  configService: ConfigService;
  languageService: LanguageService;
}

export class ConfigureTargetLanguageCodeCmd {
  private arbService: ArbService;
  private configService: ConfigService;
  private languageService: LanguageService;

  constructor({ arbService, configService, languageService }: InitParams) {
    (this.arbService = arbService), (this.configService = configService);
    this.languageService = languageService;
  }

  public async run() {
    const config = this.configService.config;
    const sourceArb = await this.arbService.getArb(config.sourceArbFilePath);

    // select action
    const action: Action | undefined = await this.selectAction();
    if (!action) return;

    let newLanguageCodeList: LanguageCode[] | undefined;
    switch (action) {
      case Action.select:
        newLanguageCodeList = await this.selectLanguageCode(sourceArb.language);
        if (!newLanguageCodeList) {
          return;
        }
        break;
      case Action.load:
        newLanguageCodeList = await this.loadLanguageCode(sourceArb.filePath);
        if (newLanguageCodeList.length === 0) {
          const directory = path.dirname(sourceArb.filePath);
          Toast.i(
            `There are no arb files except sourceArb in the ${directory}`
          );
          return;
        }
        break;
    }

    // update config
    this.configService.update({
      ...config,
      targetLanguageCodeList: newLanguageCodeList,
    });

    Toast.i(
      `targetLanguageCodeList updated (${newLanguageCodeList.length} selected)`
    );
  }

  /**
   * Select action
   */
  private async selectAction(): Promise<Action | undefined> {
    const select = await vscode.window.showQuickPick(
      [
        {
          label: "Select directly from language list.",
          action: Action.select.toString(),
        },
        {
          label: "Load languages from arb files.",
          action: Action.load.toString(),
        },
      ],
      {
        title: "Please select a list of language to translate to.",
      }
    );
    if (!select) return undefined;
    return <Action>select.action;
  }

  /**
   * Select language code
   * @param sourceArbLanguage
   */
  private async selectLanguageCode(
    sourceArbLanguage: Language
  ): Promise<LanguageCode[] | undefined> {
    const currentLanguageCodeList =
      this.configService.config.targetLanguageCodeList;
    const supportLanguageList: Language[] =
      this.getSupportLanguageList(sourceArbLanguage);

    // pick items
    const pickItems: vscode.QuickPickItem[] = supportLanguageList.map(
      (language) => {
        const picked = currentLanguageCodeList.includes(language.languageCode);
        return {
          label: language.name,
          description: language.languageCode,
          picked,
        };
      }
    );

    // select pick items
    const selectedItems = await vscode.window.showQuickPick(pickItems, {
      title: `Please select the language code of the language you wish to translate`,
      canPickMany: true,
    });

    return selectedItems?.map((item) => item.description!);
  }

  /**
   * Get list of supported language codes excluding languageCode of source arb
   * @param sourceArbLanguage
   * @param selectedTargetLanguageCodeList
   */
  private getSupportLanguageList(sourceArbLanguage: Language): Language[] {
    return this.languageService.supportLanguages.reduce<Language[]>(
      (prev, curr) => {
        if (curr !== sourceArbLanguage) {
          prev.push(curr);
        }
        return prev;
      },
      []
    );
  }

  /**
   * Get list of language codes from arb files
   * @param sourceArbFilePath
   */
  private async loadLanguageCode(
    sourceArbFilePath: string
  ): Promise<LanguageCode[]> {
    const arbFiles = this.arbService.getArbFiles(sourceArbFilePath);
    return arbFiles.reduce<LanguageCode[]>((result, arbFile) => {
      if (arbFile !== sourceArbFilePath) {
        const languageCode =
          this.languageService.getLanguageCodeFromArbFilePath(arbFile);
        result.push(languageCode);
      }
      return result;
    }, []);
  }
}
