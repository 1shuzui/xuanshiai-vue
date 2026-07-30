const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const card = fs.readFileSync(path.join(root, 'components', 'XsaDynamicCard.uvue'), 'utf8')

assert.doesNotMatch(card, /header-relation-row/)
assert.match(card, /meta-row[\s\S]*relation-row[\s\S]*tag-row/)

assert.match(card, /out\.push\('已实名'\)/)
assert.match(card, /if \(out\.length >= 3\) return out/)

assert.match(card, /class="meta-text"/)
assert.match(card, /\.meta-text\s*\{[\s\S]*color:\s*var\(--accent\)/)
assert.doesNotMatch(card, /gender-icon\.male|gender-icon\.female|--plane-blue|--plane-pink/)

assert.match(card, /location-time-row/)
assert.match(card, /\.location\s*\{[\s\S]*min-width:\s*0/)
assert.match(card, /\.location \.text\s*\{[\s\S]*overflow:\s*hidden[\s\S]*text-overflow:\s*ellipsis[\s\S]*white-space:\s*nowrap/)

assert.match(card, /\.relation-tag\s*\{[\s\S]*background:\s*var\(--accent-bg\)/)
assert.match(card, /\.topic-chip\s*\{[\s\S]*background:\s*var\(--accent-bg\)/)
assert.doesNotMatch(card, /translateY\(4px\)/)
assert.doesNotMatch(card, /collect-icon[\s\S]{0,100}font-size:\s*24px/)

console.log('dynamic card reconstruction contract passed')
