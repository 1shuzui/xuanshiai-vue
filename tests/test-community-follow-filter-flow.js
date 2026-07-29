const assert = require('assert')
const fs = require('fs')
const path = require('path')

const read = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8')
const page = read('pages/community/community.uvue')
const api = read('api/community.uts')

assert.match(page, /\{ key: 'likedUsers', label: '收藏' \}/, 'follow tab must name the saved-user filter 收藏')

const unfollowStart = page.indexOf('const handleUnfollow =')
const unfollowEnd = page.indexOf('const handleApply =', unfollowStart)
assert.ok(unfollowStart >= 0 && unfollowEnd > unfollowStart, 'unfollow handler must exist')
const unfollow = page.slice(unfollowStart, unfollowEnd)
assert.match(
  unfollow,
  /syncFollowed\(userId, false\)\s*if \(currentTab\.value === 'follow'\) \{\s*await reload\(\)\s*\}/,
  'unfollow must reload the active follow filter after updating the shared state',
)

const followFilterStart = api.indexOf("if (tab == 'follow')")
const cityFilterStart = api.indexOf("} else if (tab == 'city')", followFilterStart)
assert.ok(followFilterStart >= 0 && cityFilterStart > followFilterStart, 'follow filtering branch must exist')
const followFilter = api.slice(followFilterStart, cityFilterStart)
assert.match(followFilter, /filter == 'following'[\s\S]*?d\.followed == true/, '关注 filter must only use follow state')
assert.match(followFilter, /const likedU = d\.user != null && isLikedUser\(d\.user\.id as number\)/, '全部 filter must identify saved users')
assert.match(followFilter, /if \(!followed && !likedU\) continue/, '全部 filter must be the union of follow and saved users')

const visibleInFollowTab = (item, filter) => {
  if (filter === 'following') return item.followed
  if (filter === 'likedUsers') return item.saved
  if (filter === 'all') return item.followed || item.saved
  throw new Error('unexpected filter')
}

const onlyFollowedAfterUnfollow = { followed: false, saved: false }
assert.equal(visibleInFollowTab(onlyFollowedAfterUnfollow, 'all'), false, 'an unfollowed-only user must leave 全部')
assert.equal(visibleInFollowTab(onlyFollowedAfterUnfollow, 'following'), false, 'an unfollowed-only user must leave 关注')

const savedAndFollowedAfterUnfollow = { followed: false, saved: true }
assert.equal(visibleInFollowTab(savedAndFollowedAfterUnfollow, 'all'), true, 'a saved user remains in 全部 after unfollow')
assert.equal(visibleInFollowTab(savedAndFollowedAfterUnfollow, 'following'), false, 'a saved user must leave 关注 after unfollow')
assert.equal(visibleInFollowTab(savedAndFollowedAfterUnfollow, 'likedUsers'), true, 'a saved user remains in 收藏 after unfollow')

console.log('PASS community follow and saved-user filter flow')
