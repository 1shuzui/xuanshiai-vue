const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const sheet = fs.readFileSync(path.join(root, 'components', 'XsaSheet.uvue'), 'utf8')

assert.match(sheet, /\.sheet-header\s*\{[\s\S]*flex-direction:\s*row[\s\S]*justify-content:\s*center[\s\S]*position:\s*relative/)
assert.match(sheet, /\.sheet-title\s*\{[\s\S]*max-width:\s*calc\(100% - 104px\)[\s\S]*text-align:\s*center/)
assert.match(sheet, /\.close-btn\s*\{[\s\S]*position:\s*absolute[\s\S]*right:\s*14px[\s\S]*width:\s*44px[\s\S]*height:\s*44px/)
assert.match(sheet, /padding:\s*16px 18px calc\(24px \+ env\(safe-area-inset-bottom\)\)/)

console.log('sheet reconstruction contract passed')
