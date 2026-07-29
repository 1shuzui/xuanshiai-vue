const assert = require('assert')
const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'pages', 'auth', 'login.uvue')
const source = fs.readFileSync(filePath, 'utf8')

assert.match(source, /import\s*\{\s*setAuthTokens\s*\}\s*from\s*['"]@\/api\/config\.uts['"]/, 'login page must import local session storage')
assert.match(source, /const\s+startLocalDemoSession\s*=\s*\(\)\s*:\s*boolean\s*=>/, 'login page must define startLocalDemoSession')
assert.match(source, /const\s+handleLocalLogin\s*=\s*\(\)\s*=>/, 'login page must define handleLocalLogin')
assert.doesNotMatch(source, /loginWithMockSms|auth\/sms\/send|auth\/phone\/login/, 'login page must not retain the remote SMS login flow')

console.log('PASS login.uvue debug login guard')
