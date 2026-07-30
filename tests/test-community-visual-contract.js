const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const community = fs.readFileSync(path.join(root, 'pages/community/community.uvue'), 'utf8')

assert.match(community, /<view v-if="b\.type === 'plane'" class="plane-banner-art">/)
assert.match(community, /plane-banner-blue-panel/)
assert.match(community, /plane-banner-plane-main/)
assert.match(community, /plane-banner-plane-blue/)
assert.match(community, /plane-banner-plane-pink/)
assert.match(community, /uni\.navigateTo\(\{ url: '\/pagesSub\/community\/paper-plane' \}\)/)

assert.match(community, /\.feature\.type-plane\s*\{[\s\S]*?background:\s*var\(--accent-bg\);/)
assert.match(community, /\.feature\.type-plane\s*\{[\s\S]*?border:\s*1px solid var\(--accent\);/)
assert.match(community, /\.feature\.type-plane\s*\{[\s\S]*?box-shadow:\s*var\(--shadow-sm\);/)
assert.match(community, /\.feature\.type-plane \.feature-desc\s*\{[\s\S]*?max-width:\s*56%;/)
assert.match(community, /\.feature\.type-plane \.feature-title\s*\{[\s\S]*?max-width:\s*62%;/)

assert.match(community, /\.topic-panel\s*\{[\s\S]*?padding:\s*8px 12px;/)
assert.match(community, /\.topic-panel-head\s*\{[\s\S]*?margin-bottom:\s*4px;/)
assert.match(community, /\.topic-feature\s*\{[\s\S]*?gap:\s*8px;[\s\S]*?padding:\s*8px;/)
assert.match(community, /\.topic-feature-cover\s*\{[\s\S]*?width:\s*56px;[\s\S]*?height:\s*56px;/)
assert.match(community, /\.topic-grid\s*\{[\s\S]*?gap:\s*4px 6px;[\s\S]*?margin-top:\s*6px;/)
assert.match(community, /\.topic-grid-item\s*\{[\s\S]*?height:\s*40px;[\s\S]*?padding:\s*4px 6px;/)
assert.match(community, /\.publish-fab\s*\{[\s\S]*?bottom:\s*calc\(50px \+ 48px \+ env\(safe-area-inset-bottom\)\)/)

console.log('community visual contract passed')
