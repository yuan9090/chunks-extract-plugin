
const pluginName = 'ChunksExtractPlugin'

class ChunksExtractPlugin {
  apply (compiler) {
    let json = ''

    /** 提取chunkMap */
    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      compilation.mainTemplate.hooks.localVars.tap({ name: pluginName, stage: 1 }, (source, chunk) => {
        const chunkMaps = chunk.getChunkMaps(false)
        const chunkHash = chunkMaps.hash
        const chunkName = chunkMaps.name
        const chunkHashEntries = Object.entries(chunkHash)
        let chunkJson = {}
        if (chunkHashEntries.length > 0) {
          chunkHashEntries.forEach(([name, hash]) => {
            const fileName = chunkName[name] || name
            chunkJson[name] = fileName + '-' + hash
          })
          json = JSON.stringify(chunkJson)
        }
      })
    })

    /** 將webapp的url改寫，改抓json擋 */
    compiler.hooks.compilation.tap(pluginName, compilation => {
      compilation.hooks.processAssets.tap(pluginName, assets => {
        const webappHashName = Object.keys(assets).find(name => name.startsWith('webapp'))
        if (webappHashName) {
          let source = assets[webappHashName].source()
          const { RawSource } = compiler.webpack.sources
          const start = 'var url = __webpack_require__.p + __webpack_require__.u(chunkId);'
          const end = '__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);'
          source = source.replace(start,
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
                var url = fetchSrc;
            `
          )
          source = source.replace(end, end + '});')
          compilation.updateAsset(webappHashName, new RawSource(source))
        }
      })
    })

    /** 將chunkMap寫成json檔 */
    compiler.hooks.emit.tapAsync(pluginName, (compilation, cb) => {
      compilation.assets['routes.json'] = { source: () => json, size: () => json.length }
      cb()
    })
  }
}

module.exports = ChunksExtractPlugin
