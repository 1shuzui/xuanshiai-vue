const assert = require('assert')
const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(path.join(__dirname, '..', 'components', 'XsaDynamicCard.uvue'), 'utf8')

function includes(value, label) {
  assert.ok(source.includes(value), `${label} should include ${value}`)
}

function styleBlock(selector) {
  const start = source.indexOf(selector)
  const end = source.indexOf('\n}', start)
  assert.ok(start >= 0, `Missing ${selector} style block`)
  assert.ok(end > start, `Unclosed ${selector} style block`)
  return source.slice(start, end)
}

includes(':class="genderClass"', 'gender icon')
includes('class="relation-row header-relation-row"', 'header relation tag row')
includes('class="location-time-row"', 'location and time row')
includes('class="time time-bottom text-muted"', 'bottom-aligned post time')
includes('class="icon collect-icon"', 'collect icon')
includes("if (s == '男' || s == 'male' || s == 'm') return 'male'", 'male gender class')
includes("if (s == '女' || s == 'female' || s == 'f') return 'female'", 'female gender class')

assert.match(styleBlock('.gender-icon.male'), /color:\s*var\(--plane-blue\);/, 'male gender icon should use blue')
assert.match(styleBlock('.gender-icon.female'), /color:\s*var\(--plane-pink\);/, 'female gender icon should use pink')
assert.match(styleBlock('.gender-icon'), /font-size:\s*14px;/, 'gender icon should be slightly larger')
assert.match(styleBlock('.relation-tag'), /background:\s*var\(--accent-bg\);/, 'header relation tags should use the light green background')
assert.match(styleBlock('.relation-tag'), /color:\s*var\(--accent2\);/, 'header relation tags should use dark green text')
assert.match(styleBlock('.topic-chip'), /background:\s*var\(--accent-bg\);/, 'topic tag should use the same light green background as the header relation tags')
assert.match(styleBlock('.topic-hash'), /color:\s*var\(--accent2\);/, 'topic hash should use dark green text')
assert.match(styleBlock('.topic-label'), /color:\s*var\(--accent2\);/, 'topic label should use dark green text')
assert.match(styleBlock('.meta-text'), /color:\s*var\(--accent2\);/, 'profile metadata should use dark green text')
assert.ok(!source.includes('class="meta-text text-muted"'), 'profile metadata should not inherit muted text styling')
assert.ok(!source.includes('class="tag-row"'), 'the tag row below profile metadata should be removed')
assert.ok(!source.includes('const tagList = computed'), 'unused tag-row data should be removed with the tag row')
assert.match(styleBlock('.location-time-row'), /justify-content:\s*space-between;/, 'time should align to the location row end')
assert.match(styleBlock('.collect-icon'), /font-size:\s*24px;/, 'collect icon should be enlarged')

console.log('PASS community dynamic card layout contract')
