const path = require('node:path')
const { spawnSync } = require('node:child_process')

// Source and simulated artifact checks run on GitHub without HBuilderX.
const tests = [
  'mock-system', 'api-index-compile-guard', 'fastapi-request-contract',
  'http-request-transport', 'api-environments', 'account-request-isolation',
  'parent-slice', 'parent-audit-regressions', 'parent-chat-subject',
  'emotion-lab-flow', 'debug-login-emotion-lab', 'role-routing',
  'ai-profile-page', 'voice-conversation', 'home-session-flow',
  'six-page-reconstruction-contract', 'vip-card-rendering-flow', 'chat-detail-ui',
  'mp-subpackage-contract', 'mp-media-source', 'icon-catalog',
  'mp-quality-gate', 'mp-build'
]
let failed = 0
for (const test of tests) {
  const result = spawnSync(process.execPath, [path.resolve(__dirname, `../tests/test-${test}.js`)], { stdio: 'inherit', windowsHide: true })
  if (result.status !== 0) { failed++; console.error(`FAIL test-${test}.js`) }
}
console.log(`${tests.length - failed}/${tests.length} frontend source and gate test suites passed; no real mini-program build is claimed by this command.`)
process.exitCode = failed ? 1 : 0
