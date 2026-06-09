import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [/^\/dashboard/, /^\/lyrics\/[^/]+/];

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const selectedLocale = url.searchParams.get("locale");

  if (url.pathname === "/") {
    url.pathname = "/explore";
    const response = NextResponse.redirect(url);
    if (selectedLocale === "ko" || selectedLocale === "en") {
      response.cookies.set("volt_locale", selectedLocale, { path: "/" });
    }
    return response;
  }

  if (selectedLocale === "ko" || selectedLocale === "en") {
    url.searchParams.delete("locale");
    const response = NextResponse.redirect(url);
    response.cookies.set("volt_locale", selectedLocale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  const isProtected = protectedRoutes.some((pattern) =>
    pattern.test(url.pathname),
  );
  const hasSession = Boolean(request.cookies.get("volt_session")?.value);

  if (isProtected && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
