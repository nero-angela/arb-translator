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
  keyNotFound,
  invalidParameters,
  invalidParentheses,
}

export interface ValidationResult {
  sourceValidationData: ArbValidationData;
  invalidType: InvalidType;
  sourceArb: Arb;
  targetArb: Arb;
  key: string;
}
