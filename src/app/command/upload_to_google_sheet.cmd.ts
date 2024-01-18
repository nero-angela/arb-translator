import * as vscode from "vscode";
import { ArbService } from "../arb/arb.service";
import { ArbValidationService } from "../arb_validation/arb_validation.service";
import { ConfigService } from "../config/config.service";
import { GoogleAuthService } from "../google_sheet/google_auth.service";
import { GoogleSheetService } from "../google_sheet/google_sheet.service";
import { Language } from "../language/language";
import { LanguageService } from "../language/language.service";
import { Dialog } from "../util/dialog";
import { GoogleSheetConfigRequiredException } from "../util/exceptions";
import { Toast } from "../util/toast";
import { Workspace } from "../util/workspace";
import { Cmd } from "./cmd";

interface InitParams {
  googleSheetService: GoogleSheetService;
  googleAuthService: GoogleAuthService;
  arbValidationService: ArbValidationService;
  languageService: LanguageService;
  configService: ConfigService;
  arbService: ArbService;
}

export class UploadToGoogleSheetCmd {
  private googleSheetService: GoogleSheetService;
  private googleAuthService: GoogleAuthService;
  private arbValidationService: ArbValidationService;
  private languageService: LanguageService;
  private configService: ConfigService;
  private arbService: ArbService;
  constructor({
    googleSheetService,
    googleAuthService,
    arbValidationService,
    languageService,
    configService,
    arbService,
  }: InitParams) {
    this.googleSheetService = googleSheetService;
    this.googleAuthService = googleAuthService;
    this.arbValidationService = arbValidationService;
    this.languageService = languageService;
    this.configService = configService;
    this.arbService = arbService;
  }

  async run() {
    const { sourceArbFilePath, targetLanguageCodeList, googleSheet } =
      this.configService.config;
    const sourceArb = await this.arbService.getArb(sourceArbFilePath);

    if (
      !googleSheet ||
      !googleSheet.id ||
      !googleSheet.name ||
      !googleSheet.credentialFilePath ||
      (googleSheet?.uploadLanguageCodeList?.length ?? 0) === 0
    ) {
      // Select upload language code list
      const uploadLanguageCodeList =
        await this.languageService.selectLanguageCodeList(
          sourceArb.language,
          (languageCode) => {
            return (
              googleSheet?.uploadLanguageCodeList ?? targetLanguageCodeList
            ).includes(languageCode);
          }
        );
      if (!uploadLanguageCodeList) {
        return;
      }

      Workspace.open();
      this.configService.update({
        ...this.configService.config,
        googleSheet: {
          id: googleSheet?.id ?? "",
          name: googleSheet?.name ?? "",
          credentialFilePath: googleSheet?.credentialFilePath ?? "",
          uploadLanguageCodeList,
        },
      });
      if (
        !googleSheet?.id ||
        !googleSheet?.name ||
        !googleSheet?.credentialFilePath ||
        uploadLanguageCodeList.length === 0
      ) {
        throw new GoogleSheetConfigRequiredException();
      }
    }

    // list of languages to be translated
    const targetLanguages: Language[] = targetLanguageCodeList.map(
      (languageCode) => {
        return this.languageService.getLanguageByLanguageCode(languageCode);
      }
    );

    // check validation
    Toast.i("Check validation...");
    const validationResultList =
      await this.arbValidationService.getValidationResultList(
        sourceArb,
        targetLanguages
      );
    if (validationResultList.length > 0) {
      // invalid
      Toast.e("Invalid translation result. Please correct it and try again.");
      return await vscode.commands.executeCommand(Cmd.validateTranslation);
    }

    // get google auth
    const auth = this.googleAuthService.getAuth(googleSheet.credentialFilePath);
    if (!auth) {
      return;
    }

    // show confirm dialog
    const isOverride = await Dialog.showConfirmDialog({
      title:
        "Would you like to upload the content of the ARB file to Google Sheets? Please note that existing values will be deleted.",
      confirmDesc: `Upload to "${googleSheet.name}" sheet.`,
    });
    if (!isOverride) {
      return;
    }

    // get version
    const version = await vscode.window.showInputBox({
      title: "Please enter the version of this translation.",
      placeHolder: "e.g. 1.0.0 (The version is written in the A1 input box.)",
    });

    // ready to upload
    Toast.i(`Ready to upload data...`);
    const data: string[][] = [
      [
        `v${version}` ?? "v1.0.0",
        ...sourceArb.keys.filter((key) => !key.includes("@")),
      ],
      [
        sourceArb.language.name,
        ...sourceArb.keys.reduce<string[]>((values, key) => {
          if (!key.includes("@")) {
            values.push(sourceArb.data[key]);
          }
          return values;
        }, []),
      ],
    ];
    for (const targetLanguage of targetLanguages) {
      const targetFilePath =
        this.languageService.getArbFilePathFromLanguageCode(
          targetLanguage.languageCode
        );
      const targetArb = await this.arbService.getArb(targetFilePath);
      data.push([
        targetLanguage.name,
        ...targetArb.keys.reduce<string[]>((values, key) => {
          if (!key.includes("@")) {
            values.push(targetArb.data[key]);
          }
          return values;
        }, []),
      ]);
    }

    // clear previous data
    await await this.googleSheetService.clear({
      auth,
      sheetId: googleSheet.id,
      range: googleSheet.name,
    });

    // upload
    await this.googleSheetService.insert({
      auth,
      sheetId: googleSheet.id,
      range: googleSheet.name,
      requestBody: {
        majorDimension: "COLUMNS",
        values: data,
      },
    });

    Toast.i(`🟢 Google Sheet upload completed`);
    await vscode.commands.executeCommand(Cmd.openGoogleSheet);
  }
}
