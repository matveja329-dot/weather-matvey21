/* Service worker — офлайн-кэш и быстрый запуск как приложение.
   Меняй версию CACHE при обновлении файлов, чтобы кэш сбросился. */
const CACHE = "pogoda-v4";

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

  // Данные погоды (Open-Meteo) — сначала сеть, при оффлайне отдаём последний ответ
  if (url.hostname.endsWith("open-meteo.com")) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
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
