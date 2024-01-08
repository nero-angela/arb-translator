import { InitializeRequiredException } from "./exceptions";
import { Logger } from "./logger";

export abstract class InitRequired {
  private isInit: boolean = false;
  protected abstract className: string;

  protected abstract init(): void | Promise<void>;

  protected initialized() {
    this.isInit = true;
    Logger.i(`${this.className} initialized.`);
  }

  protected checkInit(): void {
    if (!this.isInit) {
      throw new InitializeRequiredException(this.className);
    }
  }
}
