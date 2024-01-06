export interface Translation {
  data: string[];
  nAPICall: number;
  nCache: number;
}

export enum TranslationType {
  paid = "paid",
  free = "free",
}
