const assert = require('assert')
const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(
  path.join(__dirname, '..', 'pages', 'community', 'post-detail.uvue'),
  'utf8',
)

assert.match(
  source,
  /const syncFollowed\s*=\s*\(userId:\s*number,\s*followed:\s*boolean\)\s*=>/,
  'post detail must provide a single follow-state synchronizer',
)
assert.match(
  source,
  /syncFollowed\(userId,\s*true\)/,
  'following from post detail must refresh the card state',
)
assert.match(
  source,
  /syncFollowed\(userId,\s*false\)/,
  'unfollowing from post detail must refresh the card state',
)
assert.match(source, /uni\.showToast\(\{\s*title:\s*'已关注',\s*icon:\s*'none'/, 'follow success must be visible')
assert.match(source, /uni\.showToast\(\{\s*title:\s*'关注失败，请重试',\s*icon:\s*'none'/, 'follow failure must be visible')

console.log('PASS post detail follow state sync')
