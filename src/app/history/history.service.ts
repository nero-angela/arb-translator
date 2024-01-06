import { History } from "./history";
import { HistoryRepository } from "./history.repository";

export class HistoryService {
  private historyRepository: HistoryRepository = new HistoryRepository();

  update(data: Record<string, string>) {
    this.historyRepository.set(data);
  }

  get(): Promise<History> {
    return this.historyRepository.get();
  }
}
