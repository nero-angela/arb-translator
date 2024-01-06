export class TranslateStatistic {
  public nReuse: number;
  public nCache: number;
  public nAPICall: number;

  constructor(nReuse?: number, nCache?: number, nAPICall?: number) {
    this.nReuse = nReuse ?? 0;
    this.nCache = nCache ?? 0;
    this.nAPICall = nAPICall ?? 0;
  }

  public get log(): string {
    return `nAPICall : ${this.nAPICall}, nCache: ${this.nCache}, nReuse : ${this.nReuse}`;
  }

  public sum(other: TranslateStatistic): TranslateStatistic {
    return new TranslateStatistic(
      this.nReuse + other.nReuse,
      this.nCache + other.nCache,
      this.nAPICall + other.nAPICall
    );
  }
}
