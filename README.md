# Arb Translator
It is an extension that translates [ARB(Application Resource Bundle)](https://github.com/google/app-resource-bundle/wiki/ApplicationResourceBundleSpecification) files using Google Translator.

## Features
- Use Google Translator to translate arb files. (if the key contains `@`, it will not be translated.)
- Translate only newly added or changed keys from the source file.

## Settings

- `arbFilePrefix` : Arb common string to prepend to file name. (e.g. intl_ : intl_ko.arb, intl_hi.arb...)
- `sourceArbFilePath` : Absolute path to the source arb file you want to translate.
- `googleAPIKey` : This is the Google API key, and is required when executing the Translate (paid) command.
- `targetLanguageCodeList` : This is a list of target languages to translate to. Please refer to the link for the supported list.
```
{
  "arbTranslator.config": {
    "arbFilePrefix": "intl_",
    "sourceArbFilePath": "/project/intl_en.arb",
    "googleAPIKey": "AIzaSyDScrmhd8I6A33RaVHOS-HN-AOh_DT_faI",
    "targetLanguageCodeList": ["ko", "zh_CN"],
  }
}
```
By adding it to the workspace (`.vscode/settings.json`), you can set it differently for each project.


### Example

## Command
### Translate (paid)
- Translate the source arb file using [Google Cloud Translation - Base(v2)](https://cloud.google.com/translate/docs/basic/translating-text).
- Before you can start using the Cloud Translation API, you must have a project that has the Cloud Translation API enabled, and you must have the appropriate credentials. You can also install client libraries for common programming languages to help you make calls to the API. For more information, see the [Setup page](https://cloud.google.com/translate/docs/setup).

### Translate (free)
- Translate the source arb file using the free Google Translate API.
- An API key is not required, but the number of requests per hour is limited to approximately 100.

### Create translation cache from arb files

### Override source arb history

## Requirements

Since this extension program uses Google Translator, please refer to the [link](https://cloud.google.com/translate/docs/setup) and proceed with the API setting and API Key issuance process.

## How to use
![arb translator demo](https://github.com/nero-angela/arb-translator/assets/26322627/bf4893a9-60af-499b-881e-3b8a06ca1a03)


## Support Language
| Name | LanguageCode |
|:-:|:-:|
| Afrikaans | af |
| Albanian | sq |
| Amharic | am |
| Arabic | ar |
| Armenian | hy |
| Assamese | as |
| Aymara | ay |
| Azerbaijani | az |
| Bambara | bm |
| Basque | eu |
| Belarusian | be |
| Bengali | bn |
| Bhojpuri | bho |
| Bosnian | bs |
| Bulgarian | bg |
| Catalan | ca |
| Cebuano | ceb |
| ChineseSimplified | zh_CN |
| ChineseTraditional | zh_TW |
| Corsican | co |
| Croatian | hr |
| Czech | cs |
| Danish | da |
| Dhivehi | dv |
| Dogri | doi |
| Dutch | nl |
| English | en |
| Esperanto | eo |
| Estonian | et |
| Ewe | ee |
| Finnish | fi |
| French | fr |
| Frisian | fy |
| Galician | gl |
| Georgian | ka |
| German | de |
| Greek | el |
| Guarani | gn |
| Gujarati | gu |
| HaitianCreole | ht |
| Hausa | ha |
| Hawaiian | haw |
| Hebrew | he |
| Hindi | hi |
| Hmong | hmn |
| Hungarian | hu |
| Icelandic | is |
| Igbo | ig |
| Ilocano | ilo |
| Indonesian | id |
| Irish | ga |
| Italian | it |
| Japanese | ja |
| Javanese | jw |
| Kannada | kn |
| Kazakh | kk |
| Khmer | km |
| Kinyarwanda | rw |
| Konkani | gom |
| Korean | ko |
| Krio | kri |
| Kurdish | ku |
| Kurdish | ckb |
| Kyrgyz | ky |
| Lao | lo |
| Latin | la |
| Latvian | lv |
| Lingala | ln |
| Lithuanian | lt |
| Luganda | lg |
| Luxembourgish | lb |
| Macedonian | mk |
| Maithili | mai |
| Malagasy | mg |
| Malay | ms |
| Malayalam | ml |
| Maltese | mt |
| Maori | mi |
| Marathi | mr |
| Meiteilon | mni |
| Mizo | lus |
| Mongolian | mn |
| Myanmar | my |
| Nepali | ne |
| Norwegian | no |
| Nyanja | ny |
| Odia | or |
| Oromo | om |
| Pashto | ps |
| Persian | fa |
| Polish | pl |
| Portuguese | pt |
| Punjabi | pa |
| Quechua | qu |
| Romanian | ro |
| Russian | ru |
| Samoan | sm |
| Sanskrit | sa |
| ScotsGaelic | gd |
| Sepedi | nso |
| Serbian | sr |
| Sesotho | st |
| Shona | sn |
| Sindhi | sd |
| Sinhala | si |
| Slovak | sk |
| Slovenian | sl |
| Somali | so |
| Spanish | es |
| Sundanese | su |
| Swahili | sw |
| Swedish | sv |
| Tagalog | tl |
| Tajik | tg |
| Tamil | ta |
| Tatar | tt |
| Telugu | te |
| Thai | th |
| Tigrinya | ti |
| Tsonga | ts |
| Turkish | tr |
| Turkmen | tk |
| Twi | ak |
| Ukrainian | uk |
| Urdu | ur |
| Uyghur | ug |
| Uzbek | uz |
| Vietnamese | vi |
| Welsh | cy |
| Xhosa | xh |
| Yiddish | yi |
| Yoruba | yo |
| Zulu | zu |