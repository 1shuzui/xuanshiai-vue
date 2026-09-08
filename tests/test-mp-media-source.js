const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { listFiles } = require('../scripts/mp-build-state.cjs')

const root = path.resolve(__dirname, '..')
const manifest = require('../scripts/mp-media-manifest.json')
const sha = value => crypto.createHash('sha256').update(value).digest('hex')
for (const asset of manifest.assets) {
  const bytes = fs.readFileSync(path.join(root, asset.path))
  assert.equal(sha(bytes), asset.sha256, `media changed without updating its encoding record: ${asset.path}`)
  assert.equal(bytes.length, asset.bytes)
  assert.ok(bytes.length <= 204800, `media over 200 KiB: ${asset.path}`)
  if (asset.source !== asset.path) assert.equal(fs.existsSync(path.join(root, asset.source)), false, `old resource duplicated: ${asset.source}`)
}
for (const state of ['idle', 'listening', 'speaking', 'thinking']) {
  assert.ok(manifest.assets.some(asset => asset.path === `pagesSub/profileExtra/static/master/moxiang-master-${state}.webp`))
}
const posters = manifest.assets.filter(asset => asset.path.includes('/poster-templates/'))
assert.equal(posters.length, 4)
assert.ok(posters.every(asset => asset.encoderOptions.lossless === true))
const regions = JSON.parse(fs.readFileSync(path.join(root, 'utils/data/location.json'), 'utf8'))
assert.equal(sha(JSON.stringify(regions)), 'eec58b631679e9afdc86fcbf8fa613c710bdd73efcc38ba517160c8aaabb1819',
  'all province/city/district names, codes and array order must match the original dataset')
assert.equal(fs.existsSync(path.join(root, 'static/location.json')), false)
const sourceFiles = ['pages', 'pagesSub', 'components', 'api', 'utils'].flatMap(folder => listFiles(path.join(root, folder))).filter(file => /\.(uvue|uts)$/.test(file))
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8')
  assert.doesNotMatch(source, /@\/static\/location\.json/, `outdated location import: ${file}`)
  for (const asset of manifest.assets.filter(asset => asset.source !== asset.path)) {
    assert.ok(!source.includes("'/" + asset.source + "'") && !source.includes('"/' + asset.source + '"'), `outdated image reference in ${file}: ${asset.source}`)
  }
}
console.log(`PASS ${manifest.assets.length} optimized images, four states, four lossless posters and unchanged region dataset`)
