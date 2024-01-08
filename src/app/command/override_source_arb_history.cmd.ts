import { Arb } from "../arb/arb";
import { ArbService } from "../arb/arb.service";
import { ConfigService } from "../config/config.service";
import { HistoryService } from "../history/history.service";
import { SourceArbFilePathRequiredException } from "../util/exceptions";
import { Toast } from "../util/toast";

interface InitParams {
  arbService: ArbService;
  configService: ConfigService;
  historyService: HistoryService;
}

export class OverrideSourceArbHistory {
  private arbService: ArbService;
  private configService: ConfigService;
  private historyService: HistoryService;

  constructor({ arbService, configService, historyService }: InitParams) {
    this.arbService = arbService;
    this.configService = configService;
    this.historyService = historyService;
  }

  public async run() {
    // check source.arb file path
    const sourceArbFilePath = this.configService.config.sourceArbFilePath;
    if (!sourceArbFilePath) {
      throw new SourceArbFilePathRequiredException();
    }

    // get source arb
    const sourceArb: Arb = await this.arbService.get(sourceArbFilePath);

    // update history
    this.historyService.update(sourceArb.data);
    Toast.i("Source arb history overwriting completed.");
  }
}
