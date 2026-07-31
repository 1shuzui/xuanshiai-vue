const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8')

const paperPlane = read('pagesSub', 'community', 'paper-plane.uvue')
const postDetail = read('pagesSub', 'community', 'post-detail.uvue')
const publish = read('pagesSub', 'community', 'publish.uvue')
const topicDetail = read('pagesSub', 'community', 'topic-detail.uvue')
const userDetail = read('pagesSub', 'userExtra', 'user', 'detail.uvue')
const userEdit = read('pagesSub', 'userExtra', 'user', 'edit.uvue')
const userApi = read('api', 'user.uts')
const apiIndex = read('api', 'index.uts')

// Paper-plane cleanup and idempotency recovery must survive page navigation.
assert.match(paperPlane, /onUnload\(\(\) => \{[\s\S]*?cleanupPaperPlaneMedia\(\)[\s\S]*?discardPendingSendKey\(\)[\s\S]*?discardPendingReplyKey\(\)/)
assert.match(paperPlane, /const shouldDiscardPaperPlaneKey = \(res: any\): boolean/)
assert.match(paperPlane, /replyPaperPlane\([\s\S]*?shouldDiscardPaperPlaneKey\(res\)[\s\S]*?discardPendingReplyKey\(\)/)
assert.match(paperPlane, /sendPaperPlane\([\s\S]*?shouldDiscardPaperPlaneKey\(res\)[\s\S]*?discardPendingSendKey\(\)/)
assert.match(paperPlane, /data != null && data\.message != null[\s\S]*?res\.message != null/)

// Both detail feeds support failure-closed unfollow without hard-coded modal colors.
for (const [name, source] of [['post detail', postDetail], ['topic detail', topicDetail]]) {
  assert.match(source, /@unfollow="onUnfollow"/, `${name} must listen for the card unfollow event`)
  assert.match(source, /unfollowUserFromCommunity/, `${name} must call the real unfollow API`)
  assert.match(source, /unfollowPendingUserId/, `${name} must suppress duplicate unfollow requests`)
  assert.match(source, /uni\.showModal\([\s\S]*?取消关注失败，请重试/, `${name} must confirm and report unfollow failures`)
  assert.doesNotMatch(source, /cancelColor:|confirmColor:/, `${name} modal must use platform colors`)
}

// User decision: keep the visible comment reaction wording as 点赞/已赞.
assert.match(postDetail, /c\.liked \? '已赞' : '点赞'/)
assert.match(postDetail, /pendingCommentKey/)
assert.match(topicDetail, /@scrolltolower="loadMore"/)
assert.match(topicDetail, /topicLoadSeq/)

// Only seven content-mutation invalidations remain; text/topic field changes rely on fingerprints.
assert.equal((publish.match(/invalidatePendingPublishKey\(\)/g) || []).length, 7)
assert.match(publish, /imageMediaIds/)
assert.match(publish, /videoMediaId/)

// FastAPI profile contracts used by the two user pages.
assert.match(userApi, /url: '\/users\/' \+ userId \+ '\/profile'/)
assert.match(userApi, /export async function getOwnProfile\(\)/)
assert.match(userApi, /url: '\/users\/me\/profile'/)
assert.match(userApi, /export async function updateOwnProfile\(data: any\)/)
assert.match(userApi, /method: 'PATCH'/)
assert.match(userApi, /export async function getOwnPreferences\(\)/)
assert.match(userApi, /export async function updateOwnPreferences\(data: any\)/)
assert.match(userApi, /url: '\/users\/me\/preferences'/)
for (const name of ['getOwnProfile', 'updateOwnProfile', 'getOwnPreferences', 'updateOwnPreferences']) {
  assert.match(apiIndex, new RegExp(`\\b${name}\\b`), `${name} must be exported from the API barrel`)
}

// Public profile is driven by the server envelope and has explicit states, with no query bypass/paywall.
assert.match(userDetail, /getUserDetail/)
assert.match(userDetail, /envelope\.card/)
assert.match(userDetail, /envelope\.profile/)
assert.match(userDetail, /refreshLockedView/)
assert.match(userDetail, /detailLoading/)
assert.match(userDetail, /detailError/)
assert.match(userDetail, /action-text="重试"/)
assert.doesNotMatch(userDetail, /viewerVIP|profile-unlocks|立即解锁/)

// Edit page loads and saves profile/preferences instead of claiming a local-only success.
assert.match(userEdit, /getOwnProfile/)
assert.match(userEdit, /getOwnPreferences/)
assert.match(userEdit, /await updateOwnProfile\(/)
assert.match(userEdit, /await updateOwnPreferences\(/)
assert.match(userEdit, />基础信息</)
assert.match(userEdit, />四重认证</)
assert.match(userEdit, />自我介绍</)
assert.match(userEdit, />婚姻状况</)
assert.match(userEdit, />择偶要求</)
assert.match(userEdit, /saving/)
assert.match(userEdit, /loadError/)
assert.doesNotMatch(userEdit, /选择器开发中|保存成功[\s\S]{0,120}setTimeout/)

console.log('PASS six-page reconstruction contract')
