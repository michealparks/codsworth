(function(a){function b(d){if(c[d])return c[d].exports;var e=c[d]={exports:{},id:d,loaded:!1};return a[d].call(e.exports,e,e.exports,b),e.loaded=!0,e.exports}var c={};return b.m=a,b.c=c,b.p='',b(0)})({0:function(a,b,c){'use strict';var d=c(11),e=d.version;self.addEventListener('install',function(f){return f.waitUntil(caches.open(e).then(function(g){return g.addAll(['/codsworth/index.html'])}).then(function(){return self.skipWaiting()}))}),self.addEventListener('fetch',function(f){return f.respondWith(caches.match(f.request).then(function(g){return g||fetch(f.request)}))}),self.addEventListener('activate',function(f){return f.waitUntil(self.clients.claim()),f.waitUntil(caches.keys().then(function(g){return Promise.all(g.map(function(h){if(-1===[e].indexOf(h))return caches.delete(h)}))}))})},11:function(a,b){a.exports={name:'codsworth',version:'0.1.4',repository:'michealparks/codsworth',description:'A slim wallpaper app.',license:'MIT',scripts:{'tasks:dev':'cross-env NODE_ENV=development node tasks','tasks:prod':'cross-env NODE_ENV=production node tasks','webpack:dev':'cross-env NODE_ENV=development webpack --watch --progress --colors','webpack:prod':'cross-env NODE_ENV=production webpack','styl:dev':'stylus --watch app/index.styl --out public/index.css','styl:prod':'stylus --compress < app/index.styl > public/index.css',dev:'concurrently "npm run tasks:dev" "node server" "npm run styl:dev" "npm run webpack:dev"',prod:'npm run build && NODE_ENV=production node server',build:'npm run webpack:prod && npm run styl:prod && npm run tasks:prod',deploy:'npm run build && gh-pages -d public','deploy:major':'npm version major && npm run build && gh-pages -d public','deploy:minor':'npm version minor && npm run build && gh-pages -d public','deploy:patch':'npm version patch && npm run build && gh-pages -d public'},dependencies:{},devDependencies:{'babel-loader':'^6.2.5','babel-plugin-transform-strict-mode':'^6.11.3','babel-preset-es2015':'^6.16.0','babili-webpack-plugin':'0.0.5',concurrently:'^3.1.0','cross-env':'^3.1.2',express:'^4.14.0','gh-pages':'^0.11.0','inline-source':'^5.1.1','json-loader':'^0.5.4',morgan:'^1.7.0',stylus:'^0.54.5',webpack:'^1.13.2','webpack-validator':'^2.2.9'}}}});