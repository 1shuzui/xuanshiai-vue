const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { parseArgs } = require('node:util')
const { sourceFingerprint, artifactFingerprint, buildPaths, readManifest } = require('./mp-build-state.cjs')
const { inspectArtifact } = require('./verify-mp-weixin.cjs')

function findCli() {
  const candidate = process.env.HBUILDERX_CLI || ['D:/HBuilderX/cli.exe', 'C:/HBuilderX/cli.exe'].find(file => fs.existsSync(file))
  if (!candidate || !fs.existsSync(candidate)) throw Error('Set HBUILDERX_CLI to the installed HBuilderX cli executable, and open HBuilderX with this project imported.')
  return candidate
}

function build(options = {}) {
  const root = fs.realpathSync(options.projectRoot || path.resolve(__dirname, '..'))
  const mode = options.mode || 'production'
  const paths = buildPaths(root, mode)
  fs.rmSync(paths.receiptPath, { force: true })
  const cli = options.compiler ? null : findCli()
  const invoke = options.compiler || (args => spawnSync(cli, args, { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 180000, maxBuffer: 16 * 1024 * 1024 }))
  const help = invoke(['--help'])
  const version = (help.stdout || '').match(/HBuilderX\(v([^)]+)\)/)?.[1]
  if (!version) throw Error(`Unable to read HBuilderX version. ${help.stdout || help.stderr || ''}`)
  const manifest = readManifest(root)
  const wechatAppId = manifest['mp-weixin'].appid
  if (mode === 'production' && !wechatAppId) throw Error('Set manifest.json mp-weixin.appid to the WeChat mini-program AppID before publishing.')
  fs.mkdirSync(path.dirname(paths.receiptPath), { recursive: true })
  const sourceHash = sourceFingerprint(root)
  // This is a fixed, owned build directory. Resolve existing links before any recursive removal.
  let existingParent = paths.artifactPath
  while (!fs.existsSync(existingParent)) existingParent = path.dirname(existingParent)
  const resolvedArtifact = path.resolve(fs.realpathSync(existingParent), path.relative(existingParent, paths.artifactPath))
  if (!resolvedArtifact.startsWith(root + path.sep) || !path.relative(root, resolvedArtifact).startsWith('unpackage' + path.sep)) {
    throw Error(`Refusing to clear an artifact outside this project's unpackage directory: ${resolvedArtifact}`)
  }
  console.log(`Clean build directory: ${resolvedArtifact}`)
  fs.rmSync(paths.artifactPath, { recursive: true, force: true })
  const startedAt = new Date().toISOString()
  const args = mode === 'production'
    ? ['publish', 'mp-weixin', '--project', root, '--appid', wechatAppId, '--upload', 'false', '--sourceMap', 'false']
    : ['launch', 'mp-weixin', '--project', path.basename(root), '--compile', 'true']
  const result = invoke(args)
  const output = (result.stdout || '') + (result.stderr || '')
  fs.writeFileSync(paths.logPath, output)
  if (result.error || result.status !== 0 || !/编译成功|发布成功|发行成功|导出成功/.test(output)) {
    throw Error(`HBuilderX did not complete a successful ${mode} build. ${result.error?.message || output.slice(-2000)}\nFull log: ${paths.logPath}`)
  }
  if (sourceFingerprint(root) !== sourceHash) throw Error('Source changed while HBuilderX was compiling; rebuild the current files.')
  const inspection = inspectArtifact({ projectRoot: root, artifactPath: paths.artifactPath, mode })
  const incomplete = inspection.checks.filter(check => !check.passed && !['package sizes', 'media sizes'].includes(check.name))
  if (incomplete.length) throw Error(incomplete.flatMap(check => check.failures).join('\n'))
  const revision = spawnSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8', windowsHide: true })
  if (revision.status !== 0) throw Error('Unable to record the frontend Git revision')
  const status = spawnSync('git', ['-C', root, 'status', '--porcelain'], { encoding: 'utf8', windowsHide: true })
  if (status.status !== 0) throw Error('Unable to record frontend worktree state')
  const receipt = { mode, compilerVersion: version, commit: revision.stdout.trim(), dirty: status.stdout.trim() !== '',
    startedAt, completedAt: new Date().toISOString(), artifactPath: paths.artifactPath, sourceHash,
    artifactHash: artifactFingerprint(paths.artifactPath), pages: inspection.pageCount }
  fs.writeFileSync(paths.receiptPath, JSON.stringify(receipt, null, 2) + '\n')
  console.log(`Compiled ${receipt.pages} pages with HBuilderX ${version}. Build receipt: ${paths.receiptPath}`)
  return receipt
}

if (require.main === module) {
  try {
    const { values } = parseArgs({ options: { mode: { type: 'string', default: 'production' } } })
    build({ mode: values.mode })
  } catch (error) { console.error(`ERROR: ${error.message}`); process.exitCode = 1 }
}

module.exports = { build }
