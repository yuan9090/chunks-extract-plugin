# chunks-extract-plugin
---
extract chunkMap to json file, and read it. 

### Version
| webpack | chunks-extract-plugin |
| --- | --- |
| 5.x | 2.x |
| 4.x | 1.x |

### Before
javascript file
```js
var url = __webpack_require__.p + __webpack_require__.u(chunkId);
```
### After
javascript file
```js
let fetchSrc
new Promise(function(resolve, reject) {
fetch(__webpack_require__.p + 'routes.json')
.then(response => response.json())
.then(response => {
    fetchSrc = __webpack_require__.p + response[chunkId] + ".chunk.js";
    return resolve();
})
.catch(() => resolve());
}).then(function(){
    var url = fetchSrc;
    // code
});
```
json file
```json 
{"0":"0-2b10c240", "1":"0-2b10c240"}
```

## License
---
MIT Licensed Copyright (c) 2023 Iftek
