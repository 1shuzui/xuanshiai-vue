const assert = require('assert')
const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'api', 'index.uts')
const source = fs.readFileSync(filePath, 'utf8')

assert.match(source, /\bdeleteDynamic\b/, 'api/index.uts must re-export deleteDynamic')
assert.match(source, /\bdeleteComment\b/, 'api/index.uts must re-export deleteComment')

console.log('PASS api/index.uts community export guard')
