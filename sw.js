if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let r=Promise.resolve();return t[e]||(r=new Promise(async r=>{if("document"in self){const t=document.createElement("script");t.src=e,document.head.appendChild(t),t.onload=r}else importScripts(e),r()})),r.then(()=>{if(!t[e])throw new Error(`Module ${e} didn’t register its module`);return t[e]})},r=(r,t)=>{Promise.all(r.map(e)).then(e=>t(1===e.length?e[0]:e))},t={require:Promise.resolve(r)};self.define=(r,s,i)=>{t[r]||(t[r]=Promise.resolve().then(()=>{let t={};const n={uri:location.origin+r.slice(1)};return Promise.all(s.map(r=>{switch(r){case"exports":return t;case"module":return n;default:return e(r)}})).then(e=>{const r=i(...e);return t.default||(t.default=r),t})}))}}define("./sw.js",["./workbox-80efdfd1"],(function(e){"use strict";e.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"index.html",revision:"5ea78822ce581bd7481ae70dae8b5163"}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"))),e.registerRoute("polyfills/*.js",new e.CacheFirst,"GET")}));
//# sourceMappingURL=sw.js.map
