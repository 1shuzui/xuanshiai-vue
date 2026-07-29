const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const requestSource = fs.readFileSync(path.join(root, 'api', 'request.uts'), 'utf8')
const configSource = fs.readFileSync(path.join(root, 'api', 'config.uts'), 'utf8')

assert.match(requestSource, /uni\.request\s*\(/, 'real requests must use uni.request')
assert.doesNotMatch(requestSource, /uniCloud\.callFunction/, 'real requests must not use uniCloud')
assert.match(requestSource, /buildApiUrl/, 'real requests must use the configured API URL builder')
assert.match(configSource, /export function buildApiUrl/, 'the configured API URL builder must be available')
assert.match(configSource, /API_BASE_URL/, 'the URL builder must use the local API base URL')
assert.match(configSource, /API_PREFIX/, 'the URL builder must use the API prefix')
assert.match(requestSource, /Authorization/, 'real requests must support bearer authorization')
assert.match(configSource, /export const USE_MOCK = false/, 'frontend must remain in live API mode')

console.log('PASS frontend HTTP request transport contract')
