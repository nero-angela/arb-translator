import { Arb } from "../arb/arb";
import { ArbService } from "../arb/arb.service";
import { ArbStatisticService } from "../arb_statistic/arb_statistic.service";
import { ConfigService } from "../config/config.service";
import { History } from "../history/history";
import { HistoryService } from "../history/history.service";
import { Language } from "../language/language";
import { LanguageService } from "../language/language.service";
import { TranslationService } from "../translation/translation.service";
import { Toast } from "../util/toast";

interface InitParams {
  arbService: ArbService;
  configService: ConfigService;
  historyService: HistoryService;
  languageService: LanguageService;
  translationService: TranslationService;
  arbStatisticService: ArbStatisticService;
}

export class TranslationPreviewCmd {
  private arbService: ArbService;
  private configService: ConfigService;
  private historyService: HistoryService;
  private languageService: LanguageService;
  private translationService: TranslationService;
  private arbStatisticService: ArbStatisticService;

  constructor({
    arbService,
    configService,
    historyService,
    languageService,
    translationService,
    arbStatisticService,
  }: InitParams) {
    this.arbService = arbService;
    this.configService = configService;
    this.historyService = historyService;
    this.languageService = languageService;
    this.translationService = translationService;
    this.arbStatisticService = arbStatisticService;
  }

  public async run() {
    // load source arb
    const sourceArb: Arb = await this.arbService.getArb(
      this.configService.config.sourceArbFilePath
    );

    // no data in source arb file
    if (sourceArb.keys.length === 0) {
      Toast.i(`There is no data to translate : ${sourceArb.filePath}`);
      return;
    }

    // get history
    const history: History = this.historyService.get();

    // list of languages to be translated
    const targetLanguages: Language[] =
      this.configService.config.targetLanguageCodeList.map((languageCode) => {
        return this.languageService.getLanguageByLanguageCode(languageCode);
      });

    // show translation preview
    await this.arbStatisticService.showTranslationPreview(
      "Translation Preview",
      sourceArb,
      targetLanguages,
      history
    );
  }
}
