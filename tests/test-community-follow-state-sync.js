const assert = require('assert')
const fs = require('fs')
const path = require('path')

const read = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8')
const card = read('components/XsaDynamicCard.uvue')
const page = read('pages/community/community.uvue')
const api = read('api/community.uts')

assert.match(
  card,
  /const followed = ref\(props\.dynamic\.followed === true\)/,
  'follow button state must initialize from the parent dynamic state',
)
assert.match(card, /followed\.value = d\.followed === true/, 'dynamic card must synchronize follow updates from the parent')

assert.match(page, /const syncFollowed = \(userId: number, followed: boolean\) => \{/, 'community page must centralize follow-state updates')
assert.match(page, /dynamicList\.value = list\.slice\(\)/, 'community page must replace the list reference after follow-state changes')
assert.match(page, /syncFollowed\(userId, true\)/, 'successful follow must update the shared list state')
assert.match(page, /syncFollowed\(userId, false\)/, 'successful unfollow must update the shared list state')
assert.match(
  page,
  /onShow\(\(\) => \{\s*loadUnread\(\)[\s\S]*?if \(currentTab\.value === 'follow'\) \{\s*reload\(\)\s*\}/,
  'community page must refresh the follow feed after returning from detail',
)

const unfollowStart = api.indexOf('export async function unfollowUserFromCommunity')
const unfollowEnd = api.indexOf('/** 删除自己的动态 */', unfollowStart)
assert.ok(unfollowStart >= 0 && unfollowEnd > unfollowStart, 'unfollow API block must exist')
const unfollow = api.slice(unfollowStart, unfollowEnd)
assert.match(unfollow, /url: '\/users\/' \+ userId \+ '\/follow'/, 'unfollow must target the live follow endpoint')
assert.match(unfollow, /method: 'DELETE'/, 'unfollow must use DELETE')
assert.match(unfollow, /followed: false/, 'unfollow response must confirm the resulting state')

console.log('PASS community follow-state synchronization contract')
