import { InitializeRequiredException } from "../exceptions";

export abstract class BaseInitRequired {
  private isInit: boolean = false;
  protected abstract className: string;

  protected abstract init(): void | Promise<void>;

  protected initialized() {
    this.isInit = true;
  }

  protected checkInit(): void {
    if (!this.isInit) {
      throw new InitializeRequiredException(this.className);
    }
  }
}
