import { History } from "./history";
import { HistoryRepository } from "./history.repository";

interface initParam {
  historyRepository: HistoryRepository;
}

export class HistoryService {
  private historyRepository: HistoryRepository;

  constructor({ historyRepository }: initParam) {
    this.historyRepository = historyRepository;
  }

  update(data: Record<string, string>) {
    this.historyRepository.set(data);
  }

  get(): Promise<History> {
    return this.historyRepository.get();
  }
}
