const assert = require('assert')
const fs = require('fs')
const path = require('path')

const read = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8')
const card = read('components/XsaDynamicCard.uvue')
const page = read('pages/community/community.uvue')
const api = read('api/community.uts')

assert.match(
  card,
  /const followed = computed\(\(\): boolean => \{\s*return props\.dynamic\.followed === true\s*\}\)/,
  'follow button state must be derived from the parent dynamic state',
)
assert.doesNotMatch(card, /const followed = ref\(/, 'dynamic card must not keep a stale local follow state')
assert.doesNotMatch(card, /followed\.value = true/, 'dynamic card must wait for the parent to confirm a follow-state update')

assert.match(page, /const syncFollowed = \(userId: number, followed: boolean\) => \{/, 'community page must centralize follow-state updates')
assert.match(page, /dynamicList\.value = list\.slice\(\)/, 'community page must replace the list reference after follow-state changes')
assert.match(page, /syncFollowed\(userId, true\)/, 'successful follow must update the shared list state')
assert.match(page, /syncFollowed\(userId, false\)/, 'successful unfollow must update the shared list state')
assert.match(
  page,
  /onShow\(\(\) => \{\s*loadUnread\(\)\s*if \(dynamicList\.value\.length > 0\) \{\s*reload\(\)\s*\}/,
  'community page must refresh any populated tab after returning from detail',
)

const unfollowStart = api.indexOf('export async function unfollowUserFromCommunity')
const unfollowEnd = api.indexOf('/** 删除自己的动态 */', unfollowStart)
assert.ok(unfollowStart >= 0 && unfollowEnd > unfollowStart, 'unfollow API block must exist')
const unfollow = api.slice(unfollowStart, unfollowEnd)
assert.match(unfollow, /const followTabIndex = .*indexOf\('follow'\)/, 'mock unfollow must locate the follow tab')
assert.match(unfollow, /\.splice\(followTabIndex, 1\)/, 'mock unfollow must remove the follow tab')

console.log('PASS community follow-state synchronization contract')
