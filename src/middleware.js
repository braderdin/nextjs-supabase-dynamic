import { NextResponse } from 'next/server';

// Pangkalan data memori mini untuk mengira trafik (Rate Limiting)
// Nota: Ia berjalan di peringkat Edge Vercel, sangat laju dan ringan!
const storTrafik = new Map();

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Ambil alamat IP pelawat dengan selamat
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // =========================================================
  // 🛡️ BENTENG 1: RATE LIMITING (ANTI-SPAM BOT / DDOS PROTECTION)
  // =========================================================
  // Kita kunci jalan API Upload untuk mengelakkan bot menembak spam script
  if (pathname.startsWith('/api/upload')) {
    const HAD_PERMINTAAN = 25;        // ➔ ✅ PEMBAIKAN: Dinaikkan ke 25 kali klik biar abang puas testing!
    const JENDELA_MASA = 15 * 1000;   // ➔ ✅ PEMBAIKAN: Diturunkan ke 15 saat sahaja (bukan 1 minit lagi)
    const masaSekarang = Date.now();

    if (!storTrafik.has(ip)) {
      storTrafik.set(ip, []);
    }

    const logTrafikWarga = storTrafik.get(ip);
    
    // Bersihkan log lama yang dah lebih daripada 15 saat
    const logAktif = logTrafikWarga.filter(masaLog => masaSekarang - masaLog < JENDELA_MASA);
    
    // Masukkan cap masa permintaan terbaharu
    logAktif.push(masaSekarang);
    storTrafik.set(ip, logAktif);

    // Jika aktiviti melampaui had luar biasa (bot tegar), sekat sekejap sahaja
    if (logAktif.length > HAD_PERMINTAAN) {
      return NextResponse.json(
        { 
          success: false, 
          message: "⚠️ Jangan gopoh abangku! Sistem mengesan aktiviti terlalu laju. Sila bertenang dan cuba lagi dalam 15 saat." 
        },
        { status: 429 } // Status 429: Too Many Requests
      );
    }
  }

  // =========================================================
  // 🔐 BENTENG 2: CONTENT SECURITY POLICY (CSP) HEADERS
  // =========================================================
  // Menghalang sebarang cubaan suntikan skrip berniat jahat daripada luar ekosistem Kampung Siber
  const ketetapanCSP = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://apis.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://* http://*;
    font-src 'self' https://fonts.gstatic.com data:;
    connect-src 'self' https://*.supabase.co https://*.supabase.in;
    frame-src 'self' https://*.supabase.co;
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, ' ').trim(); // Bersihkan ruang jarak kosong supaya susunan header kemas

  // Suntik peraturan keselamatan ke dalam kepala request (Request Headers)
  const huluRequest = new Headers(request.headers);
  huluRequest.set('Content-Security-Policy', ketetapanCSP);

  // Teruskan perjalanan trafik ke destinasi asal bersama perisai CSP
  const responSistem = NextResponse.next({
    request: {
      headers: huluRequest,
    },
  });

  // Pastikan browser pelawat menerima dan mematuhi polisi CSP ini
  responSistem.headers.set('Content-Security-Policy', ketetapanCSP);
  
  // Lindungi web daripada serangan Clickjacking
  responSistem.headers.set('X-Frame-Options', 'DENY');
  
  // Halang browser daripada cuba meneka jenis fail (Anti Mime-Sniffing)
  responSistem.headers.set('X-Content-Type-Options', 'nosniff');

  return responSistem;
}

// =========================================================
// MATCHERS: Tentukan kawasan mana yang wajib dilindungi
// =========================================================
export const config = {
  matcher: [
    /*
     * Lindungi semua laluan kecuali fail statik dalam Next.js:
     * - _next/static (fail static)
     * - _next/image (gaya imej Next.js)
     * - favicon.ico (ikon web)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};