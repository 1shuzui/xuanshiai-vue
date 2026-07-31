const assert = require('assert')
const fs = require('fs')
const path = require('path')

const read = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8')
const page = read('pages/community/community.uvue')
const api = read('api/community.uts')

assert.match(page, /\{ key: 'likedUsers', label: '喜欢' \}/, 'follow tab must name the liked-user filter 喜欢')

const unfollowStart = page.indexOf('const handleUnfollow =')
const unfollowEnd = page.indexOf('const handleApply =', unfollowStart)
assert.ok(unfollowStart >= 0 && unfollowEnd > unfollowStart, 'unfollow handler must exist')
const unfollow = page.slice(unfollowStart, unfollowEnd)
assert.match(
  unfollow,
  /syncFollowed\(userId, false\)\s*if \(currentTab\.value === 'follow'\) reload\(\)/,
  'unfollow must refresh the active follow feed after shared-state synchronization',
)

const modeStart = api.indexOf('function feedModeFromTab')
const modeEnd = api.indexOf('/** 真路径拉一页帖子并 map */', modeStart)
assert.ok(modeStart >= 0 && modeEnd > modeStart, 'live feed mode mapper must exist')
const modes = api.slice(modeStart, modeEnd)
assert.match(modes, /filter == 'following'.*mode: 'following'/s, '关注 filter must request followed users from the backend')
assert.match(modes, /filter == 'likedUsers'.*mode: 'liked_users'/s, '喜欢 filter must request liked users from the backend')
assert.match(modes, /mode: 'following_and_liked'/, '全部 filter must request the backend union')
assert.doesNotMatch(modes, /filterDynamics|isLikedUser/, 'the live feed must not fake union pagination on the client')

console.log('PASS community follow and liked-user filter flow')
