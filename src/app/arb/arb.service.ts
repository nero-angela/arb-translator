import { Language } from "../language/language";
import { LanguageService } from "../language/language.service";
import { Arb } from "./arb";
import { ArbRepository } from "./arb.repository";

interface InitParams {
  languageService: LanguageService;
}

export class ArbService {
  private arbRepository: ArbRepository = new ArbRepository();
  private languageService: LanguageService;

  constructor({ languageService }: InitParams) {
    this.languageService = languageService;
  }

  /**
   * Return all files in the same folder as source arb file
   * @param sourceArbFilePath
   * @returns
   * @throws FileNotFoundException
   */
  public getArbFiles(sourceArbFilePath: string): string[] {
    return this.arbRepository.getArbFileList(sourceArbFilePath);
  }

  /**
   * Get arb from arbFilePath.
   * @param arbFilePath
   * @returns Promise<Arb>
   * @throws FileNotFoundException
   */
  public async get(arbFilePath: string): Promise<Arb> {
    const language =
      this.languageService.getLanguageFromArbFilePath(arbFilePath);
    const data = await this.arbRepository.read(arbFilePath);
    return {
      filePath: arbFilePath,
      language: language,
      data: data,
      keys: Object.keys(data),
      values: Object.values(data),
    };
  }

  /**
   * If the arb file does not exist, create it and then update it.
   * @param arb
   */
  public async upsert(filePath: string, data: Record<string, string>) {
    this.arbRepository.upsert(filePath, data);
  }

  public createIfNotExist(arbFilePath: string, language: Language) {
    this.arbRepository.createIfNotExist(arbFilePath, language);
  }
}
