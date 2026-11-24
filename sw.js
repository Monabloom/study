// 11/22 改：联网时先取网上最新版（页面、课表），断网才用缓存——保证更新后打开就是新版；打卡记录存在 localStorage，更新不会动
const V = 'study-202611241743';
const FILES = ['./', './index.html', './manifest.json', './icon-180.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES.map(f => new Request(f, {cache: 'reload'}))))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;
  // 注意：打开页面（navigate）的请求不能带参数再 fetch，会直接报错 → 一律用网址重新发请求
  e.respondWith(caches.open(V).then(c => fetch(u.href, {cache: 'no-store', credentials: 'same-origin'}).then(r => {
    if (r.ok && !u.pathname.endsWith('sched.enc')) c.put(e.request, r.clone());
    return r;
  }).catch(() => c.match(e.request, {ignoreSearch: true}))));
});
