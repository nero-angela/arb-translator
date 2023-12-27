const cheerio = require("cheerio");

export function hasHtmlTags(str: string): boolean {
  const $ = cheerio.load(str);
  return $("*").length > 0;
}
