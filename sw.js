// Bump CACHE when you change any file so devices pick up the new version.
const CACHE = "tnecho-v3.2.0";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-maskable-192.png", "./icon-maskable-512.png", "./apple-touch-icon.png", "./favicon-32.png", "./training.js", "./cases.js", "./learn.js", "./atlas.js", "./lab.js", "./cases_lab.js", "./portfolio.js", "./atlas/loops.json", "./atlas/baby.jpg", "./atlas/probe.png", "./atlas/img/plax.jpg", "./atlas/img/psax_av.jpg", "./atlas/img/psax_pm.jpg", "./atlas/img/a4c.jpg", "./atlas/img/a5c.jpg", "./atlas/img/sub.jpg", "./atlas/img/ductal.jpg", "./atlas/img/arch.jpg", "./atlas/img/highps.jpg", "./vendor/jspdf.umd.min.js",
  "./fig/fig01.jpg", "./fig/fig02.jpg", "./fig/fig03.jpg", "./fig/fig04.jpg", "./fig/fig05.jpg", "./fig/fig06.jpg", "./fig/fig07.jpg", "./fig/fig08.jpg", "./fig/fig09.jpg", "./fig/fig10.jpg", "./fig/fig11.jpg", "./fig/fig12.jpg", "./fig/fig13.jpg", "./fig/fig14.jpg", "./fig/fig15.jpg", "./fig/fig16.jpg", "./fig/fig17.jpg", "./fig/fig18.jpg", "./fig/fig19.jpg", "./fig/fig20.jpg", "./fig/fig21.jpg", "./fig/fig22.jpg", "./fig/fig23.jpg", "./fig/fig24.jpg", "./fig/fig25.jpg", "./fig/fig26.jpg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== "tnecho-images").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
