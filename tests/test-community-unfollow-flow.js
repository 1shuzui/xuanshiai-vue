const assert = require('assert')
const fs = require('fs')
const path = require('path')

const read = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8')
const card = read('components/XsaDynamicCard.uvue')
const page = read('pages/community/community.uvue')
const postDetail = read('pages/community/post-detail.uvue')
const topicDetail = read('pages/community/topic-detail.uvue')
const apiIndex = read('api/index.uts')

assert.match(card, /unfollow:\s*\[userId:\s*number\]/, 'dynamic card must emit an unfollow event')
assert.match(
  card,
  /if\s*\(followed\.value\)\s*\{\s*emit\('unfollow',\s*props\.dynamic\.user\.id\)\s*return\s*\}/,
  'clicking an already-followed button must request confirmation instead of changing state',
)
assert.match(page, /@unfollow="handleUnfollow"/, 'community page must handle the unfollow event')
assert.match(page, /unfollowUserFromCommunity/, 'community page must call the unfollow API')
assert.match(page, /content:\s*'确定取消关注吗？'/, 'confirmation copy must match the design')
assert.match(page, /cancelText:\s*'取消'/, 'confirmation must offer cancel')
assert.match(page, /cancelColor:\s*'#000000'/, 'cancel action must be black')
assert.match(page, /confirmText:\s*'确定'/, 'confirmation must offer confirm')
assert.match(page, /confirmColor:\s*'#38988D'/, 'confirm action must use the community green')
assert.match(page, /uni\.showToast\(\{\s*title:\s*'已取消关注',\s*icon:\s*'none'/, 'success feedback must use the no-icon toast')
assert.match(apiIndex, /\bunfollowUserFromCommunity\b/, 'API barrel must export the unfollow API')

for (const [name, source] of [
  ['post detail', postDetail],
  ['topic detail', topicDetail],
]) {
  assert.match(source, /@unfollow="onUnfollow"/, `${name} must handle the unfollow event`)
  assert.match(source, /unfollowUserFromCommunity/, `${name} must call the unfollow API`)
  assert.match(source, /content:\s*'确定取消关注吗？'/, `${name} must use the confirmation copy`)
  assert.match(source, /cancelColor:\s*'#000000'/, `${name} cancel action must be black`)
  assert.match(source, /confirmColor:\s*'#38988D'/, `${name} confirm action must be green`)
  assert.match(source, /uni\.showToast\(\{\s*title:\s*'已取消关注',\s*icon:\s*'none'/, `${name} must show cancellation feedback`)
}

console.log('PASS community unfollow flow')
