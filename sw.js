// 오프라인 캐시: 처음 한 번 열면 페이지와 아이콘을 저장해 두고, 이후에는 인터넷이 없어도 열린다.
// 인터넷이 될 때는 항상 서버의 최신 파일을 먼저 가져와 캐시를 갱신한다.
const CACHE = "opic-v1";
const FILES = ["./opic_scriptbook.html", "./manifest.json", "./icon-180.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(e.request);
      if (res && res.ok) cache.put(e.request, res.clone());
      return res;
    } catch (err) {
      const hit = await cache.match(e.request, { ignoreSearch: true });
      if (hit) return hit;
      if (e.request.mode === "navigate") return cache.match("./opic_scriptbook.html");
      throw err;
    }
  })());
});
