import type { CookieSerializeOptions } from 'cookie';
import { serialize } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';
import config from '../config';
import prisma from '../prisma';
import { sign64, unsign64 } from '../utils';

export interface NextApiFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: string;
  size: number;
}

export type NextApiReq = NextApiRequest & {
  user: () => Promise<{
    username: string;
    token: string;
    useEmbed: boolean;
    embedSiteName: string;
    embedTitle: string;
    embedColor: string;
    embedDesc: string;
    isAdmin: boolean;
    id: number;
    password: string;
  } | null | void>;
  getCookie: (name: string) => string | null;
  cleanCookie: (name: string) => void;
  file?: NextApiFile;
}

export type NextApiRes = NextApiResponse & {
  error: (message: string) => void;
  forbid: (message: string) => void;
  bad: (message: string) => void;
  json: (json: any) => void;
  setCookie: (name: string, value: unknown, options: CookieSerializeOptions) => void;
}

export const withDraconic = (handler: (req: NextApiRequest, res: NextApiResponse) => unknown) => (req: NextApiReq, res: NextApiRes) => {
  res.error = (message: string) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(400);
    res.json({
      code: 400,
      error: message
    });
  };
  res.forbid = (message: string) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(403);
    res.json({
      code: 403,
      error: message
    });
  };
  res.bad = (message: string) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(401);
    res.json({
      code: 401,
      error: message
    });
  };
  res.json = (json: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(json));
  };
  req.getCookie = (name: string) => {
    const cookie = req.cookies[name];
    if (!cookie) return null;
    const unsigned = unsign64(cookie, config.core.secret);
    return unsigned ? unsigned : null;
  };
  req.cleanCookie = (name: string) => {
    res.setHeader('Set-Cookie', serialize(name, '', {
      path: '/',
      expires: new Date(),
      maxAge: undefined
    }));
  };
  req.user = async () => {
    try {
      const userId = req.getCookie('user');
      if (!userId) return null;
      const user = await prisma.user.findFirst({
        where: {
          id: Number(userId)
        },
        select: {
          isAdmin: true,
          useEmbed: true,
          embedSiteName: true,
          embedColor: true,
          embedTitle: true,
          embedDesc: true,
          id: true,
          password: true,
          token: true,
          username: true
        }
      });
      if (!user) return null;
      return user;
    } catch (e) {
      if (e.code && e.code === 'ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH') {
        req.cleanCookie('user');
        return null;
      }
    }
  };
  res.setCookie = (name: string, value: unknown, options?: CookieSerializeOptions) => setCookie(res, name, value, options || {});
  return handler(req, res);
};

export const setCookie = (
  res: NextApiResponse,
  name: string,
  value: unknown,
  options: CookieSerializeOptions = {}
) => {
  if ('maxAge' in options) {
    options.expires = new Date(Date.now() + options.maxAge * 1000);
  }
  const signed = sign64(String(value), config.core.secret);
  res.setHeader('Set-Cookie', serialize(name, signed, options));
};