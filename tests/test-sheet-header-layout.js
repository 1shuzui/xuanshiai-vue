const assert = require('assert')
const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(path.join(__dirname, '..', 'components', 'XsaSheet.uvue'), 'utf8')

function styleBlock(selector) {
  const start = source.indexOf(selector)
  const end = source.indexOf('\n}', start)
  assert.ok(start >= 0, `Missing ${selector} style block`)
  assert.ok(end > start, `Unclosed ${selector} style block`)
  return source.slice(start, end)
}

const header = styleBlock('.sheet-header')
const closeButton = styleBlock('.close-btn')

assert.match(header, /flex-direction:\s*row;/, 'sheet header should lay out title and close button horizontally')
assert.match(header, /justify-content:\s*center;/, 'sheet title should stay centered')
assert.match(header, /position:\s*relative;/, 'sheet header should anchor the close button')
assert.match(closeButton, /position:\s*absolute;/, 'close button should be positioned independently from the centered title')
assert.match(closeButton, /right:\s*18px;/, 'close button should align with the right edge of the sheet header')
assert.match(closeButton, /top:\s*7px;/, 'close button should vertically align with the sheet title')

console.log('PASS sheet header close-button layout contract')
