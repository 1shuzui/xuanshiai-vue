const assert = require('assert')
const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(path.join(__dirname, '..', 'pages', 'community', 'community.uvue'), 'utf8')

function styleBlock(startSelector, endSelector) {
  const start = source.indexOf(startSelector)
  const end = source.indexOf(endSelector, start)
  assert.ok(start >= 0, `Missing ${startSelector} style block`)
  assert.ok(end > start, `Missing ${endSelector} after ${startSelector}`)
  return source.slice(start, end)
}

function includes(block, value, label) {
  assert.ok(block.includes(value), `${label} should include ${value}`)
}

const planeCard = styleBlock('.feature.type-plane {', '.feature.type-activity {')
const planeContent = styleBlock('.feature.type-plane .feature-kicker {', '.plane-banner-art {')
const planeArt = styleBlock('.plane-banner-blue-panel {', '.feature-title {')

includes(planeCard, 'background: var(--accent-bg);', 'paper-plane banner fill')
includes(planeCard, 'border: 1px solid var(--accent);', 'paper-plane banner border')
assert.strictEqual((planeContent.match(/color: var\(--accent2\);/g) || []).length, 4, 'paper-plane foreground text should use the deep green')
includes(planeContent, 'background: var(--paper);', 'paper-plane button fill')
includes(planeArt, 'background: var(--accent);', 'paper-plane decoration')
includes(planeArt, 'color: var(--sage);', 'main paper plane')
assert.strictEqual((planeArt.match(/color: var\(--soft\);/g) || []).length, 2, 'two small paper planes should use the soft green')

console.log('PASS community paper-plane banner green palette')
