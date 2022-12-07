# jsonpscriptsrc-extract-plugin
---
extract chunkId Object to File from `jsonpscriptsrc` function
### Before
```js
// js File
function jsonpScriptSrc() {
    return __webpack_require__.p + "" + ({}[chunkId] || chunkId) + "-" + {...} [chunkId] + ".chunk.js"
}
```
### After
```json 
// json File
{"0":"0-2b10c240", ...}
```

## License
---
MIT Licensed Copyright (c) 2022 Iftek