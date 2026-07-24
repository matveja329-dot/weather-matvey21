/* ─────────────────────────────────────────────────────────────────────────
   Cloudflare Worker — крошечный прокси для Open-Meteo.
   Нужен, чтобы погода грузилась БЕЗ VPN, когда провайдер блокирует
   api.open-meteo.com напрямую. Cloudflare из России доступен, а сам Worker
   ходит к Open-Meteo со своей стороны (не из твоей сети) и отдаёт ответ тебе.

   Как развернуть за 2 минуты — смотри файл "БЕЗ VPN — как включить.txt".
   Бесплатно, без банковской карты, лимит ~100 000 запросов в день (с огромным
   запасом: сайт делает ~1 запрос на город раз в 3 минуты).
   ───────────────────────────────────────────────────────────────────────── */

export default {
  async fetch(request) {
    const CORS = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,OPTIONS",
      "access-control-allow-headers": "*",
    };

    // Предзапрос браузера (CORS preflight)
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const target = new URL(request.url).searchParams.get("url");
    if (!target) return new Response("missing ?url", { status: 400, headers: CORS });

    // Безопасность: проксируем ТОЛЬКО Open-Meteo, чтобы это не стало открытым
    // прокси для кого угодно (иначе твой Worker могут использовать чужие).
    let host;
    try { host = new URL(target).hostname; }
    catch { return new Response("bad url", { status: 400, headers: CORS }); }
    if (!host.endsWith("open-meteo.com")) {
      return new Response("forbidden host", { status: 403, headers: CORS });
    }

    try {
      const upstream = await fetch(target, { cf: { cacheTtl: 60, cacheEverything: true } });
      const body = await upstream.arrayBuffer();
      return new Response(body, {
        status: upstream.status,
        headers: {
          ...CORS,
          "content-type": upstream.headers.get("content-type") || "application/json",
          "cache-control": "no-store",
        },
      });
    } catch (e) {
      return new Response("upstream error: " + e, { status: 502, headers: CORS });
    }
  },
};
