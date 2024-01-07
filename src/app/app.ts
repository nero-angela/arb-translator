import { DependencyInjector } from "./dependency_injector";
import { TranslationType } from "./translation/translation";
import { Constant } from "./util/constant";
import { Logger } from "./util/logger";

export interface App {
  name: string;
  commands: Record<string, () => void>;
}

export class ArbTranslator implements App {
  private di: DependencyInjector;

  public name: string = Constant.appName;

  public commands = {
    translatePaid: () => this.di.translationCmd.run(TranslationType.paid),
    translateFree: () => this.di.translationCmd.run(TranslationType.free),
    createTranslationCache: () => this.di.createTranslationCache.run(),
    overrideSourceArbHistory: () => this.di.overrideSourceArbHistory.run(),
  };

  constructor() {
    Logger.i(`${this.name} initiated.`);
    this.di = new DependencyInjector();
  }
}
