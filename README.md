# Arb Translator
It is an extension that translates [ARB(Application Resource Bundle)](https://github.com/google/app-resource-bundle/wiki/ApplicationResourceBundleSpecification) files using Google Translator.

## How to start
The starting method differs depending on whether you already have an arb file translated or not.

### If there is no translated arb file
1. Prepare an arb file that will be the source of translation.
1. Run `Arb Translator : Initialize`.
1. Select source arb file.
1. Select `Select directly from language list.`.
1. Select the languages you want to translate to.
1. Run `Arb Translator : Translate`.

<img src="https://github.com/nero-angela/arb-translator/assets/26322627/0e65908d-f4de-4924-aaab-fa1454831f20" alt="arb translator initialize gif"/>


### If there are translated arb files
1. Run `Arb Translator : Initialize`.
1. Select source arb file.
1. Select `Load languages from arb files.`
1. Run `Arb Translator: Exclude Translation` command to avoid duplicate translation of already translated values.

<img src="https://github.com/nero-angela/arb-translator/assets/26322627/6858cfe2-4985-4116-a148-c19b678d02e2" alt="arb translator migration gif](https://github.com/nero-angela/arb-translator/assets/26322627/b94b1f99-a37c-4f20-9ad0-e7dfa258898d)" />

## Terms
- `arb` : Application Resource Bundle (abbr. ARB) is a JSON-based localization resource format.
- `languageCode` : This is a unique language identifier. Please refer to [the link](https://gist.github.com/nero-angela/37984030bcc5dd0e62dc3143bb8c053d) for a full list of supported languages.
- `sourceArb` : ARB file as translation source.
- `targetArb` : ARB file as a result of translating sourceArb into each language.
- `history` : A history of the last translated sourceArb to track changes to the sourceArb file.
- `cache` : This is a file that caches Google Translate results.

## Settings
Settings are required to use the extension, and you can easily add required settings by executing the `Arb Translator : Initialize` command.

Because settings may differ for each project, adding settings to the project workspace(`.vscode/settings.json`) is recommended.
  ```
  {
    "arbTranslator.config": {
      "arbFilePrefix": "intl_",
      "sourceArbFilePath": "/project/intl_en.arb",
      "googleAPIKey": "YOUR_GOOGLE_API_KEY",
      "targetLanguageCodeList": ["ko", "zh_CN", "fr"],
      "customArbFileName": {
        "ko", "zh_CN"
      },
      "customArbFileName": {
        "zh_CN": "intl_zh_Hant"
      }
    }
  }
  ```
- **Required Settings**
  - `sourceArbFilePath` : Absolute path to the source arb file you want to translate.
  - `targetLanguageCodeList` : List of languageCode you want to translate. You can add the desired languageCode with the `Arb Translator : Select target language code` command.

- **Optional Settings**
  - `arbFilePrefix` : Arb common string to prepend to file name. (e.g. `intl_` : `intl_ko.arb`, `intl_hi.arb`, `intl_fr.arb`)
  - `googleAPIKey` : This is a Google API key and is required when using the paid translation function.
  - `customArbFileName` : You can customize the arb file name for languageCode in the format `{LanguageCode: CUSTOM_NAME}` and arbFilePrefix is not applied.


# Command

## Initialize
- Command to add settings necessary for translation.
- To run this command, you need an arb file that will be the translation source.

## Translate
- Command to translate source arb file into target arb file using Google Translator.
- **Option1) Free Translation**
  - Translate with free Google Translate API.
  - An API key is not required, but the number of requests per hour is limited to approximately 100.
- **Option2) Paid Translation**
  - Translate the source arb file using [Google Cloud Translation - Base(v2)](https://cloud.google.com/translate/docs/basic/translating-text).
  - A Google API Key is required. Please refer to [the link](https://cloud.google.com/translate/docs/setup) for information on how to obtain the key.

- **Translation rules** : Translate the `value` contained in the `key` from the `sourceArb` file according to the following conditions.
  - if the `key` contains `@`, it will not be translated.
  - If the `key` does not exist in the `targetArb` file, preceed with translation.
  - If the `values` retrieved from the `history` and `sourceArb` files using the `key` are different, it is determined that there has been a change and translation is performed.
  - If the `value` in the `history` file and the `value` in `sourceArb` are different, replaces the `value` of the entire `targetArb` with the translation result.
    - `.vscode/arb-translator/history.json` : A history of the last translated sourceArb to track changes to the `sourceArb` file.
      ```
      {
        "data": {
          "@@locale": "en",
          "helloWorld": "hello world"
          "happyNewYear": "Happy new year",
        }
      }
      ```
  - Google Translator's results are stored in a cache file, and the cache is returned when the same request comes in.
    - `.vscode/arb-translator/cache.json` : This is a file that caches Google Translate results.
      ```
      {
        "source languageCode": {
          "target languageCode": {
            "SHA-1 of source value" : "translated text"
          }
        }
      }
      ```

## Validate Translation
- Command to verify translation results.
- Validation items
  - `key` : whether key exists or not.
  - `Parameters` : Whether the number of parameters is the same.
  - `Parentheses`: Whether the number of parentheses(round, curly, and square) is the same.

## Exclude Translation
- Command to use when there are changes in the `sourceArb` file, but you do not want to translate them again.
- Overwrites the changed `value` of `sourceArb` with `history` so that the value is not translated.
- However, if the `key` does not exist in the `targetArb` file, translation is performed.

## Configure Target Language Code
- Command to configure the language code to be translated.
- This is a command that configures the language code to be translated.
- **Option1) select**
  - Select directly from the list of supported languages. The language entered in the `targetLanguageCodeList` setting is selected by default.
- **Option2) load**
  - The language code extracted from other arb files in the same folder as `sourceArb` is overwritten in the `targetLanguageCodeList` setting.
