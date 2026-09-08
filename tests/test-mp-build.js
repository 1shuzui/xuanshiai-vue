const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { build } = require('../scripts/build-mp-weixin.cjs')
const { inspectArtifact } = require('../scripts/verify-mp-weixin.cjs')
const { fixture } = require('./mp-artifact-fixture.cjs')

const scenarios = [
  ['exit 0 with login prompt', () => ({ status: 0, stdout: '此功能需要先登录' }), /did not complete/],
  ['success text with no new files', () => ({ status: 0, stdout: '编译成功' }), /ENOENT/],
  ['incomplete new page', f => { f.emit(); fs.unlinkSync(path.join(f.artifactPath, 'feature/detail.wxml')); return { status: 0, stdout: '编译成功' } }, /detail.wxml/],
  ['source changed during compile', f => { f.emit(); fs.appendFileSync(path.join(f.root, 'pages/home.uvue'), 'changed'); return { status: 0, stdout: '编译成功' } }, /Source changed/],
  ['manifest configuration changed during compile', f => { f.emit(); f.write(path.join(f.root, 'manifest.json'), { 'mp-weixin': { appid: null } }); return { status: 0, stdout: '编译成功' } }, /Source changed/],
  ['compiler nonzero after success text', f => { f.emit(); return { status: 1, stdout: '编译成功' } }, /did not complete/]
]
for (const [name, compile, message] of scenarios) {
  const f = fixture()
  try {
    f.receipt() // Pre-existing valid output must never be reused by a failed attempt.
    assert.throws(() => build({ projectRoot: f.root, compiler: args => args[0] === '--help'
      ? { status: 0, stdout: 'HBuilderX(v5.24.2026081301)' } : compile(f) }), message)
    assert.equal(fs.existsSync(f.receiptPath), false, 'failed build must not leave a receipt')
    console.log(`PASS ${name}`)
  } finally { f.cleanup() }
}
const f = fixture()
try {
  let compileArgs
  const result = build({ projectRoot: f.root, compiler: args => {
    if (args[0] === '--help') return { status: 0, stdout: 'HBuilderX(v5.24.2026081301)' }
    compileArgs = args
    assert.equal(fs.existsSync(f.artifactPath), false, 'clear old artifact before compiling')
    // HBuilderX 5.24 writes the CLI AppID into manifest.json, even with upload disabled.
    const manifestPath = path.join(f.root, 'manifest.json')
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    manifest['mp-weixin'].appid = args.includes('--appid') ? args[args.indexOf('--appid') + 1] : null
    f.write(manifestPath, JSON.stringify(manifest, null, 4).replace(/\n/g, '\r\n') + '\r\n')
    f.emit()
    return { status: 0, stdout: '项目 编译成功。' }
  } })
  assert.deepEqual(compileArgs, ['publish', 'mp-weixin', '--project', fs.realpathSync(f.root), '--appid', 'wx1234567890abcdef', '--upload', 'false', '--sourceMap', 'false'])
  assert.equal(result.compilerVersion, '5.24.2026081301')
  assert.match(result.commit, /^[0-9a-f]{40}$/)
  assert.equal(inspectArtifact({ ...f.options, requireBuild: true }).passed, true)
  console.log('PASS fresh production build preserves AppID, accepts compiler formatting and records verified output, version and frontend commit')
} finally { f.cleanup() }

const missingId = fixture()
try {
  missingId.write(path.join(missingId.root, 'manifest.json'), { 'mp-weixin': { appid: null } })
  assert.throws(() => build({ projectRoot: missingId.root, compiler: args => {
    assert.deepEqual(args, ['--help'], 'missing AppID must stop before the compiler writes configuration')
    return { status: 0, stdout: 'HBuilderX(v5.24.2026081301)' }
  } }), /mp-weixin.appid/)
  assert.equal(fs.existsSync(missingId.receiptPath), false)
  console.log('PASS missing WeChat AppID stops before compilation')
} finally { missingId.cleanup() }
