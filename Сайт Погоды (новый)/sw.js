/* Service worker — офлайн-кэш и быстрый запуск как приложение.
   Меняй версию CACHE при обновлении файлов, чтобы кэш сбросился. */
const CACHE = "pogoda-v11";

// Ключ кэша для Open-Meteo без cache-buster `_`: в app.js к каждому запросу
// добавляется `_: Date.now()`, из-за чего URL всегда уникальный. Без нормализации
// офлайн-фолбэк (caches.match) никогда не находил прошлый ответ, а кэш рос без предела.
// Координаты/параметры в ключе остаются — значит на каждый город ровно одна запись.
function omKey(rawUrl) {
  const u = new URL(rawUrl);
  u.searchParams.delete("_");
  return u.toString();
}

// «Оболочка» приложения — кэшируем при установке
const SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./style.css",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png",
  "./favicon-32.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Открытие приложения/страницы (навигация). Сначала пробуем сеть, но при ЛЮБОЙ
  // осечке (оффлайн, моргнул VPN, GitHub недоступен) отдаём кэш index.html, чтобы
  // приложение ВСЕГДА открывалось.
  // Это и есть фикс «белого экрана с VPN»: start_url у приложения = index.html?app=1,
  // а в кэше лежит index.html без ?app=1 — поэтому раньше offline-поиск промахивался
  // (?app=1 ≠ index.html) и установленное приложение не запускалось.
  // ignoreSearch отбрасывает ?app=1 при поиске в кэше.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok && !res.redirected) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put("./index.html", copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req, { ignoreSearch: true })
            .then((r) => r || caches.match("./index.html"))
            .then((r) => r || caches.match("./"))
        )
    );
    return;
  }

  // Радар (RainViewer) — пропускаем мимо SW: тайлы должны остаться CORS-читаемыми для canvas
  if (url.hostname.endsWith("rainviewer.com")) return;

  // Данные погоды (Open-Meteo) — сначала сеть, при оффлайне отдаём последний ответ.
  // Кладём/ищем по ключу без `_`, иначе оффлайн-фолбэк не сработает (см. omKey).
  if (url.hostname.endsWith("open-meteo.com")) {
    const key = omKey(req.url);
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(key, copy));
          return res;
        })
        .catch(() => caches.match(key))
    );
    return;
  }

  // Свои файлы — stale-while-revalidate: мгновенно отдаём из кэша (быстрый старт, без мигания),
  // а в фоне тихо обновляем кэш. Так новая вёрстка/скрипты приезжают сами к следующему запуску.
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res.ok && (url.origin === location.origin || url.hostname.includes("gstatic"))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
