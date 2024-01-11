export interface ArbValidationData {
  value: string;
  nParams: number;
  nBrackets: number;
}

export interface ArbValidation {
  [key: string]: ArbValidationData;
}
