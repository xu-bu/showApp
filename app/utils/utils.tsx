import CryptoJS from 'crypto-js';
export function getMD5(text: string): string {
  return CryptoJS.MD5(text).toString();
}

export function getRandStr(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; ++i) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}



