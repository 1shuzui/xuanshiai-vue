const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const manifest = require('../scripts/mp-media-manifest.json')

const root = path.resolve(__dirname, '..')
const artifactPath = path.resolve(process.argv[2] || path.join(root, 'unpackage/dist/build/mp-weixin'))
for (const asset of manifest.assets) {
  const file = path.join(artifactPath, asset.path)
  assert.ok(fs.existsSync(file), `missing packaged media: ${asset.path}`)
  assert.ok(fs.readFileSync(file).equals(fs.readFileSync(path.join(root, asset.path))), `stale packaged media: ${asset.path}`)
  if (asset.source !== asset.path) assert.equal(fs.existsSync(path.join(artifactPath, asset.source)), false, `duplicate old media: ${asset.source}`)
}
console.log('PASS mp-weixin media inventory and ownership')
