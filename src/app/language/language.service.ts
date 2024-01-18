import path from "path";
import * as vscode from "vscode";
import { ArbFilePath, LanguageCode } from "../config/config";
import { ConfigService } from "../config/config.service";
import {
  InvalidArbFileNameException,
  InvalidLanguageCodeException,
  SourceArbFilePathRequiredException,
} from "../util/exceptions";
import { CustomArbFileName, Language } from "./language";

interface InitParams {
  configService: ConfigService;
}

export class LanguageService {
  constructor({ configService }: InitParams) {
    this.configService = configService;
  }

  private configService: ConfigService;

  private get customArbFileName(): CustomArbFileName {
    const customArbFileName = this.configService.config.customArbFileName ?? {};
    return {
      data: customArbFileName,
      languageCodeList: Object.keys(customArbFileName),
      arbFileNameList: Object.values(customArbFileName),
    };
  }

  public supportLanguages: Language[] = [
    { gt: "af", name: "Afrikaans", languageCode: "af" },
    { gt: "sq", name: "Albanian", languageCode: "sq" },
    { gt: "am", name: "Amharic", languageCode: "am" },
    { gt: "ar", name: "Arabic", languageCode: "ar" },
    { gt: "hy", name: "Armenian", languageCode: "hy" },
    { gt: "as", name: "Assamese", languageCode: "as" },
    { gt: "ay", name: "Aymara", languageCode: "ay" },
    { gt: "az", name: "Azerbaijani", languageCode: "az" },
    { gt: "bm", name: "Bambara", languageCode: "bm" },
    { gt: "eu", name: "Basque", languageCode: "eu" },
    { gt: "be", name: "Belarusian", languageCode: "be" },
    { gt: "bn", name: "Bengali", languageCode: "bn" },
    { gt: "bho", name: "Bhojpuri", languageCode: "bho" },
    { gt: "bs", name: "Bosnian", languageCode: "bs" },
    { gt: "bg", name: "Bulgarian", languageCode: "bg" },
    { gt: "ca", name: "Catalan", languageCode: "ca" },
    { gt: "ceb", name: "Cebuano", languageCode: "ceb" },
    { gt: "zh-CN", name: "Chinese Simplified", languageCode: "zh_CN" },
    { gt: "zh-TW", name: "Chinese Traditional", languageCode: "zh_TW" },
    { gt: "co", name: "Corsican", languageCode: "co" },
    { gt: "hr", name: "Croatian", languageCode: "hr" },
    { gt: "cs", name: "Czech", languageCode: "cs" },
    { gt: "da", name: "Danish", languageCode: "da" },
    { gt: "dv", name: "Dhivehi", languageCode: "dv" },
    { gt: "doi", name: "Dogri", languageCode: "doi" },
    { gt: "nl", name: "Dutch", languageCode: "nl" },
    { gt: "en", name: "English", languageCode: "en" },
    { gt: "eo", name: "Esperanto", languageCode: "eo" },
    { gt: "et", name: "Estonian", languageCode: "et" },
    { gt: "ee", name: "Ewe", languageCode: "ee" },
    { gt: "fi", name: "Finnish", languageCode: "fi" },
    { gt: "fr", name: "French", languageCode: "fr" },
    { gt: "fy", name: "Frisian", languageCode: "fy" },
    { gt: "gl", name: "Galician", languageCode: "gl" },
    { gt: "ka", name: "Georgian", languageCode: "ka" },
    { gt: "de", name: "German", languageCode: "de" },
    { gt: "el", name: "Greek", languageCode: "el" },
    { gt: "gn", name: "Guarani", languageCode: "gn" },
    { gt: "gu", name: "Gujarati", languageCode: "gu" },
    { gt: "ht", name: "Haitian Creole", languageCode: "ht" },
    { gt: "ha", name: "Hausa", languageCode: "ha" },
    { gt: "haw", name: "Hawaiian", languageCode: "haw" },
    { gt: "iw", name: "Hebrew", languageCode: "he" },
    { gt: "hi", name: "Hindi", languageCode: "hi" },
    { gt: "hmn", name: "Hmong", languageCode: "hmn" },
    { gt: "hu", name: "Hungarian", languageCode: "hu" },
    { gt: "is", name: "Icelandic", languageCode: "is" },
    { gt: "ig", name: "Igbo", languageCode: "ig" },
    { gt: "ilo", name: "Ilocano", languageCode: "ilo" },
    { gt: "id", name: "Indonesian", languageCode: "id" },
    { gt: "ga", name: "Irish", languageCode: "ga" },
    { gt: "it", name: "Italian", languageCode: "it" },
    { gt: "ja", name: "Japanese", languageCode: "ja" },
    { gt: "jw", name: "Javanese", languageCode: "jw" },
    { gt: "kn", name: "Kannada", languageCode: "kn" },
    { gt: "kk", name: "Kazakh", languageCode: "kk" },
    { gt: "km", name: "Khmer", languageCode: "km" },
    { gt: "rw", name: "Kinyarwanda", languageCode: "rw" },
    { gt: "gom", name: "Konkani", languageCode: "gom" },
    { gt: "ko", name: "Korean", languageCode: "ko" },
    { gt: "kri", name: "Krio", languageCode: "kri" },
    { gt: "ku", name: "Kurdish", languageCode: "ku" },
    { gt: "ckb", name: "Kurdish", languageCode: "ckb" },
    { gt: "ky", name: "Kyrgyz", languageCode: "ky" },
    { gt: "lo", name: "Lao", languageCode: "lo" },
    { gt: "la", name: "Latin", languageCode: "la" },
    { gt: "lv", name: "Latvian", languageCode: "lv" },
    { gt: "ln", name: "Lingala", languageCode: "ln" },
    { gt: "lt", name: "Lithuanian", languageCode: "lt" },
    { gt: "lg", name: "Luganda", languageCode: "lg" },
    { gt: "lb", name: "Luxembourgish", languageCode: "lb" },
    { gt: "mk", name: "Macedonian", languageCode: "mk" },
    { gt: "mai", name: "Maithili", languageCode: "mai" },
    { gt: "mg", name: "Malagasy", languageCode: "mg" },
    { gt: "ms", name: "Malay", languageCode: "ms" },
    { gt: "ml", name: "Malayalam", languageCode: "ml" },
    { gt: "mt", name: "Maltese", languageCode: "mt" },
    { gt: "mi", name: "Maori", languageCode: "mi" },
    { gt: "mr", name: "Marathi", languageCode: "mr" },
    { gt: "mni-Mtei", name: "Meiteilon", languageCode: "mni" },
    { gt: "lus", name: "Mizo", languageCode: "lus" },
    { gt: "mn", name: "Mongolian", languageCode: "mn" },
    { gt: "my", name: "Myanmar", languageCode: "my" },
    { gt: "ne", name: "Nepali", languageCode: "ne" },
    { gt: "no", name: "Norwegian", languageCode: "no" },
    { gt: "ny", name: "Nyanja", languageCode: "ny" },
    { gt: "or", name: "Odia", languageCode: "or" },
    { gt: "om", name: "Oromo", languageCode: "om" },
    { gt: "ps", name: "Pashto", languageCode: "ps" },
    { gt: "fa", name: "Persian", languageCode: "fa" },
    { gt: "pl", name: "Polish", languageCode: "pl" },
    { gt: "pt", name: "Portuguese", languageCode: "pt" },
    { gt: "pa", name: "Punjabi", languageCode: "pa" },
    { gt: "qu", name: "Quechua", languageCode: "qu" },
    { gt: "ro", name: "Romanian", languageCode: "ro" },
    { gt: "ru", name: "Russian", languageCode: "ru" },
    { gt: "sm", name: "Samoan", languageCode: "sm" },
    { gt: "sa", name: "Sanskrit", languageCode: "sa" },
    { gt: "gd", name: "Scots Gaelic", languageCode: "gd" },
    { gt: "nso", name: "Sepedi", languageCode: "nso" },
    { gt: "sr", name: "Serbian", languageCode: "sr" },
    { gt: "st", name: "Sesotho", languageCode: "st" },
    { gt: "sn", name: "Shona", languageCode: "sn" },
    { gt: "sd", name: "Sindhi", languageCode: "sd" },
    { gt: "si", name: "Sinhala", languageCode: "si" },
    { gt: "sk", name: "Slovak", languageCode: "sk" },
    { gt: "sl", name: "Slovenian", languageCode: "sl" },
    { gt: "so", name: "Somali", languageCode: "so" },
    { gt: "es", name: "Spanish", languageCode: "es" },
    { gt: "su", name: "Sundanese", languageCode: "su" },
    { gt: "sw", name: "Swahili", languageCode: "sw" },
    { gt: "sv", name: "Swedish", languageCode: "sv" },
    { gt: "tl", name: "Tagalog", languageCode: "tl" },
    { gt: "tg", name: "Tajik", languageCode: "tg" },
    { gt: "ta", name: "Tamil", languageCode: "ta" },
    { gt: "tt", name: "Tatar", languageCode: "tt" },
    { gt: "te", name: "Telugu", languageCode: "te" },
    { gt: "th", name: "Thai", languageCode: "th" },
    { gt: "ti", name: "Tigrinya", languageCode: "ti" },
    { gt: "ts", name: "Tsonga", languageCode: "ts" },
    { gt: "tr", name: "Turkish", languageCode: "tr" },
    { gt: "tk", name: "Turkmen", languageCode: "tk" },
    { gt: "ak", name: "Twi", languageCode: "ak" },
    { gt: "uk", name: "Ukrainian", languageCode: "uk" },
    { gt: "ur", name: "Urdu", languageCode: "ur" },
    { gt: "ug", name: "Uyghur", languageCode: "ug" },
    { gt: "uz", name: "Uzbek", languageCode: "uz" },
    { gt: "vi", name: "Vietnamese", languageCode: "vi" },
    { gt: "cy", name: "Welsh", languageCode: "cy" },
    { gt: "xh", name: "Xhosa", languageCode: "xh" },
    { gt: "yi", name: "Yiddish", languageCode: "yi" },
    { gt: "yo", name: "Yoruba", languageCode: "yo" },
    { gt: "zu", name: "Zulu", languageCode: "zu" },
  ];

  /**
   * check whether the language code is supported or not
   * @param languageCode
   * @throws InvalidLanguageCodeException
   */
  private checkIsSupportLanguageCode(languageCode: LanguageCode) {
    const language = this.supportLanguages.find(
      (language) => language.languageCode === languageCode
    );
    if (!language) {
      throw new InvalidLanguageCodeException(languageCode);
    }
  }

  /**
   * arbFilePath -> LanguageCode -> Language
   * @param arbFilePath
   * @returns Language
   * @throws InvalidLanguageCodeException, InvalidArbFileNameException
   */
  public getLanguageFromArbFilePath(arbFilePath: string): Language {
    const languageCode = this.getLanguageCodeFromArbFilePath(arbFilePath);
    return this.getLanguageByLanguageCode(languageCode);
  }

  /**
   * LanguageCode -> Language
   * @param languageCode
   * @returns Language
   * @throws InvalidLanguageCodeException
   */
  getLanguageByLanguageCode(languageCode: string): Language {
    const language = this.supportLanguages.find(
      (sl) => sl.languageCode === languageCode
    );
    if (!language) {
      throw new InvalidLanguageCodeException(languageCode);
    }
    return language;
  }

  /**
   * arbFilePath -> LanguageCode
   * @param arbFilePath
   * @returns LanguageCode
   * @throws InvalidArbFileNameException
   */
  public getLanguageCodeFromArbFilePath(arbFilePath: string): LanguageCode {
    const config = this.configService.config;
    const fileName = arbFilePath.split("/").pop()!.split(".arb")[0];
    let languageCode: string;

    // customArbFileName -> LanguageCode
    const customArbFileName = this.customArbFileName;
    const index = customArbFileName.arbFileNameList.indexOf(fileName);
    if (index !== -1) {
      languageCode = customArbFileName.languageCodeList[index];
      return languageCode;
    }

    // arbFilePath -> LanguageCode
    try {
      const fileName = arbFilePath.split("/").pop()!.split(".arb")[0];
      languageCode = config.arbFilePrefix
        ? fileName?.split(config.arbFilePrefix)[1]!
        : fileName;

      this.checkIsSupportLanguageCode(languageCode);
      return languageCode;
    } catch (e: any) {
      throw new InvalidArbFileNameException(arbFilePath);
    }
  }

  /**
   * LanguageCode -> arbFilePath
   * @param languageCode
   * @returns ArbFilePath
   * @throws SourceArbFilePathRequiredException, InvalidLanguageCodeException
   */
  public getArbFilePathFromLanguageCode(languageCode: string): ArbFilePath {
    const config = this.configService.config;
    const ext = ".arb";
    if (!config.sourceArbFilePath) {
      throw new SourceArbFilePathRequiredException();
    }
    const arbFolderPath: string = (config.sourceArbFilePath.match(/(.*\/)/) ?? [
      "",
    ])[0];
    // languageCode -> customArbFileName
    const customArbFileName = this.customArbFileName;
    const index = customArbFileName.languageCodeList.indexOf(languageCode);
    if (index !== -1) {
      const arbFileName = customArbFileName.arbFileNameList[index];
      const arbFilePath = path.join(
        arbFolderPath,
        arbFileName + (arbFileName.endsWith(ext) ? "" : ext)
      );
      return arbFilePath;
    }

    // languageCode -> defaultArbFileName
    const language = this.getLanguageByLanguageCode(languageCode);
    const prefix = config.arbFilePrefix ?? "";
    const arbFilePath = path.join(
      arbFolderPath,
      `${prefix + language.languageCode + ext}`
    );
    return arbFilePath;
  }

  /**
   * Select language code list except source arb language code
   * @param sourceArbLanguage
   * @returns selected language code list
   */
  public async selectLanguageCodeList(
    sourceArbLanguage: Language,
    picked: (languageCode: LanguageCode) => boolean
  ): Promise<LanguageCode[] | undefined> {
    const currentLanguageCodeList =
      this.configService.config.targetLanguageCodeList;
    const supportLanguageList: Language[] = this.supportLanguages.reduce<
      Language[]
    >((prev, curr) => {
      if (curr !== sourceArbLanguage) {
        prev.push(curr);
      }
      return prev;
    }, []);

    // pick items
    const pickItems: vscode.QuickPickItem[] = supportLanguageList.map(
      (language) => {
        return {
          label: language.name,
          description: language.languageCode,
          picked: picked(language.languageCode),
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
   * Get file name from LanguageCode
   * @param languageCode
   */
  public getFileNameFromLanguageCode(languageCode: LanguageCode): string {
    const arbFilePath = this.getArbFilePathFromLanguageCode(languageCode);
    return path.basename(arbFilePath);
  }
}
