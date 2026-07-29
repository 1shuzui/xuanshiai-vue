const assert = require('assert')
const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'api', 'community.uts')
const source = fs.readFileSync(filePath, 'utf8')

for (const name of ['mapPaperPlane', 'mapPlaneConversation']) {
  const declarations = source.match(new RegExp(`^function\\s+${name}\\s*\\(`, 'gm')) || []
  assert.strictEqual(declarations.length, 1, `${name} must be declared exactly once`)
}

const counts = new Map()
for (const match of source.matchAll(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/gm)) {
  counts.set(match[1], (counts.get(match[1]) || 0) + 1)
}
const duplicates = [...counts.entries()]
  .filter(([, count]) => count > 1)
  .map(([name, count]) => `${name}:${count}`)
assert.deepStrictEqual(duplicates, [], `community.uts has duplicate top-level functions: ${duplicates.join(', ')}`)

console.log('PASS api/community.uts paper-plane helper guard')
