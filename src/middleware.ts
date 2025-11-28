import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware şu an basit redirect'ler için kullanılıyor
  // Auth kontrolleri client-side'da yapılıyor
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
