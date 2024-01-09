import { Arb } from "../arb/arb";
import { History, HistoryChange } from "./history";
import { HistoryRepository } from "./history.repository";

interface initParam {
  historyRepository: HistoryRepository;
}

export class HistoryService {
  private historyRepository: HistoryRepository;

  constructor({ historyRepository }: initParam) {
    this.historyRepository = historyRepository;
  }

  /**
   * Returns items that values have changed compared to sourceArb and history
   * @param sourceArb
   * @returns
   */
  public compare(sourceArb: Arb): HistoryChange[] {
    const history: History = this.historyRepository.get();
    const historyDiffList: HistoryChange[] = [];
    for (const key of sourceArb.keys) {
      const sourceValue: string = sourceArb.data[key];
      const historyValue: string | undefined = history.data[key];
      if (historyValue === sourceValue) {
        // not udated
        continue;
      }

      // created & updated
      historyDiffList.push({
        key,
        sourceValue,
        historyValue: historyValue ?? sourceValue,
      });
    }
    return historyDiffList;
  }

  public update(data: Record<string, string>) {
    this.historyRepository.set(data);
  }

  public get(): History {
    return this.historyRepository.get();
  }
}
