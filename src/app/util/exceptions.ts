export class ConfigurationRequiredException extends Error {}

export class SourceArbFilePathRequiredException extends Error {}

export class FileNotFoundException extends Error {
  message: string;
  constructor(message: string) {
    super();
    this.message = message;
  }
}

export class InvalidArbFileNameException extends Error {
  message: string;
  constructor(message: string) {
    super();
    this.message = message;
  }
}

export class InvalidLanguageCodeException extends Error {
  message: string;
  constructor(message: string) {
    super();
    this.message = message;
  }
}

export class TranslateLanguagesRequiredException extends Error {}

export class InvalidTranslateLanguagesException extends Error {
  message: string;
  constructor(message: string) {
    super();
    this.message = message;
  }
}

export class NotSupportedSourceArbException extends Error {}

export class APIKeyRequiredException extends Error {}

export class WorkspaceNotFoundException extends Error {}

export class ConfigNotFoundException extends Error {}
