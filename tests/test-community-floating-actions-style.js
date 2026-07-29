const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const dynamicCard = fs.readFileSync(path.join(root, 'components', 'XsaDynamicCard.uvue'), 'utf8')
const communityPage = fs.readFileSync(path.join(root, 'pages', 'community', 'community.uvue'), 'utf8')

assert.match(
  dynamicCard,
  /\.action-item \.collect-icon\s*\{[^}]*font-size:\s*24px;/,
  'collect icon should override the generic action icon size'
)
assert.match(
  communityPage,
  /\.publish-fab\s*\{[^}]*bottom:\s*calc\(50px \+ 48px \+ env\(safe-area-inset-bottom\)\);/,
  'publish floating action should sit 24px higher above the tab bar'
)

console.log('PASS community floating actions style contract')
