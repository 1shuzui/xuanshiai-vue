const assert = require('assert')
const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'pages', 'community', 'paper-plane.uvue')
const source = fs.readFileSync(filePath, 'utf8')

for (const name of [
  'pendingSendKey',
  'pendingSendFingerprint',
  'pendingReplyKey',
  'pendingReplyFingerprint',
  'recordTimer',
  'recorderManager',
  'discardPendingSendKey',
  'discardPendingReplyKey',
  'shouldDiscardCreateKey'
]) {
  const declarations = source.match(new RegExp(`\\b(?:const|let|var)\\s+${name}(?:\\s*:\\s*[^=]+)?\\s*=`, 'g')) || []
  assert.strictEqual(declarations.length, 1, `${name} must be declared exactly once`)
}

console.log('PASS pages/community/paper-plane.uvue declaration guard')
