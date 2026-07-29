const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const config = fs.readFileSync(path.join(root, 'api', 'config.uts'), 'utf8')
const login = fs.readFileSync(path.join(root, 'pages', 'auth', 'login.uvue'), 'utf8')
const community = fs.readFileSync(path.join(root, 'api', 'community.uts'), 'utf8')

assert.match(config, /export const USE_MOCK = false/, 'community must remain in live HTTP mode')
assert.match(login, /const startLocalDemoSession = \(\): boolean =>/, 'login page must define a local demo session')
assert.match(login, /setAuthTokens\('local_demo_access_token', 'local_demo_refresh_token'\)/, 'local login must persist demo tokens')
assert.match(login, /uni\.setStorageSync\(CURRENT_USER_ID_KEY, 1\)/, 'local login must persist the current user id')
assert.match(login, /uni\.switchTab\(\{\s*url: '\/pages\/community\/community'/, 'local login must open the community tab')
assert.doesNotMatch(login, /loginWithMockSms|auth\/sms\/send|auth\/phone\/login/, 'local login must not request the SMS backend')
assert.match(community, /url: '\/community\/posts'/, 'community list must use the live API endpoint')

console.log('PASS local debug login establishes the session identity')
