const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath))

const config = read('api/config.uts')
const login = read('pages/auth/login.uvue')
const communityApi = read('api/community.uts')
const apiIndex = read('api/index.uts')
const pagesJson = read('pages.json')

assert.match(config, /export const USE_MOCK = false/, 'community must remain in live HTTP mode')
assert.match(login, /startLocalDemoSession/, 'debug login must establish a local session')
assert.match(login, /setAuthTokens\('local_demo_access_token', 'local_demo_refresh_token'\)/, 'debug login must persist tokens')
assert.match(login, /uni\.setStorageSync\(CURRENT_USER_ID_KEY, 1\)/, 'debug login must persist xsa_user_id')
assert.match(login, /uni\.switchTab\(\{\s*url: '\/pages\/community\/community'/, 'debug login must open the community tab')
assert.doesNotMatch(login, /loginWithMockSms|auth\/sms\/send|auth\/phone\/login/, 'debug login must not depend on the SMS backend')

for (const relativePath of [
  'pages/community/community.uvue',
  'pages/community/publish.uvue',
  'pages/community/topic-list.uvue',
  'pages/community/topic-detail.uvue',
  'pages/community/post-detail.uvue',
  'pages/community/paper-plane.uvue',
  'pages/community/notifications.uvue',
  'pages/index/top-placement.uvue'
]) {
  assert.ok(exists(relativePath), `${relativePath} must exist`)
}

for (const route of [
  'pages/community/community',
  'pages/community/topic-list',
  'pages/community/topic-detail',
  'pages/community/post-detail',
  'pages/community/paper-plane',
  'pages/community/notifications',
  'pages/index/top-placement'
]) {
  assert.ok(pagesJson.includes(route), `pages.json must register ${route}`)
}

for (const name of [
  'getDynamicList',
  'getDynamicDetail',
  'getTopicList',
  'getTopicDetail',
  'joinTopic',
  'leaveTopic',
  'publishDynamic',
  'commentDynamic',
  'getPaperPlanes',
  'sendPaperPlane',
  'replyPaperPlane',
  'getPaperPlaneConversations',
  'getPaperPlaneMessages',
  'sendPaperPlaneMessage',
  'getCommunityNotifications',
  'markNotificationRead',
  'getCommunityPrivacy',
  'uploadCommunityMedia',
  'deleteCommunityMedia'
]) {
  assert.match(communityApi, new RegExp(`export async function ${name}\\b`), `community API must export ${name}`)
}

assert.match(communityApi, /url: '\/community\/posts'/, 'post publishing must use the live endpoint')
assert.match(communityApi, /'Idempotency-Key'/, 'write requests must carry an idempotency key')
assert.match(communityApi, /image_media_ids/, 'publishing must support uploaded image identifiers')
assert.match(communityApi, /video_media_id/, 'publishing must support an uploaded video identifier')
assert.match(communityApi, /MEDIA_UPLOAD_REQUIRED/, 'temporary media must fail closed before publishing')
assert.match(communityApi, /resolveMediaUrl/, 'backend media must be normalized for rendering')

const communityPage = read('pages/community/community.uvue')
const publishPage = read('pages/community/publish.uvue')
const topicPage = read('pages/community/topic-detail.uvue')
const paperPlanePage = read('pages/community/paper-plane.uvue')
const realNameGate = read('utils/realNameGate.uts')

assert.match(communityPage, /guardRealName/, 'community interactions must be real-name gated')
assert.match(publishPage, /publishDynamic/, 'publish page must use the community API')
assert.match(publishPage, /uploadCommunityMedia/, 'publish page must upload selected media')
assert.match(topicPage, /joinTopic/, 'topic page must support joining')
assert.match(topicPage, /leaveTopic/, 'topic page must support leaving')
assert.match(topicPage, /guardRealName/, 'topic interactions must be real-name gated')
assert.match(paperPlanePage, /sendPaperPlane/, 'paper-plane page must use the API')
assert.match(paperPlanePage, /paperPlaneUnreadCount/, 'paper-plane page must retain unread state')
assert.match(realNameGate, /guardRealName/, 'real-name gate helper must be available')
assert.match(realNameGate, /常规社区互动、申请认识、参与话题及带话题发布均仅要求实名通过/, 'community uses the confirmed identity boundary')

for (const name of [
  'getDynamicList',
  'publishDynamic',
  'sendPaperPlane',
  'getPaperPlaneConversations',
  'uploadCommunityMedia',
  'getCommunityPrivacy'
]) {
  assert.ok(apiIndex.includes(name), `api/index must re-export ${name}`)
}

console.log('PASS live community flow contract')
