import { createHash } from "crypto";

export class Crypto {
  public static generateSHA1(input: string): string {
    const sha1Hash = createHash("sha1");
    sha1Hash.update(input, "utf-8");
    return sha1Hash.digest("hex");
  }
}
