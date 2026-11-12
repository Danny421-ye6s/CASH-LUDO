const CACHE="cash-ludo-v0-20";
const ASSETS=["./","./index.html","./game-engine.js","./manifest.webmanifest"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  const isAppShell=event.request.mode==="navigate"||url.pathname.endsWith("/index.html")||url.pathname.endsWith("/CASH-LUDO/");
  const isGameEngine=url.pathname.endsWith("/game-engine.js");
  if(isAppShell||isGameEngine){
    event.respondWith(fetch(event.request,{cache:"no-store"}).then(response=>{
      if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
      return response;
    }).catch(()=>caches.match(event.request).then(cached=>cached||(isAppShell?caches.match("./index.html"):Promise.reject(new Error("Offline and game engine is not cached"))))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
