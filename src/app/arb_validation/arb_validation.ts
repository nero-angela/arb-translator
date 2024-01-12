export interface ArbValidationData {
  value: string;
  nParams: number;
  nParentheses: number;
}

export interface ArbValidation {
  [key: string]: ArbValidationData;
}
