const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const source = fs.readFileSync(path.join(root, 'components', 'XsaApplySheet.uvue'), 'utf8')
const deferred = fs.readFileSync(path.join(root, 'RECONSTRUCTION_DEFERRED_CHANGES.md'), 'utf8')

assert.match(source, /仅需实名认证；学历不作为拦截条件/, 'apply sheet must state the approved real-name-only gate')
assert.match(
  source,
  /res != null && res\.success == true && data != null && data\.success == true/,
  'apply success must require the explicit business success contract'
)
assert.doesNotMatch(
  source,
  /remain\.value = Math\.max\(0, remain\.value - 1\)/,
  'the client must not guess a missing server quota'
)
assert.match(source, /quotaRefreshFailed/, 'quota refresh failure must stay visible to the user')
assert.match(source, /res != null && res\.message != null/, 'standard request errors must keep their message fallback')
assert.match(deferred, /额度以服务端返回为准/, 'quota-related changes must remain explicitly flagged for review')

console.log('PASS apply sheet reconstruction contract')
