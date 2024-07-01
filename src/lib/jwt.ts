import * as jose from 'jose';
import Cookies from 'js-cookie';

export const TOKEN_COOKIE_NAME = '__roadmapsh_jt__';

export type TokenPayload = {
  id: string;
  email: string;
  name: string;
};

export function decodeToken(token: string): TokenPayload {
  const claims = jose.decodeJwt(token);

  return claims as TokenPayload;
}

export function isLoggedIn() {
  const token = Cookies.get(TOKEN_COOKIE_NAME);

  return !!token;
}
