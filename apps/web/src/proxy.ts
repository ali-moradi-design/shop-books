import { NextResponse, type NextRequest } from 'next/server';
import {
  AB_MAX_AGE,
  EXPERIMENTS,
  VISITOR_COOKIE,
  cookieName,
  isVariant,
  pickVariant,
  type ExperimentKey,
} from '@/shared/lib/ab/experiments';

/**
 * Gives each visitor an id and a sticky variant per A/B test before the page
 * renders, so the server renders the right variant with no flash. The cookies
 * are added to the request too, so this same request already sees them.
 */
export function proxy(request: NextRequest) {
  const set: [string, string][] = [];
  if (!request.cookies.get(VISITOR_COOKIE)?.value)
    set.push([VISITOR_COOKIE, crypto.randomUUID().replace(/-/g, '')]);
  for (const key of Object.keys(EXPERIMENTS) as ExperimentKey[]) {
    if (!isVariant(key, request.cookies.get(cookieName(key))?.value))
      set.push([cookieName(key), pickVariant(key, Math.random())]);
  }
  if (set.length === 0) return NextResponse.next();
  for (const [name, value] of set) request.cookies.set(name, value);
  const response = NextResponse.next({ request: { headers: request.headers } });
  for (const [name, value] of set) {
    response.cookies.set(name, value, {
      maxAge: AB_MAX_AGE,
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
    });
  }
  return response;
}

export const config = {
  // pages only: not assets, images, hooks or files with an extension
  matcher: ['/((?!_next/static|_next/image|hooks|.*\\.[a-z0-9]+$).*)'],
};
