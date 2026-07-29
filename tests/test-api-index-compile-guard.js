const assert = require('assert')
const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'api', 'index.uts')
const source = fs.readFileSync(filePath, 'utf8')
const userApi = fs.readFileSync(path.join(__dirname, '..', 'api', 'user.uts'), 'utf8')

assert.match(source, /\bdeleteDynamic\b/, 'api/index.uts must re-export deleteDynamic')
assert.match(source, /\bdeleteComment\b/, 'api/index.uts must re-export deleteComment')
for (const name of ['getUserProfileUnlockStatus', 'unlockUserProfile']) {
  assert.match(source, new RegExp(`\\b${name}\\b`), `api/index.uts must re-export ${name}`)
  assert.match(userApi, new RegExp(`export async function ${name}\\b`), `api/user.uts must implement ${name}`)
}

console.log('PASS api/index.uts export guard')
