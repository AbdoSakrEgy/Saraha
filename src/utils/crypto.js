import CryptoJS from "crypto-js";

export const encryption = (text) => {
  return CryptoJS.AES.encrypt(text, process.env.cryptoKey).toString();
};
export const decryption = (cyphertext) => {
  return CryptoJS.AES.decrypt(cyphertext, process.env.cryptoKey).toString(
    CryptoJS.enc.Utf8
  );
};
