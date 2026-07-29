const assert = require('assert')
const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'pages', 'community', 'post-detail.uvue')
const source = fs.readFileSync(filePath, 'utf8')
const loadStart = source.indexOf('const load = async () => {')
const loadEnd = source.indexOf('\n\tconst commentFingerprint', loadStart)

assert.notStrictEqual(loadStart, -1, 'post-detail.uvue must define load')
assert.notStrictEqual(loadEnd, -1, 'post-detail.uvue must define commentFingerprint after load')

const loadSource = source.slice(loadStart, loadEnd)
assert.strictEqual(
  (loadSource.match(/\} catch \(e\) \{/g) || []).length,
  1,
  'load must have exactly one catch block'
)
assert.strictEqual(
  (loadSource.match(/\} finally \{/g) || []).length,
  1,
  'load must have exactly one finally block'
)

console.log('PASS pages/community/post-detail.uvue load structure guard')
