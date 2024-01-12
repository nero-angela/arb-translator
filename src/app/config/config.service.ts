import { Toast } from "../util/toast";
import { Config, ConfigParams } from "./config";
import { ConfigRepository } from "./config.repository";

interface InitParams {
  configRepository: ConfigRepository;
}

export class ConfigService {
  private configRepository: ConfigRepository;

  constructor({ configRepository }: InitParams) {
    this.configRepository = configRepository;
  }

  get config(): Config {
    return this.configRepository.get();
  }

  async update({
    arbFilePrefix,
    customArbFileName,
    sourceArbFilePath,
    googleAPIKey,
    targetLanguageCodeList,
  }: ConfigParams): Promise<boolean> {
    try {
      await this.configRepository.set({
        arbFilePrefix,
        customArbFileName,
        sourceArbFilePath,
        googleAPIKey,
        targetLanguageCodeList,
      });
      return true;
    } catch (e) {
      Toast.e("Failed to update configure", e);
      return false;
    }
  }
}
