import { Toast } from "../util/toast";
import { Config } from "./config";
import { ConfigRepository } from "./config.repository";

export class ConfigService {
  private configRepository: ConfigRepository = new ConfigRepository();

  get config(): Config {
    return this.configRepository.get() ?? this.configRepository.emptyConfig;
  }

  async update(data: Config): Promise<boolean> {
    try {
      await this.configRepository.set(data);
      return true;
    } catch (e) {
      Toast.e("Failed to update configure", e);
      return false;
    }
  }

  addRequiredParams(): Thenable<void> {
    const config = this.config;
    return this.configRepository.set({
      sourceArbFilePath: config.sourceArbFilePath ?? "",
      googleAPIKey: config.googleAPIKey ?? "",
      targetLanguageCodeList: config.targetLanguageCodeList ?? [],
    });
  }
}
