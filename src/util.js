import crypto from "crypto";

class Util {
  static randStr(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }

  static sha3_256(str) {
    return crypto.createHash('sha3-256').update(str).digest('hex');
  }
}

export default Util;
