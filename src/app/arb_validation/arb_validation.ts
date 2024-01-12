import { Arb } from "../arb/arb";

export interface ArbValidationData {
  value: string;
  nParams: number;
  nParentheses: number;
}

export interface ArbValidation {
  [key: string]: ArbValidationData;
}

export enum InvalidType {
  keyNotFound = "Key does not exist",
  invalidParameters = "Incorrect number of parameters",
  invalidParentheses = "Incorrect number of parentheses",
}

export interface ValidationResult {
  sourceValidationData: ArbValidationData;
  invalidType: InvalidType;
  sourceArb: Arb;
  targetArb: Arb;
  key: string;
}
