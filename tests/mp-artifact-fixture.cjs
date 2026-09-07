const fs = require('node:fs')
const path = require('node:path')
const { buildPaths, sourceFingerprint, artifactFingerprint } = require('../scripts/mp-build-state.cjs')

function fixture() {
  const parent = path.resolve(__dirname, '../.tmp_smoke')
  fs.mkdirSync(parent, { recursive: true })
  const root = fs.mkdtempSync(path.join(parent, 'mp-gate-'))
  const paths = buildPaths(root, 'production')
  const write = (file, value) => {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, typeof value === 'object' && !Buffer.isBuffer(value) ? JSON.stringify(value) : value)
  }
  const source = { pages: [{ path: 'pages/home' }], subPackages: [{ root: 'feature', pages: [{ path: 'detail' }] }], tabBar: { list: [{ pagePath: 'pages/home' }] } }
  const app = { pages: ['pages/home'], subPackages: [{ root: 'feature', pages: ['detail'] }], lazyCodeLoading: 'requiredComponents' }
  write(path.join(root, 'pages.json'), source)
  write(path.join(root, 'pages/home.uvue'), '<template><text>Home</text></template>')
  write(path.join(root, 'scripts/mp-media-manifest.json'), { assets: [] })
  function emit() {
    write(path.join(paths.artifactPath, 'app.json'), app)
    write(path.join(paths.artifactPath, 'project.config.json'), { miniprogramRoot: './' })
    for (const page of ['pages/home', 'feature/detail']) for (const ext of ['.js', '.json', '.wxml']) {
      write(path.join(paths.artifactPath, page + ext), ext === '.json' ? '{}' : '/* fixture */')
    }
  }
  function receipt() {
    write(paths.receiptPath, { mode: 'production', artifactPath: paths.artifactPath,
      sourceHash: sourceFingerprint(root), artifactHash: artifactFingerprint(paths.artifactPath) })
  }
  function cleanup() {
    const resolved = fs.realpathSync(root)
    if (!resolved.startsWith(fs.realpathSync(parent) + path.sep)) throw Error('Fixture cleanup escaped its owned directory')
    fs.rmSync(resolved, { recursive: true, force: true })
  }
  emit()
  return { root, ...paths, write, app, source, emit, receipt, cleanup, options: { projectRoot: root } }
}

module.exports = { fixture }
