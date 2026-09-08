const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const babel = require('@babel/core')

const source = fs.readFileSync(path.resolve(__dirname, '../api/config.uts'), 'utf8')
const { code } = babel.transformSync(source, {
  filename: 'config.uts', configFile: false, babelrc: false,
  plugins: [[require('@babel/plugin-transform-typescript'), { allExtensions: true }], require('@babel/plugin-transform-modules-commonjs')]
})
for (const [mode, base, socketBase] of [
  ['development', 'http://127.0.0.1:8000', 'ws://127.0.0.1:8000'],
  ['production', 'https://xhztest.xyz', 'wss://xhztest.xyz']
]) {
  const context = { exports: {}, process: { env: { NODE_ENV: mode } } }
  vm.runInNewContext(code, context)
  const api = context.exports
  assert.equal(api.USE_MOCK, false)
  assert.equal(api.API_BASE_URL, base)
  assert.equal(api.LAN_API_BASE_URL, base)
  assert.equal(api.buildApiUrl('/emotion-lab/summary'), base + '/api/v1/emotion-lab/summary')
  assert.equal(api.buildApiUrl('/api/v1/parent/context'), base + '/api/v1/parent/context')
  assert.equal(api.buildWsUrl('/voice/session', 'test token'), socketBase + '/api/v1/voice/session?token=test%20token')
  assert.equal(api.resolveMediaUrl('/storage/uploads/avatar.webp'), base + '/storage/uploads/avatar.webp')
  assert.equal(api.resolveMediaUrl('/static/avatar.jpg'), '/static/avatar.jpg')
  assert.equal(api.buildApiUrl('https://example.test/public'), 'https://example.test/public')
  console.log(`PASS ${mode} uses the correct HTTP, WebSocket and media origin without enabling Mock`)
}
