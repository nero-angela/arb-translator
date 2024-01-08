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

  public update(data: Record<string, string>) {
    this.historyRepository.set(data);
  }

  public get(): History {
    return this.historyRepository.get();
  }
}
