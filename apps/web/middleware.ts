import { NextResponse, type NextRequest } from "next/server";
import { clinicSlugFromPath } from "./lib/demo/branding";

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  const cabinet = request.nextUrl.searchParams.get("cabinet") ?? "";
  const doctor = request.nextUrl.searchParams.get("doctor") ?? "";
  const slug = clinicSlugFromPath(request.nextUrl.pathname);
  headers.set("x-dp-cabinet", encodeURIComponent(cabinet));
  headers.set("x-dp-doctor", encodeURIComponent(doctor));
  headers.set("x-dp-slug", encodeURIComponent(slug));
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|og|.*\\..*).*)"],
};
