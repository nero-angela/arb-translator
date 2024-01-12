import { ArbService } from "./arb/arb.service";
import { ArbStatisticService } from "./arb_statistic/arb_statistic.service";
import { ArbValidationRepository } from "./arb_validation/arb_validation.repository";
import { ArbValidationService } from "./arb_validation/arb_validation.service";
import { TranslationCacheDataSource } from "./cache/translation_cache.datasource";
import { TranslationCacheRepository } from "./cache/translation_cache.repository";
import { ConfigureTargetLanguageCodeCmd } from "./command/configure_target_language_code.cmd";
import { CreateTranslationCacheCmd } from "./command/create_translation_cache.cmd";
import { ExcludeTranslationCmd } from "./command/exclude_translation.cmd";
import { InitializeCmd } from "./command/initialize.cmd";
import { TranslateCmd } from "./command/translate.cmd";
import { TranslationPreviewCmd } from "./command/translation_preview.cmd";
import { ValidateTranslationCmd } from "./command/validate_translation.cmd";
import { ConfigRepository } from "./config/config.repository";
import { ConfigService } from "./config/config.service";
import { HistoryRepository } from "./history/history.repository";
import { HistoryService } from "./history/history.service";
import { LanguageService } from "./language/language.service";
import { GoogleTranslationDataSource } from "./translation/google/google_translation.datasource";
import { GoogleTranslationRepository } from "./translation/google/google_translation.repository";
import { GoogleTranslationService } from "./translation/google/google_translation.service";

export class Registry {
  /**
   * DataSource
   */
  private cacheDataSource: TranslationCacheDataSource;
  private translationDataSource: GoogleTranslationDataSource;

  /**
   * Repository
   */
  private translationCacheRepository: TranslationCacheRepository;
  private translationRepository: GoogleTranslationRepository;
  private arbValidationRepository: ArbValidationRepository;
  private historyRepository: HistoryRepository;
  private configRepository: ConfigRepository;

  /**
   * Service
   */
  private historyService: HistoryService;
  private configService: ConfigService;
  private languageService: LanguageService;
  private arbService: ArbService;
  private translationService: GoogleTranslationService;
  private arbStatisticService: ArbStatisticService;
  private arbValidationService: ArbValidationService;

  /**
   * Command
   */
  public initializeCmd: InitializeCmd;
  public translateCmd: TranslateCmd;
  public translationPreviewCmd: TranslationPreviewCmd;
  public createTranslationCacheCmd: CreateTranslationCacheCmd;
  public excludeTranslationCmd: ExcludeTranslationCmd;
  public selectTargetLanguageCodeCmd: ConfigureTargetLanguageCodeCmd;
  public validateTranslationCmd: ValidateTranslationCmd;

  constructor() {
    // data source
    this.cacheDataSource = new TranslationCacheDataSource();
    this.translationDataSource = new GoogleTranslationDataSource();

    // repository
    this.translationCacheRepository = new TranslationCacheRepository({
      cacheDataSource: this.cacheDataSource,
    });
    this.translationRepository = new GoogleTranslationRepository({
      translationCacheRepository: this.translationCacheRepository,
      translationDataSource: this.translationDataSource,
    });
    this.arbValidationRepository = new ArbValidationRepository();
    this.historyRepository = new HistoryRepository();
    this.configRepository = new ConfigRepository();

    // service
    this.historyService = new HistoryService({
      historyRepository: this.historyRepository,
    });
    this.configService = new ConfigService({
      configRepository: this.configRepository,
    });
    this.languageService = new LanguageService({
      configService: this.configService,
    });
    this.arbService = new ArbService({ languageService: this.languageService });
    this.translationService = new GoogleTranslationService({
      translationCacheRepository: this.translationCacheRepository,
      translationRepository: this.translationRepository,
    });
    this.arbStatisticService = new ArbStatisticService({
      translationCacheRepository: this.translationCacheRepository,
      languageService: this.languageService,
      arbService: this.arbService,
    });
    this.arbValidationService = new ArbValidationService({
      arbService: this.arbService,
      languageService: this.languageService,
      translationService: this.translationService,
      arbValidationRepository: this.arbValidationRepository,
    });

    // cmd
    this.initializeCmd = new InitializeCmd({
      configService: this.configService,
      arbService: this.arbService,
    });
    this.translateCmd = new TranslateCmd({
      arbService: this.arbService,
      configService: this.configService,
      historyService: this.historyService,
      languageService: this.languageService,
      translationService: this.translationService,
      arbStatisticService: this.arbStatisticService,
    });
    this.translationPreviewCmd = new TranslationPreviewCmd({
      arbService: this.arbService,
      configService: this.configService,
      historyService: this.historyService,
      languageService: this.languageService,
      arbStatisticService: this.arbStatisticService,
    });
    this.createTranslationCacheCmd = new CreateTranslationCacheCmd({
      arbService: this.arbService,
      configService: this.configService,
      translationCacheRepository: this.translationCacheRepository,
    });
    this.excludeTranslationCmd = new ExcludeTranslationCmd({
      arbService: this.arbService,
      configService: this.configService,
      historyService: this.historyService,
    });
    this.selectTargetLanguageCodeCmd = new ConfigureTargetLanguageCodeCmd({
      arbService: this.arbService,
      configService: this.configService,
      languageService: this.languageService,
    });
    this.validateTranslationCmd = new ValidateTranslationCmd({
      arbValidationService: this.arbValidationService,
      languageService: this.languageService,
      configService: this.configService,
      arbService: this.arbService,
    });
  }

  public init(): Promise<void[]> {
    return Promise.all([
      this.configRepository.init(),
      this.historyRepository.init(),
      this.cacheDataSource.init(),
    ]);
  }

  public disposed() {
    this.arbValidationRepository.disposed();
  }
}
