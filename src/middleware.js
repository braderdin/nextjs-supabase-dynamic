import { NextResponse } from 'next/server';

const storTrafik = new Map();

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // =========================================================
  // 🛡️ BENTENG 1: RATE LIMITING (ANTI-SPAM BOT)
  // =========================================================
  if (pathname.startsWith('/api/upload')) {
    const HAD_PERMINTAAN = 25;        
    const JENDELA_MASA = 15 * 1000;   
    const masaSekarang = Date.now();

    if (!storTrafik.has(ip)) {
      storTrafik.set(ip, []);
    }

    const logTrafikWarga = storTrafik.get(ip);
    const logAktif = logTrafikWarga.filter(masaLog => masaSekarang - masaLog < JENDELA_MASA);
    
    logAktif.push(masaSekarang);
    storTrafik.set(ip, logAktif);

    if (logAktif.length > HAD_PERMINTAAN) {
      return NextResponse.json(
        { 
          success: false, 
          message: "⚠️ Jangan gopoh abangku! Sistem mengesan aktiviti terlalu laju. Sila bertenang dan cuba lagi dalam 15 saat." 
        },
        { status: 429 } 
      );
    }
  }

  // =========================================================
  // 🔐 BENTENG 2: CONTENT SECURITY POLICY (CSP) HEADERS
  // =========================================================
  // Mula: Melonggarkan frame-src supaya iframe siber boleh memuatkan API raw-serve
  const ketetapanCSP = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://apis.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://* http://*;
    font-src 'self' https://fonts.gstatic.com data:;
    connect-src 'self' https://*.supabase.co https://*.supabase.in;
    frame-src 'self' data: https://*.supabase.co;
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, ' ').trim(); 
  // Tamat: Melonggarkan frame-src

  const huluRequest = new Headers(request.headers);
  huluRequest.set('Content-Security-Policy', ketetapanCSP);

  const responSistem = NextResponse.next({
    request: {
      headers: huluRequest,
    },
  });

  responSistem.headers.set('Content-Security-Policy', ketetapanCSP);
  
  // =====================================================================
  // ➔ ✅ PEMBAIKAN JITU: Ditukar dari 'DENY' ke 'SAMEORIGIN' (Surgical Fix Isu No 3)
  // Membenarkan teratak utama memuatkan iframe dari api/raw-serve miliknya sendiri
  // =====================================================================
  responSistem.headers.set('X-Frame-Options', 'SAMEORIGIN');
  // =====================================================================
  
  responSistem.headers.set('X-Content-Type-Options', 'nosniff');

  return responSistem;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};