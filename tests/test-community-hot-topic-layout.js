const assert = require('assert')
const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(
  path.join(__dirname, '..', 'pages', 'community', 'community.uvue'),
  'utf8',
)

assert.match(source, /hotTopics\.slice\(0, 4\)/)
assert.match(source, /\.topic-panel\s*\{[\s\S]*?padding:\s*8px 12px;/)
assert.match(source, /\.topic-panel-head\s*\{[\s\S]*?margin-bottom:\s*4px;/)
assert.match(source, /\.topic-feature\s*\{[\s\S]*?gap:\s*8px;[\s\S]*?padding:\s*8px;/)
assert.match(source, /\.topic-feature-cover\s*\{[\s\S]*?width:\s*56px;[\s\S]*?height:\s*56px;/)
assert.match(source, /\.topic-grid\s*\{[\s\S]*?gap:\s*4px 6px;[\s\S]*?margin-top:\s*6px;/)
assert.match(source, /\.topic-grid-item\s*\{[\s\S]*?height:\s*40px;[\s\S]*?padding:\s*4px 6px;/)

console.log('PASS community hot topic layout')
