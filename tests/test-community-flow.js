/**
 * 社区路由与真实 API 基线守卫。
 * 只断言当前上游已承诺的闭环，避免把已替换的旧视觉实现当作发布门禁。
 */
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { hasRegisteredPage } = require('./page-route-helper.cjs')

const root = path.join(__dirname, '..')
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')
const communityApi = read('api/community.uts')
const userApi = read('api/user.uts')

for (const page of [
  'pages/community/community.uvue',
  'pagesSub/community/publish.uvue',
  'pagesSub/community/topic-list.uvue',
  'pagesSub/community/topic-detail.uvue',
  'pagesSub/community/post-detail.uvue',
  'pagesSub/community/paper-plane.uvue',
  'pagesSub/community/notifications.uvue'
]) {
  assert.ok(fs.existsSync(path.join(root, page)), `${page} must exist`)
}

for (const route of [
  'pages/community/community',
  'pagesSub/community/publish',
  'pagesSub/community/topic-list',
  'pagesSub/community/topic-detail',
  'pagesSub/community/post-detail',
  'pagesSub/community/paper-plane',
  'pagesSub/community/notifications'
]) {
  assert.ok(hasRegisteredPage(root, route), `${route} must be registered`)
}

for (const name of [
  'getDynamicList', 'getDynamicDetail', 'getTopicList', 'getTopicDetail',
  'publishDynamic', 'commentDynamic', 'getPaperPlanes', 'sendPaperPlane',
  'getPaperPlaneMessages', 'sendPaperPlaneMessage', 'getCommunityNotifications',
  'markNotificationRead', 'getCommunityQuotas', 'deleteDynamic', 'deleteComment',
  'reportContent', 'blockUser'
]) {
  assert.match(communityApi, new RegExp(`export async function ${name}\\b`), `${name} must be exported`)
}

assert.match(communityApi, /\/community\/posts/, 'community publishing must use the live endpoint')
assert.match(communityApi, /'Idempotency-Key'/, 'community writes must include an idempotency key')
assert.match(communityApi, /following_and_liked/, 'follow feed must use the backend union mode')
assert.match(communityApi, /liked_users/, 'liked-user feed must have a distinct backend mode')
assert.match(userApi, /export async function likeUser\b/, 'user likes must remain available')
assert.match(userApi, /\/relations\/likes/, 'like state must be checked through the live endpoint')
console.log('PASS community flow')
