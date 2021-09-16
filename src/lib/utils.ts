import { createHmac, timingSafeEqual } from 'crypto';
import { hash, verify } from 'argon2';
import { join } from 'path';
import { readdir, stat } from 'fs/promises';
import generate from './generators';

export async function hashPassword(s: string): Promise<string> {
  return await hash(s);
}

export function checkPassword(s: string, hash: string): Promise<boolean> {
  return verify(hash, s);
}

export function createToken() {
  return generate(24) + '.' + Buffer.from(Date.now().toString()).toString('base64url');
}

export function sign(value: string, secret: string): string {
  const signed =  value + ':' + createHmac('sha256', secret)
    .update(value)
    .digest('base64')
    .replace(/=+$/, '');
  return signed;
}

export function unsign(value: string, secret: string): string {
  const str = value.slice(0, value.lastIndexOf(':'));
  const mac = sign(str, secret);
  const macBuffer = Buffer.from(mac);
  const valBuffer = Buffer.from(value);
  return timingSafeEqual(macBuffer, valBuffer) ? str : null;
}

export function sign64(value: string, secret: string): string {
  return Buffer.from(sign(value, secret)).toString('base64');
}

export function unsign64(value: string, secret: string): string {
  return unsign(Buffer.from(value, 'base64').toString(), secret);
}

export async function sizeOfDir(directory: string): Promise<number> {
  const files = await readdir(directory);
  let size = 0;
  for (let i = 0, L = files.length; i !== L; ++i) {
    const sta = await stat(join(directory, files[i]));
    size += sta.size;
  }
  return size;
}

export function bytesToHr(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let num = 0;
  while (bytes > 1024) {
    bytes /= 1024;
    ++num;
  }
  return `${bytes.toFixed(1)} ${units[num]}`;
}
