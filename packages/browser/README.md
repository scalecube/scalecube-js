[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> **NOTICE** versions 0.0.x are experimental without LTS or the API and behavior might change from patch to patch

# Microservices-browser

This package provides Scalecube's solution with default setting for working in browsers.

## documentation

please [Read](http://scalecube.io/javascript-docs) before starting to work with scalecube.

## Old browser supports

this package already transpile the code to es5.

for old browser support please add:

-   babel-polyfill
-   proxy-polyfill

```html
 <script nomodule src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.6.0/polyfill.min.js"></script>
 <script nomodule src="https://cdn.jsdelivr.net/npm/proxy-polyfill@0.3.0/proxy.min.js"></script>
```
