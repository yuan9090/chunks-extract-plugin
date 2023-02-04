
const pluginName = 'ChunksExtractPlugin'

class ChunksExtractPlugin {
  apply (compiler) {
    let json = ''

    /** 提取chunkMap */
    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      compilation.mainTemplate.hooks.localVars.tap({ name: pluginName, stage: 1 }, (source, chunk) => {
        const chunkMaps = chunk.getChunkMaps(false).hash
        const chunkEntries = Object.entries(chunkMaps)
        let chunkJson = {}
        if (chunkEntries.length > 0) {
          chunkEntries.forEach(([name, hash]) => {
            chunkJson[name] = name + '-' + hash
          })
          json = JSON.stringify(chunkJson)
        }
      })
    })

    /** 將script.src的設值改寫，改抓json擋 */
    compiler.hooks.compilation.tap(pluginName, compilation => {
      if (compilation.mainTemplate.hooks.jsonpScript) {
        compilation.mainTemplate.hooks.jsonpScript.tap(pluginName, (source, chunk) => {
          if (source.includes('jsonpScriptSrc')) {
            source = source.replace(`script.src = jsonpScriptSrc(chunkId);`,
              `
                let fetchSrc
                new Promise(function(resolve, reject) {
                  fetch(__webpack_require__.p + 'routes.json')
                  .then(response=>response.json())
                  .then(response=>{
                    fetchSrc = __webpack_require__.p + response[chunkId] + ".chunk.js";
                    return resolve();
                  })
                  .catch(()=>resolve());
                }).then(function(){
                  script.src = fetchSrc
              `
            )
            return source + '});'
          }
        })
      }
    })

    /** 將chunkMap寫成json檔 */
    compiler.hooks.emit.tapAsync(pluginName, (compilation, cb) => {
      compilation.assets['routes.json'] = { source: () => json, size: () => json.length }
      cb()
    })
  }
}

module.exports = ChunksExtractPlugin
