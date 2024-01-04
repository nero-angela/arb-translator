import { History } from "./history";
import { HistoryRepository } from "./history.repository";

export class HistoryService {
  private historyRepository: HistoryRepository = new HistoryRepository();

  update(history: History) {
    this.historyRepository.set(history);
  }

  get(): Promise<History> {
    return this.historyRepository.get();
  }
}
