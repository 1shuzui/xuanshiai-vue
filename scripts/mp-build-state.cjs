const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

function listFiles(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory() ? listFiles(file) : [file]
  })
}

function readManifest(root) {
  return JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8').replace(/^\uFEFF/, '').replace(/\/\*[\s\S]*?\*\//g, ''))
}

function fingerprint(root, files, normalizeManifest = false) {
  const hash = crypto.createHash('sha256')
  for (const file of [...files].sort()) {
    hash.update(path.relative(root, file).split(path.sep).join('/') + '\0')
    // HBuilderX rewrites manifest indentation and line endings on every publish.
    // Compare every configuration value while retaining byte checks for all other files.
    hash.update(normalizeManifest && file === path.join(root, 'manifest.json') ? JSON.stringify(readManifest(root)) : fs.readFileSync(file))
    hash.update('\0')
  }
  return hash.digest('hex')
}

function sourceFingerprint(root) {
  const directories = ['pages', 'pagesSub', 'components', 'utils', 'api', 'mock', 'static', 'uni_modules']
  const files = ['App.uvue', 'main.uts', 'uni.scss', 'manifest.json', 'pages.json', 'package.json', 'package-lock.json', 'project.config.json']
  return fingerprint(root, [
    ...directories.flatMap(directory => listFiles(path.join(root, directory))),
    ...files.map(file => path.join(root, file)).filter(file => fs.existsSync(file))
  ], true)
}

function artifactFingerprint(root) {
  // DevTools writes private UI preferences after a build; those are not application code.
  return fingerprint(root, listFiles(root).filter(file => path.basename(file) !== 'project.private.config.json'))
}

function buildPaths(root, mode) {
  if (!['production', 'development'].includes(mode)) throw Error(`Unknown build mode: ${mode}`)
  return {
    artifactPath: path.join(root, 'unpackage', 'dist', mode === 'production' ? 'build' : 'dev', 'mp-weixin'),
    receiptPath: path.join(root, 'unpackage', 'build-reports', `mp-weixin-${mode}.json`),
    logPath: path.join(root, 'unpackage', 'build-reports', `mp-weixin-${mode}.log`)
  }
}

module.exports = { listFiles, sourceFingerprint, artifactFingerprint, buildPaths, readManifest }
