export class BaseException extends Error {}
export class MessageException extends BaseException {
  message: string;
  constructor(message: string) {
    super();
    this.message = message;
  }
}
/**
 * BaseException
 */
export class ConfigurationRequiredException extends BaseException {}
export class APIKeyRequiredException extends BaseException {}
export class ConfigNotFoundException extends BaseException {}

/**
 * MessageException
 */
export class InitializeRequiredException extends MessageException {
  constructor(className: string) {
    super(`${className} class must call an init() function before use.`);
  }
}
export class SourceArbFilePathRequiredException extends MessageException {
  constructor() {
    super(
      "Please add arbTranslator.config.sourceArbFilePath to the .vscode/settings.json file."
    );
  }
}

export class FileNotFoundException extends MessageException {
  constructor(fileName: string) {
    super(`File ${fileName} not found.`);
  }
}

export class InvalidArbFileNameException extends MessageException {
  constructor(arbFileName: string) {
    super(`The language code of ${arbFileName} is not valid.`);
  }
}

export class InvalidLanguageCodeException extends MessageException {
  constructor(languageCode: string) {
    super(`${languageCode} is invalid language code.`);
  }
}

export class TranslateLanguagesRequiredException extends MessageException {
  constructor() {
    super(`Please add translateLanguage to the .vscode/settings.json file.`);
  }
}

export class WorkspaceNotFoundException extends MessageException {
  constructor() {
    super("There is no project workspace.");
  }
}

export class TranslationFailureException extends MessageException {
  constructor(message: string) {
    super(message);
  }
}
