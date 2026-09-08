const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { inspectArtifact } = require('../scripts/verify-mp-weixin.cjs')
const { fixture } = require('./mp-artifact-fixture.cjs')

let scenarios = 0
function scenario(name, run) {
  const f = fixture()
  try { run(f); scenarios++; console.log(`PASS ${name}`) } finally { f.cleanup() }
}
function fails(f, name, options = {}) {
  const result = inspectArtifact({ ...f.options, ...options })
  assert.equal(result.passed, false)
  assert.equal(result.checks.find(check => check.name === name)?.passed, false, name)
}

scenario('complete source routes and artifacts pass', f => assert.equal(inspectArtifact(f.options).passed, true))
scenario('main package boundary counts every file', f => {
  const bytes = inspectArtifact(f.options).packages.find(pkg => pkg.name === 'main').bytes
  assert.equal(inspectArtifact({ ...f.options, mainLimitBytes: bytes }).passed, true)
  fails(f, 'package sizes', { mainLimitBytes: bytes - 1 })
})
scenario('subpackage has an independent budget', f => {
  const bytes = inspectArtifact(f.options).packages.find(pkg => pkg.name === 'feature').bytes
  assert.equal(inspectArtifact({ ...f.options, subpackageLimitBytes: bytes }).passed, true)
  fails(f, 'package sizes', { subpackageLimitBytes: bytes - 1 })
})
scenario('200 KiB media passes; one additional byte fails', f => {
  const file = path.join(f.artifactPath, 'static/photo.jpg')
  f.write(file, Buffer.alloc(204800))
  assert.equal(inspectArtifact(f.options).passed, true)
  fs.appendFileSync(file, 'x')
  fails(f, 'media sizes')
})
for (const extension of ['.js', '.json', '.wxml']) scenario(`a page missing only ${extension} fails`, f => {
  fs.unlinkSync(path.join(f.artifactPath, 'feature/detail' + extension))
  fails(f, 'complete page files')
})
scenario('page files cannot hide an omitted app route', f => {
  f.app.subPackages[0].pages = []
  f.write(path.join(f.artifactPath, 'app.json'), f.app)
  fails(f, 'source routes and package ownership')
})
scenario('same URL moved into the wrong package fails', f => {
  f.app.pages.push('feature/detail')
  f.app.subPackages = []
  f.write(path.join(f.artifactPath, 'app.json'), f.app)
  fails(f, 'source routes and package ownership')
})
scenario('disabled lazy loading fails', f => {
  delete f.app.lazyCodeLoading
  f.write(path.join(f.artifactPath, 'app.json'), f.app)
  fails(f, 'lazy loading')
})
scenario('moved media must exist and match the optimized source', f => {
  const asset = { path: 'feature/static/photo.webp', source: 'static/photo.png' }
  f.write(path.join(f.root, 'scripts/mp-media-manifest.json'), { assets: [asset] })
  f.write(path.join(f.root, asset.path), 'optimized')
  fails(f, 'packaged media inventory')
  f.write(path.join(f.artifactPath, asset.path), 'old bytes')
  fails(f, 'packaged media inventory')
  f.write(path.join(f.artifactPath, asset.path), 'optimized')
  assert.equal(inspectArtifact(f.options).passed, true)
  f.write(path.join(f.artifactPath, asset.source), 'duplicated original')
  fails(f, 'packaged media inventory')
})
scenario('static region JSON cannot duplicate the imported module', f => {
  f.write(path.join(f.artifactPath, 'static/location.json'), '{}')
  fails(f, 'packaged media inventory')
})
scenario('missing local media reference fails', f => {
  f.write(path.join(f.artifactPath, 'pages/home.wxml'), '<image src="/static/missing.webp"/>')
  fails(f, 'local asset and component references')
})
scenario('main package cannot import a subpackage component', f => {
  f.write(path.join(f.artifactPath, 'pages/home.json'), { usingComponents: { card: '/feature/detail' } })
  fails(f, 'local asset and component references')
})
scenario('shared font bytes must be embedded exactly once', f => {
  const font = Buffer.from('font fixture bytes')
  f.write(path.join(f.root, 'components/assets/icons/test/iconfont.woff2'), font)
  fails(f, 'shared font inventory')
  const declaration = `@font-face{src:url(data:font/woff2;base64,${font.toString('base64')})}`
  f.write(path.join(f.artifactPath, 'components/XsaIcon.wxss'), declaration)
  assert.equal(inspectArtifact(f.options).passed, true)
  f.write(path.join(f.artifactPath, 'feature/detail.wxss'), declaration)
  fails(f, 'shared font inventory')
})
scenario('successful build provenance rejects missing, stale and edited output', f => {
  fails(f, 'successful build provenance', { requireBuild: true })
  f.receipt()
  assert.equal(inspectArtifact({ ...f.options, requireBuild: true }).passed, true)
  fs.appendFileSync(path.join(f.root, 'pages/home.uvue'), '\n<!-- edit -->')
  fails(f, 'successful build provenance', { requireBuild: true })
  f.receipt()
  fs.appendFileSync(path.join(f.artifactPath, 'pages/home.js'), '\n/* edited output */')
  fails(f, 'successful build provenance', { requireBuild: true })
})
scenario('CLI uses exit codes 0, 2 and 1 for pass, quality failure and missing input', f => {
  const run = () => spawnSync(process.execPath, [path.resolve(__dirname, '../scripts/verify-mp-weixin.cjs'),
    '--project', f.root, '--artifact', f.artifactPath], { encoding: 'utf8' })
  assert.equal(run().status, 0)
  fs.unlinkSync(path.join(f.artifactPath, 'feature/detail.wxml'))
  assert.equal(run().status, 2)
  fs.unlinkSync(path.join(f.artifactPath, 'app.json'))
  assert.equal(run().status, 1)
})
console.log(`${scenarios} synthetic artifact gate scenarios passed`)
