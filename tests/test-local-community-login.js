const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const config = fs.readFileSync(path.join(root, 'api', 'config.uts'), 'utf8')
const login = fs.readFileSync(path.join(root, 'pages', 'auth', 'login.uvue'), 'utf8')
const community = fs.readFileSync(path.join(root, 'api', 'community.uts'), 'utf8')

assert.match(config, /export const USE_MOCK = true/, 'local build must enable bundled mock data')
assert.match(login, /const startLocalDemoSession = \(\): boolean =>/, 'login page must define a local demo session')
assert.match(login, /setAuthTokens\('local_demo_access_token', 'local_demo_refresh_token'\)/, 'local login must persist demo tokens')
assert.match(login, /uni\.setStorageSync\('xsa_user_id', 1\)/, 'local login must persist the mock user id')
assert.match(login, /uni\.switchTab\(\{\s*url: '\/pages\/community\/community'/, 'local login must open the community tab')
assert.doesNotMatch(login, /loginWithMockSms|auth\/sms\/send|auth\/phone\/login/, 'local login must not request the SMS backend')
assert.match(community, /if \(USE_MOCK\) \{\s*const filtered = filterDynamics/, 'community list must use mock dynamics in local mode')

console.log('PASS local login opens mock community')
