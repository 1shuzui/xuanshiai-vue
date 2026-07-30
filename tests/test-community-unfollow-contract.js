const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const card = fs.readFileSync(path.join(root, 'components', 'XsaDynamicCard.uvue'), 'utf8')
const community = fs.readFileSync(path.join(root, 'pages', 'community', 'community.uvue'), 'utf8')

assert.match(card, /unfollow:\s*\[userId:\s*number\]/)
assert.match(card, /if \(followed\.value\)[\s\S]*?emit\('unfollow', props\.dynamic\.user\.id\)/)

assert.match(community, /@unfollow="handleUnfollow"/)
assert.match(community, /unfollowUserFromCommunity/)
assert.match(community, /const syncFollowed = \(userId: number, followed: boolean\)/)
assert.match(community, /uni\.showModal\([\s\S]*?const res = await unfollowUserFromCommunity\(userId\)/)
assert.match(community, /取消关注失败，请重试/)
assert.doesNotMatch(community, /cancelColor:|confirmColor:/)

assert.match(community, /label:\s*'喜欢'/)
assert.match(community, /const isValidCity = \(name: string\)/)
assert.doesNotMatch(community, /source=community/)
assert.match(community, /bottom:\s*calc\(50px \+ 48px \+ env\(safe-area-inset-bottom\)\)/)

console.log('community unfollow contract passed')
